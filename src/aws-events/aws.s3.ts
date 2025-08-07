import { Context } from "aws-lambda";
import { last, pick } from "lodash";
import { getS3Object, s3FileSize } from "../js-media/service.s3";
import { File, ImageBreakpoints } from "../js-media/types";
import { MediaFiles } from "../js-models";
import { MediaFilesInstance } from "../js-media/model.media.files";
import { getImageDimensions } from "../js-media/image.optimization";
import { hashFileName } from "../js-media/utils";
import { createAndUploadVariants } from "../js-media/utils.image.variations";

export async function lambdaHandler(event: any, context: Context) {
  const listeners = {
    "ObjectCreated:Put": handleUpload,
    "ObjectRemoved:Delete": handleDelete,
    // "ObjectRemoved:DeleteMarkerCreated": handleDelete,
  };

  const promises: any = [];
  for (let i = 0; i < event.Records.length; i += 1) {
    const { eventName, s3 } = event.Records[i];
    const handle = listeners[eventName];
    if (!handle) {
      console.error(`Unknown event ${eventName}`, event.Records[i]);
      return;
    }

    const { object, bucket } = s3;
    bucket.region = event.Records[i].awsRegion;
    const objectName = bucket?.name;

    const key = decodeURIComponent(object.key.replace(/\+/g, " "));

    promises.push(handle(key));
  }

  return Promise.allSettled(promises);
}

const handleDelete = async (key: string) => {
  return MediaFiles.destroy({ where: { key }, force: true });
};

const handleUpload = async (key: string) => {
  if (key.includes("/variation_")) {
    return console.info(`This is a variation key::: ${key}`);
  }
  if (key.includes("cache/") || key.includes("tmp/")) {
    return console.info(`This is a cached file::: ${key}`);
  }

  const mediaFile = await MediaFiles.unscoped()
    .findOne({
      where: { key },
      attributes: {
        exclude: ["created_at", "updated_at", "bucket", "admin_id", "store_id", "user_id"],
      },
    })
    .catch((er) => {
      console.log("[[MediaFiles_ERROR]]", er);
    });

  if (!mediaFile) {
    return console.log(`Unknown uploaded file ${key}`);
  }

  const data = await getS3Object(key);
  if (!data) return {};
  const fileName = mediaFile.name || key.split("/").pop() || "";
  const fileSize = await s3FileSize(key);
  console.log("[[fileSize_SIZE]]", fileSize);

  if ((fileSize || 0) < 50 * 1024) return; // less than 50kb

  const file = {
    data: data.Body,
    // encoding: data.encoding,
    mimetype: data.ContentType,
    size: fileSize,
    name: fileName,
    ...({} as any),
  } as File;

  await mediaFile.update({
    mime: file.mimetype,
    size: file.size,
    ...(mediaFile.verified_at == null ? { verified_at: new Date() } : {}),
  });

  console.log("UPDATED_FILE", pick(mediaFile, "file_id", "url", "key", "verified_at"), {
    fileName,
  });

  // process image variations (supported image)
  const processibleImages = [
    "image/png",
    "image/gif",
    "image/jpeg",
    "image/jpg",
    "image/bmp",
    "image/webp",
  ];
  if (processibleImages.includes(file.mimetype)) {
    await processImageVariation(mediaFile, file);
  }
};

const processImageVariation = async (mediaFile: MediaFilesInstance, file: File) => {
  const breakpoints: ImageBreakpoints = {
    // large: 1000,
    medium: 750,
    small: 500,
    thumbnail: 150,
    placeholder: 16,
  };

  // remove already uploaded variations
  if (mediaFile.variants) {
    Object.keys(breakpoints).forEach((key) => {
      if (Object.keys(mediaFile.variants).includes(key)) {
        delete breakpoints[key];
      }
    });
  }

  const { height, width } = await getImageDimensions(file.data);
  const variationFileName = last(mediaFile.key.split("/")) || hashFileName(file.name);
  const isPublic = mediaFile.key.includes("public/");

  const variants = await createAndUploadVariants(file, variationFileName, breakpoints, isPublic);

  await mediaFile.update({ height, width, variants });
};

export const awsS3 = {
  lambdaHandler,
};

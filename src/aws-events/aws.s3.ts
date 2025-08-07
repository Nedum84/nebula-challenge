import { Context } from "aws-lambda";

export async function lambdaHandler(event: any, context: Context) {
  const listeners = {
    "ObjectCreated:Put": handleUpload,
    "ObjectRemoved:Delete": handleDelete,
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
  console.log("[[MEDIA_FILES_DELETE_SKIPPED]] Database operations removed for key:", key);
  return true;
};

const handleUpload = async (key: string) => {
  console.log("[[MEDIA_FILES_FIND_SKIPPED]] Database operations removed for key:", key);
};

export const awsS3 = {
  lambdaHandler,
};

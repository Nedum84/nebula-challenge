import request, { Response } from "supertest";
import { app } from "../../src/app";

interface RequestParams<T> {
  path: string;
  method?: "get" | "post" | "patch" | "delete" | "put";
  payload?: Partial<T>;
  token?: string;
  headers?: Record<string, string>;
}

export const testBaseUrl = "/v1";

// Wrapper around supertest request
export const customRequest = async <T = object>(
  params: RequestParams<T> | string
): Promise<Response> => {
  if (typeof params === "string") {
    // Simple GET request without auth
    return request(app).get(`${testBaseUrl}${params}`);
  }

  const { path, method = "get", payload = {}, token, headers = {} } = params;
  const requestUrl = `${testBaseUrl}${path}`;

  // Add authorization header if token is provided
  if (token) {
    headers["authorization"] = `Bearer ${token}`;
  }

  // Create the appropriate request based on method
  let appRequest;
  switch (method) {
    case "post":
      appRequest = request(app).post(requestUrl).send(payload);
      break;
    case "patch":
      appRequest = request(app).patch(requestUrl).send(payload);
      break;
    case "put":
      appRequest = request(app).put(requestUrl).send(payload);
      break;
    case "delete":
      appRequest = request(app).delete(requestUrl).send(payload);
      break;
    default:
      appRequest = request(app).get(requestUrl);
  }

  // Set all headers
  Object.entries(headers).forEach(([key, value]) => {
    appRequest.set(key, value);
  });

  return appRequest;
};
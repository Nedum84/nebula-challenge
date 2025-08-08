// Test environment setup
process.env.NODE_ENV = "test";
process.env.AWS_REGION = "eu-north-1";

export default async () => {
  console.log("Test environment setup complete");
};
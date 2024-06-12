import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { serve } from "@hono/node-server";
import dotenv from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";

dotenv.config();

const S3_ENDPOINT = process.env.S3_ENDPOINT!;
const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID!;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY!;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;

const app = new Hono();

app.use("/*", cors());

const s3 = new S3Client({
  region: "Dallas",
  endpoint: `https://${S3_ENDPOINT}`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/upload", async (c) => {
  const body = await c.req.parseBody();
  const file = body.file as File;
  const key = `${Date.now()}-${file.name}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    })
  );
  return c.text("Upload successful!");
});

app.post("/getpresignedurl", async (c) => {
  const body = await c.req.json();

  const preSignedUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: body.key,
      ContentType: body.type,
    }),
    { expiresIn: body.expires }
  );

  console.log(preSignedUrl);

  return c.json({ url: preSignedUrl });
});

app.delete("/delete", async (c) => {
  const body = await c.req.json();
  const key = body.key;
  const result = await s3.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    })
  );
  console.log(result);
  return c.json({ result });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

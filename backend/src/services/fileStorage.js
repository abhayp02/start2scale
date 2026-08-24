import { Readable } from "node:stream";
import mongoose from "mongoose";

const BUCKET_NAME = "kpiEvidence";

function getBucket() {
  if (!mongoose.connection.db) {
    throw new Error("Database connection is not ready");
  }

  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: BUCKET_NAME,
  });
}

export function storeEvidence(file, uploadedBy) {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(file.originalname, {
      metadata: {
        contentType: file.mimetype,
        uploadedBy: uploadedBy?.toString(),
        uploadedAt: new Date(),
      },
    });

    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(uploadStream.id));
    Readable.from(file.buffer).pipe(uploadStream);
  });
}

export async function findEvidence(fileId) {
  if (!mongoose.isValidObjectId(fileId)) return null;

  const bucket = getBucket();
  return bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).next();
}

export function openEvidenceStream(fileId) {
  return getBucket().openDownloadStream(new mongoose.Types.ObjectId(fileId));
}

export async function deleteEvidence(fileId) {
  if (!fileId || !mongoose.isValidObjectId(fileId)) return;

  try {
    await getBucket().delete(new mongoose.Types.ObjectId(fileId));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

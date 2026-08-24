import mongoose from "mongoose";

export default async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI is not configured in .env. Please configure your MongoDB Atlas or local MongoDB URI."
    );
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    if (mongoUri.includes("127.0.0.1") || mongoUri.includes("localhost")) {
      throw new Error(
        `Failed to connect to local MongoDB at ${mongoUri} (${error.message}).\n` +
        "--> Ensure your local MongoDB service is running, OR update MONGODB_URI in your .env file with your MongoDB Atlas connection string."
      );
    } else {
      throw new Error(
        `Failed to connect to MongoDB at ${mongoUri} (${error.message}).\n` +
        "--> Please verify your connection string, credentials, and network access/IP whitelist in MongoDB Atlas."
      );
    }
  }
}


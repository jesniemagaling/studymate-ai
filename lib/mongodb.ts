import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};

const client: MongoClient = new MongoClient(uri, options);
const clientPromise: Promise<MongoClient> = client.connect();

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!process.env.MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to .env.local");
}

export default clientPromise;


import { RequestHandler } from "express";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}
const client = new MongoClient(uri);
const dbName = "world-polls"; // Replace with your database name
const collectionName = "polls"; // Replace with your collection name

export const listPollsHandler: RequestHandler = async (_req, res) => {
  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const polls = await collection.find({}).toArray();
    res.status(200).json(polls);
  } catch (error) {
    console.error("Error retrieving polls:", error);
    res.status(500).json({ error: "An error occurred while retrieving the polls." });
  } finally {
    await client.close();
  }
};

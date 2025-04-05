import { RequestHandler } from "express";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI; // Ensure you have your MongoDB URI in your environment variables
if (!uri) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}
const client = new MongoClient(uri);

export const closePollsHandler: RequestHandler = async (req, res) => {
  try {
    await client.connect();
    const database = client.db("world-polls"); // Replace with your database name
    const pollsCollection = database.collection("polls");

    const result = await pollsCollection.deleteMany({}); // Deletes all polls

    res.status(200).json({ success: true, message: `${result.deletedCount} polls have been removed from the database.` });
  } catch (error) {
    console.error("Error removing polls:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  } finally {
    await client.close();
  }
};




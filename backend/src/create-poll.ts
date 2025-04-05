import { RequestHandler } from "express";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}
const client = new MongoClient(uri);
const dbName = "world-polls"; // Replace with your database name
const collectionName = "polls"; // Replace with your collection name

export const createPollHandler: RequestHandler = async (req, res) => {
    const { question, options, answers } = req.body;

  if (!question || !Array.isArray(options) || options.length !== 4) {
    console.log("Invalid input. Please provide a question and exactly four options.", req.body);
    res.status(400).json({ error: "Invalid input. Please provide a question and exactly four options." });
    return;
  }

  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const poll = {
      question,
      options,
      createdAt: new Date(),
      answers: answers
    };

    const result = await collection.insertOne(poll);
    res.status(201).json({ message: "Poll created successfully", pollId: result.insertedId });
    console.log("Poll created successfully", result.insertedId);
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ error: "An error occurred while creating the poll." });
  } finally {
    await client.close();
  }
};

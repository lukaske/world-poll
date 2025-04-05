import { RequestHandler } from "express";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}
const client = new MongoClient(uri);
const dbName = "world-polls"; // Replace with your database name
const collectionName = "polls"; // Replace with your collection name

export const getContributorsHandler: RequestHandler = async (req, res) => {
//   const { pollId } = req.params;

//   if (!pollId) {
//     res.status(400).json({ error: "Poll ID is required." });
//     return;
//   }

  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    
    const polls = await collection.find({}).toArray();
    const contributorsArray:any[] = [];

    polls.forEach(poll => {
      if (poll.contributors) {
        poll.contributors.forEach(contributor => contributorsArray.push(contributor));
      }
    });

    const contributors = contributorsArray;

    // const poll = await collection.findOne({ _id: ObjectId.createFromHexString(pollId) });
    // if (!poll) {
    //   res.status(404).json({ error: "Poll not found." });
    //   return;
    // }

    // const contributors = poll.contributors || [];
    res.status(200).json({ contributors });
  } catch (error) {
    console.error("Error fetching contributors:", error);
    res.status(500).json({ error: "An error occurred while fetching contributors." });
  } finally {
    await client.close();
  }
};

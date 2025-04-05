import { RequestHandler } from "express";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error("MONGODB_URI is not defined in the environment variables");
}
const client = new MongoClient(uri);
const dbName = "world-polls"; // Replace with your database name
const collectionName = "polls"; // Replace with your collection name

export const updatePollHandler: RequestHandler = async (req, res) => {
    console.log("Updating poll.", req.body);
    const { pollId, selectedOption } = req.body;

    if (!pollId || !selectedOption) {
        console.log("Poll ID and selected option are required.", req.body);
        res.status(400).json({ error: "Poll ID and selected option are required." });
        return;
    }

    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const poll = await collection.findOne({ _id: ObjectId.createFromHexString(pollId) });
        if (!poll) {
            console.log("Poll not found.", pollId);
            res.status(404).json({ error: "Poll not found." });
            return;
        }

        const optionIndex = poll.options.indexOf(selectedOption);
        if (optionIndex === -1) {
            console.log("Selected option is not valid.", selectedOption);
            res.status(400).json({ error: "Selected option is not valid." });
            return;
        }

        const updateResult = await collection.updateOne(
            { _id: ObjectId.createFromHexString(pollId) },
            { $inc: { [`answers.${optionIndex}`]: 1 } } // Increment the count for the selected option
        );

        if (updateResult.modifiedCount === 0) {
            res.status(500).json({ error: "Failed to update the poll." });
            return;
        }

        console.log("Poll updated successfully.");

        res.status(200).json({ message: "Poll updated successfully." });
    } catch (error) {
        console.error("Error updating poll:", error);
        res.status(500).json({ error: "An error occurred while updating the poll." });
    } finally {
        await client.close();
    }
};

import { RequestHandler } from "express";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error("MONGODB_URI is not defined in the environment variables");
}
const client = new MongoClient(uri);
const dbName = "world-polls"; // Replace with your database name
const collectionName = "prompts"; // Change to "prompts" collection

export const uploadPromptHandler: RequestHandler = async (req, res) => {
    const promptData = req.body;

    if (!promptData || typeof promptData !== "object") {
        console.log("Invalid input. Please provide a valid JSON object.", req.body);
        res.status(400).json({ error: "Invalid input. Please provide a valid JSON object." });
        return;
    }

    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const result = await collection.insertOne(promptData);
        res.status(201).json({ message: "Prompt uploaded successfully", promptId: result.insertedId });
        console.log("Prompt uploaded successfully", result.insertedId);

        // Now create related poll insertions, poll_questions

        for (const question of promptData.poll_questions) {

            if (!promptData || typeof promptData !== "object") {
                console.log("Invalid input. Please provide a valid JSON object.", req.body);
                res.status(400).json({ error: "Invalid input. Please provide a valid JSON object." });
                return;
            }

            if (!question || !Array.isArray(question.options) || question.options.length !== 4) {
                console.log("Invalid input. Please provide a question and exactly four options.", req.body);
                continue;
              }
            
        
            const poll = {
                question: question.question,
                options: question.options,
                createdAt: new Date(),
                answers: Array(question.options.length).fill(0), // Initialize with zero votes
                contributors: [],
                promptId: result.insertedId, // Link to the prompt
            };
            const collection_pools = database.collection("polls"); // Change to "polls" collection
            const pollResult = await collection_pools.insertOne(poll);
            console.log("Poll created successfully", pollResult.insertedId);
        }

    } catch (error) {
        console.error("Error uploading prompt:", error);
        res.status(500).json({ error: "An error occurred while uploading the prompt." });
    } finally {
        await client.close();
    }
};

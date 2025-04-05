import { RequestHandler } from "express";
import { MongoClient, ObjectId } from "mongodb";
import {
    verifyCloudProof,
    IVerifyResponse,
} from "@worldcoin/minikit-js";

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error("MONGODB_URI is not defined in the environment variables");
}
const client = new MongoClient(uri);
const dbName = "world-polls"; // Replace with your database name
const collectionName = "polls"; // Replace with your collection name

export const updatePollHandler: RequestHandler = async (req, res) => {
    const { pollId, selectedOption, payloadGlobalData, userAddress } = req.body;
    console.log("Payload global data.", payloadGlobalData);
    
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

        if (JSON.parse(payloadGlobalData).payload !== null) {
            const { payload, action, signal } = JSON.parse(payloadGlobalData);
            const app_id = process.env.APP_ID as `app_${string}`;
            const verifyRes = (await verifyCloudProof(
                payload,
                app_id,
                action,
                signal
            )) as IVerifyResponse;
            if (!verifyRes.success) {
                console.log("Verification failed.", verifyRes);
                res.status(400).json({ error: "Verification failed." });
                return;
            }
            console.log("Verification successful.", verifyRes);
        }

        const optionIndex = poll.options.indexOf(selectedOption);
        if (optionIndex === -1) {
            console.log("Selected option is not valid.", selectedOption);
            res.status(400).json({ error: "Selected option is not valid." });
            return;
        }

        const updateResult = await collection.updateOne(
            { _id: ObjectId.createFromHexString(pollId) },
            { 
                $inc: { [`answers.${optionIndex}`]: 1 }, // Increment the count for the selected option
                $addToSet: { contributors: userAddress } // Add userAddress to contributors if not already present
            }
        );

        if (updateResult.modifiedCount === 0) {
            res.status(500).json({ error: "Failed to update the poll." });
            return;
        }

        console.log("Poll updated successfully.");

        console.log("User address:", userAddress);

        const userCollection = database.collection("users");
        // Check if the user already exists
        let user = await userCollection.findOne({ address: userAddress });

        if (!user) {
            // User does not exist, create a new user with 10 points
            user = {
                _id: new ObjectId(),
                address: userAddress,
                points: 10,
                badges: ["first_poll"]
            };
            await userCollection.insertOne(user);
        } else {
            // User exists, update points and badges
            await userCollection.updateOne(
                { address: userAddress },
                { 
                    $inc: { points: 10 }, // Increment points by 10
                    $addToSet: { badges: "first_poll" } // Add badge if not already present
                }
            );
        }

        res.status(200).json({ message: "Poll updated successfully." });
    } catch (error) {
        console.error("Error updating poll:", error);
        res.status(500).json({ error: "An error occurred while updating the poll." });
    } finally {
        await client.close();
    }
};

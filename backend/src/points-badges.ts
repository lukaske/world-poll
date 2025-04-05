import { RequestHandler } from "express";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error("MONGODB_URI is not defined in the environment variables");
}
const client = new MongoClient(uri);
const dbName = "world-polls"; // Replace with your database name

export const getUserPointsAndBadgesHandler: RequestHandler = async (req, res) => {
    const { walletAddress } = req.params;

    if (!walletAddress) {
        res.status(400).json({ error: "Wallet address is required." });
        return;
    }

    try {
        await client.connect();
        const database = client.db(dbName);
        const userCollection = database.collection("users");

        const user = await userCollection.findOne({ address: walletAddress });

        if (!user) {
            await userCollection.insertOne({ address: walletAddress, points: 0, badges: [] });
            res.status(200).json({ points: 0, badges: [] });
            return;
        }

        res.status(200).json({
            points: user.points,
            badges: user.badges,
        });
    } catch (error) {
        console.error("Error fetching user points and badges:", error);
        res.status(500).json({ error: "An error occurred while fetching user data." });
    } finally {
        await client.close();
    }
};

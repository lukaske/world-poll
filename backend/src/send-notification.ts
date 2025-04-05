import fetch from "node-fetch";
import { RequestHandler } from "express";

export const sendNotificationHandler: RequestHandler = async (req, res) => {
  const wallet_addresses = req.body.wallet_addresses;

  if (!wallet_addresses || wallet_addresses.length === 0) {
    return res.status(400).json({ success: false, error: "No wallet addresses provided." });
  }

  console.log("wallet_addresses", wallet_addresses)

  const notificationData = {
    app_id: process.env.APP_ID, // Use the APP_ID from the environment variables
    wallet_addresses,
    title: "New poll created! 🎉", // Default title, can be customized if needed
    message: "Vote now to earn rewards! 💰", // Default message, can be customized if needed
    mini_app_path: `worldapp://mini-app?app_id=${process.env.APP_ID}`, // Use the APP_ID from the environment variables
  };

  try {
    const response = await fetch("https://developer.worldcoin.org/api/v2/minikit/send-notification", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
      },
      body: JSON.stringify(notificationData),
    });

    const data = await response.json();

    console.log("data", data)

    if (!response.ok) {
      throw new Error(data.error || "Failed to send notification");
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};


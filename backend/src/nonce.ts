import crypto from "crypto";
import { RequestHandler } from "express";

export const nonceHandler: RequestHandler = (_req, res) => {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  res.json({ nonce });
};

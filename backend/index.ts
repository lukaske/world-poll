import express from "express";

import { verifyHandler } from "./src/verify";
import { initiatePaymentHandler } from "./src/initiate-payment";
import { confirmPaymentHandler } from "./src/confirm-payment";
import { createPollHandler } from "./src/create-poll";
import { listPollsHandler } from "./src/list-polls";
import { updatePollHandler } from "./src/update-poll";
import cors from "cors";

const app = express();

// trust the proxy to allow HTTPS protocol to be detected 
// https://expressjs.com/en/guide/behind-proxies.html
app.set("trust proxy", true);
// allow cors
app.use(cors());
// json middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// request logger middleware
app.use((req, _res, next) => {
  console.log(`logger: ${req.method} ${req.url}`);
  next();
});

app.get("/ping", (_, res) => {
  res.send("minikit-example pong v1");
});

// protected routes
app.post("/verify", verifyHandler);
app.post("/initiate-payment", initiatePaymentHandler);
app.post("/confirm-payment", confirmPaymentHandler);
app.post("/create-poll", createPollHandler);
app.get("/list-polls", listPollsHandler);
app.post("/update-poll", updatePollHandler);

const port = 3030; // use env var
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

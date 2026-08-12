import express from "express";
import { env } from "./validators/env.validator.js";

const app = express();

app.use("/health", (req, res) => {
    res.send("server health check");
});

app.listen(env.PORT, () => {
    console.log(`server running on port ${env.PORT}...`);
});

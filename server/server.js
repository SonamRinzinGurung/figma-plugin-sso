import express from "express";
import axios from "axios";
// import firebaseAdmin from "firebase-admin";
// import { db } from "./firebaseConfig.js";
import dotenv from "dotenv"; //to use environment variables
dotenv.config();
import morgan from "morgan";
import helmet from "helmet";
import { fileURLToPath } from "url";
import path from "path";

const app = express();

const port = 3000;

app.use(morgan("dev"));


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

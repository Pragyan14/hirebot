import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware.js";
import cors from 'cors';

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}))
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import pdfRoute from "./routes/pdf.route.js";
import questionRoute from "./routes/question.route.js";

app.use("/api/v1/pdf", pdfRoute);
app.use("/api/v1/question", questionRoute);

app.use(errorHandler);

export { app };
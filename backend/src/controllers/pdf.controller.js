import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { PdfReader } from "pdfreader";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import { log } from "console";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const parsePdf = asyncHandler(async (req, res) => {

    const resumePath = req.files?.resume?.[0]?.path;

    if (!resumePath) {
        throw new ApiError(400, "resume is required");
    }

    const pdfBuffer = fs.readFileSync(resumePath);
    let fullText = "";

    await new Promise((resolve, reject) => {
        new PdfReader().parseBuffer(pdfBuffer, (err, item) => {
            if (err) reject(err);
            else if (!item) resolve();
            else if (item.text) fullText += item.text + "\n";
        });
    });

    const prompt = `
Extract the following fields from the resume text:
- Name
- Email
- Phone

If a field is missing, return only parsed filled, don't send null as string.
Resume Text:
${fullText}

Return only parsed things comma separated (name,email,phone)
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });   

    const parts = response.text.split(",").map(p => p.trim());


    let extracted = { name: parts[0] || null, email: parts[1] || null, phone: parts[2] || null };
    // let extracted = { name: 'Pragyan Patidar', email: "pragyanpatidar14@gmail.com", phone: "9575461663" };

    return res.status(200).json(new ApiResponse(200, extracted, "resume uploaded successfully"))

})

export { parsePdf };
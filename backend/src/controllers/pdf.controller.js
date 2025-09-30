import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { PdfReader } from "pdfreader";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const parsePdf = asyncHandler(async (req, res) => {
    const resumePath = req.files?.resume?.[0]?.path;

    if (!resumePath) {
        throw new ApiError(400, "resume is required");
    }

    try {
        // --- Read PDF ---
        const pdfBuffer = fs.readFileSync(resumePath);
        let fullText = "";

        await new Promise((resolve, reject) => {
            new PdfReader().parseBuffer(pdfBuffer, (err, item) => {
                if (err) reject(err);
                else if (!item) resolve();
                else if (item.text) fullText += item.text + "\n";
            });
        });

        // --- Extract fields using AI ---
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

        // --- Delete the PDF after processing ---
        fs.unlink(resumePath, (err) => {
            if (err) console.error("Failed to delete resume:", err);
        });

        // --- Send response ---
        return res.status(200).json(new ApiResponse(200, extracted, "Resume uploaded successfully"));

    } catch (err) {
        // If any error occurs, also try to delete the file to avoid orphan files
        if (resumePath) {
            fs.unlink(resumePath, (unlinkErr) => {
                if (unlinkErr) console.error("Failed to delete resume after error:", unlinkErr);
            });
        }
        throw err;
    }
});


export { parsePdf };
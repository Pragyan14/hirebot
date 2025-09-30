import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateQuestion = asyncHandler(async (req, res) => {
    const prompt = `Generate 6 interview questions for a Full Stack Developer (React/Node.js).

Requirements:
- 2 Easy, 2 Medium, 2 Hard.
- Questions should be verbal/conceptual, NOT coding problems.
- Return only as a single string in JSON array format like this:

[
{"question":"...","difficulty":"Easy"},
{"question":"...","difficulty":"Easy"},
{"question":"...","difficulty":"Medium"},
{"question":"...","difficulty":"Medium"},
{"question":"...","difficulty":"Hard"},
{"question":"...","difficulty":"Hard"}
]
- Do not include any extra text, explanations, markdown, json or answers.
`

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    const questions = JSON.parse(response.text);

    return res.status(200).json(new ApiResponse(200, questions))
})

const getScore = asyncHandler(async (req, res) => {
    const { questions, answers } = req.body;

    if (!questions || !answers) {
        throw new ApiError(400, "questions and answers are required");
    }

    const prompt = `
You are an interviewer for a Full Stack Developer (React + Node.js) role.

You will receive:
- A list of 6 interview questions with difficulty levels.
- The candidate’s answers.

Your task: Give only the overall score (average out of 10) and a concise overall summary (max 3 sentences).

Return the result strictly in the format:
overallScore|overall summary

Do not include anything else (no explanations, no markdown, no JSON, no individual question feedback).

Questions:
${JSON.stringify(questions)}

Answers:
${JSON.stringify(answers)}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    // console.log(response.text);
    const parts = response.text.split("|").map(p => p.trim());
    return res.status(200).json(new ApiResponse(200, {score:parseInt(parts[0]), summary:parts[1]}));
});


export { generateQuestion , getScore };
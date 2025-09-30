import { Router } from "express";
import { generateQuestion, getScore } from "../controllers/question.controller.js";

const router = Router();

router.route("/generate-question").post(generateQuestion);
router.route("/getScore").post(getScore);

export default router;
import { Router } from "express";
import { parsePdf } from "../controllers/pdf.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route("/parsePdf").post(
    upload.fields([{name: "resume", maxCount: 1}]),
    parsePdf
);

export default router;
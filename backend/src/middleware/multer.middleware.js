import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.pdf';
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

function fileFilter(req, file, cb) {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new ApiError(415,"Only PDF files are allowed"))
    }
}

export const upload = multer({
    storage,
    limits: {
        fileSize: 1 * 1024 * 1024, 
    },
    fileFilter,
});
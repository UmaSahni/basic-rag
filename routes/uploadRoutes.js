import express from "express";
import { uploadPDF } from "../middleware/multer.js";
import { indexing } from "../indexing.js";

const router = express.Router();

// single("pdf") → must match frontend field name
router.post("/upload", uploadPDF.single("pdf"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: "No file uploaded",
                });
            }

            await indexing(req.file.path);

            res.json({
                message: "PDF uploaded and indexed successfully",
                file: req.file.filename,
                path: req.file.path,
            });
        } catch (error) {
            res.status(500).json({
                message: error.message,
            });
        }
    }
);

export default router;
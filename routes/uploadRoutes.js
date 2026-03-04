import express from "express";
import { uploadPDF } from "../middleware/multer.js";
import { indexing } from "../indexing.js";
import { uploadInMongoDB } from "../controllers/files.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// single("pdf") → must match frontend field name
router.post("/upload", authMiddleware, uploadPDF.single("pdf"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: "No file uploaded",
                });
            }

            await indexing(req.file.path);
            const newFile = await uploadInMongoDB(req.file, req.userId);

            res.json({
                message: "PDF uploaded and indexed successfully",
                file: newFile,
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
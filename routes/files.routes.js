import express from "express";
import { getFileFromMongoDB, deleteFileFromMongoDB } from "../controllers/files.controllers.js";

const router = express.Router();

router.get("/get/:id", getFileFromMongoDB);
router.delete("/delete/:id", deleteFileFromMongoDB);

export default router;
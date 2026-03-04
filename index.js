import express from "express";
import * as dotenv from "dotenv";
import { chatting } from "./query.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { connectDB } from "./config/db.js";
import usersRoutes from "./routes/users.routes.js";
import filesRoutes from "./routes/files.routes.js";
import { authMiddleware } from "./middleware/auth.middleware.js";


dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to the Question AI API");
});

app.use("/api" , usersRoutes);

app.use("/api", authMiddleware, [uploadRoutes, filesRoutes]);

app.post("/ask", async (req, res) => {
    const question = req.body.question;
    try {
        const answer = await chatting(question);
        res.json({ answer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Keep process alive and log why it might exit
process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled rejection at:", promise, "reason:", reason);
});

const server = app.listen(PORT, "0.0.0.0", async () => {
    try {
        await connectDB();
        console.log("Server running on port", PORT, "and MongoDB connected");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
});
server.on("error", (err) => {
    console.error("Server error:", err);
    process.exit(1);
});
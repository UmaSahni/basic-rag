import express from "express";
import * as dotenv from "dotenv";
import { chatting } from "./query.js";
dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.post("/ask", async (req, res) => {
    const question = req.body.question;

    try {
        const answer = await chatting(question); // your existing function
        res.json({ answer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port 3000");
});
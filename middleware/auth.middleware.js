import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();


export const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Auth Middleware Token:", token);
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import connectionRoutes from "./routes/connection.route.js";
import messageRoutes from "./routes/message.route.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;
const __dirname = path.resolve();

// Configure CORS based on environment
if (process.env.NODE_ENV === "production") {
    app.use(
        cors({
            origin: "https://pro-connect-1.onrender.com",
            credentials: true,
        })
    );
} else {
    app.use(
        cors({
            origin: "http://localhost:5173",
            credentials: true,
        })
    );
}

app.use(express.json({ limit: "5mb" })); // parse JSON request bodies
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionRoutes);
app.use("/api/v1/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
    // In split deployment, we don't need to serve static files from the API server
    // The frontend is hosted separately on https://pro-connect-1.onrender.com
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
});

import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendMessage, getConversations, getMessages } from "../controllers/message.controller.js";

const router = express.Router();

router.post("/", protectRoute, sendMessage);
router.get("/conversations", protectRoute, getConversations);
router.get("/:userId", protectRoute, getMessages);

export default router;
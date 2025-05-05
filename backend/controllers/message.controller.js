import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        
        const message = await Message.create({
            sender: req.user._id,
            recipient: recipientId,
            content
        });

        const populatedMessage = await message.populate("sender recipient", "name username profilePicture");
        
        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error("Error in sendMessage controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getConversations = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user._id },
                { recipient: req.user._id }
            ]
        })
        .sort({ createdAt: -1 })
        .populate("sender recipient", "name username profilePicture");

        const conversations = messages.reduce((acc, message) => {
            const otherUser = message.sender._id.equals(req.user._id) 
                ? message.recipient 
                : message.sender;
            
            if (!acc[otherUser._id]) {
                acc[otherUser._id] = {
                    user: otherUser,
                    lastMessage: message,
                    unreadCount: message.recipient._id.equals(req.user._id) && !message.read ? 1 : 0
                };
            }
            return acc;
        }, {});

        res.json(Object.values(conversations));
    } catch (error) {
        console.error("Error in getConversations controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, recipient: userId },
                { sender: userId, recipient: req.user._id }
            ]
        })
        .sort({ createdAt: 1 })
        .populate("sender recipient", "name username profilePicture");

        res.json(messages);
    } catch (error) {
        console.error("Error in getMessages controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { formatDistanceToNow } from "date-fns";

const MessageConversation = ({ userId, userName, profilePicture }) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Query to fetch messages with this user
  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", userId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/messages/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });

  // Mutation to send a new message
  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      const res = await axiosInstance.post('/messages', {
        recipientId: userId,
        content
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages", userId]);
      queryClient.invalidateQueries(["conversations"]);
      setNewMessage("");
    }
  });

  // Auto-scroll to the bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  if (!userId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select a conversation to start messaging
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4">Loading conversation...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Conversation header */}
      <div className="px-4 py-3 border-b flex items-center">
        <img 
          src={profilePicture || "/avatar.png"} 
          alt={userName} 
          className="w-10 h-10 rounded-full object-cover mr-3" 
        />
        <div className="font-medium">{userName}</div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <div 
              key={message._id} 
              className={`flex ${message.sender._id === userId ? "justify-start" : "justify-end"}`}
            >
              <div 
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                  message.sender._id === userId 
                    ? "bg-gray-200 text-black" 
                    : "bg-blue-600 text-white"
                }`}
              >
                <div>{message.content}</div>
                <div className={`text-xs mt-1 ${message.sender._id === userId ? "text-gray-500" : "text-blue-200"}`}>
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSubmit} className="p-3 border-t flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sendMessageMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:bg-blue-400"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageConversation;
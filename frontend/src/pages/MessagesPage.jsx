import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import MessageConversation from "../components/MessageConversation";
import { formatDistanceToNow } from "date-fns";

const MessagesPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch all conversations
  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await axiosInstance.get("/messages/conversations");
      return res.data;
    },
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg shadow-sm border">
        {/* Conversations list */}
        <div className="w-full md:w-1/3 border-r">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Conversations</h2>
          </div>
          
          <div className="overflow-y-auto" style={{ maxHeight: "70vh" }}>
            {isLoading ? (
              <div className="p-4 text-center">Loading conversations...</div>
            ) : conversations && conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.user._id}
                  onClick={() => setSelectedUser({
                    id: conversation.user._id,
                    name: conversation.user.name,
                    profilePicture: conversation.user.profilePicture
                  })}
                  className={`p-4 border-b flex items-center cursor-pointer hover:bg-gray-50 ${
                    selectedUser?.id === conversation.user._id ? "bg-blue-50" : ""
                  }`}
                >
                  <img
                    src={conversation.user.profilePicture || "/avatar.png"}
                    alt={conversation.user.name}
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium truncate">{conversation.user.name}</h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-1">
                        {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm truncate">
                      {conversation.lastMessage.content}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 mt-1 inline-block">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No conversations yet. Connect with people to start messaging.
              </div>
            )}
          </div>
        </div>
        
        {/* Conversation content */}
        <div className="w-full md:w-2/3 flex flex-col" style={{ height: "70vh" }}>
          <MessageConversation 
            userId={selectedUser?.id} 
            userName={selectedUser?.name}
            profilePicture={selectedUser?.profilePicture}
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
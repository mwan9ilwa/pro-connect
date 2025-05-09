import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import MessageConversation from "../components/MessageConversation";
import { formatDistanceToNow } from "date-fns";
import { Edit, PlusCircle, Search, X } from "lucide-react";
import { useLocation } from "react-router-dom";

const MessagesPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  // Fetch all conversations
  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await axiosInstance.get("/messages/conversations");
      return res.data;
    },
  });

  // Fetch connections for new message modal
  const { data: connections } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const res = await axiosInstance.get("/connections");
      return res.data;
    },
    enabled: showNewMessageModal,
  });

  // Check if we're coming from a profile page with state
  useEffect(() => {
    if (location.state?.userId) {
      setSelectedUser({
        id: location.state.userId,
        name: location.state.userName,
        profilePicture: location.state.profilePicture
      });
    }
  }, [location.state]);

  // Filter connections based on search term
  const filteredConnections = connections?.filter(connection => 
    connection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg shadow-sm border">
        {/* Conversations list */}
        <div className="w-full md:w-1/3 border-r">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-lg">Conversations</h2>
            <button 
              onClick={() => setShowNewMessageModal(true)}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition"
              title="New Message"
            >
              <Edit size={18} />
            </button>
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

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New Message</h3>
              <button 
                onClick={() => setShowNewMessageModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search connections..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {!connections ? (
                <div className="p-4 text-center">Loading connections...</div>
              ) : connections.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No connections found. Connect with people to start messaging.
                </div>
              ) : filteredConnections.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No connections match your search.
                </div>
              ) : (
                filteredConnections.map(connection => (
                  <div
                    key={connection._id}
                    onClick={() => {
                      setSelectedUser({
                        id: connection._id,
                        name: connection.name,
                        profilePicture: connection.profilePicture
                      });
                      setShowNewMessageModal(false);
                    }}
                    className="p-3 border-b flex items-center cursor-pointer hover:bg-gray-50"
                  >
                    <img
                      src={connection.profilePicture || "/avatar.png"}
                      alt={connection.name}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                    <div>
                      <h4 className="font-medium">{connection.name}</h4>
                      <p className="text-sm text-gray-600">{connection.headline}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
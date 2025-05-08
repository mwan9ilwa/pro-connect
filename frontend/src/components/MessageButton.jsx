import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import MessageBox from './MessageBox';

const MessageButton = ({ recipientId, recipientName }) => {
  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);

  const handleMessageClick = () => {
    setIsMessageBoxOpen(true);
  };

  return (
    <>
      <button
        onClick={handleMessageClick}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-500 bg-white border border-blue-500 rounded-full hover:bg-blue-50 transition-colors duration-200"
      >
        <MessageCircle size={18} />
        Message
      </button>

      {isMessageBoxOpen && (
        <MessageBox
          recipientId={recipientId}
          recipientName={recipientName}
          onClose={() => setIsMessageBoxOpen(false)}
        />
      )}
    </>
  );
};

export default MessageButton;
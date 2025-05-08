import { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';

const MessageNotification = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await axiosInstance.get('/messages/unread/count');
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return unreadCount > 0 ? (
    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {unreadCount}
    </div>
  ) : null;
};

export default MessageNotification;
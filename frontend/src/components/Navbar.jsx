import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import MessageNotification from './MessageNotification';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-primary">Pro-Connect</Link>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Link to="/messages" className="relative hover:text-primary transition-colors">
                <MessageCircle size={24} />
                <MessageNotification />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
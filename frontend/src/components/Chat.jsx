import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Users } from 'lucide-react';
import { theme } from '../styles/theme';

const Chat = ({ messages, sendMessage, activeUsers }) => {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const TabButton = ({ id, icon: Icon, label, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        activeTab === id
          ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
          : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {count !== undefined && (
        <span className="ml-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <TabButton
            id="chat"
            icon={MessageSquare}
            label="Chat"
            count={messages.length}
          />
          <TabButton
            id="users"
            icon={Users}
            label="Active Users"
            count={activeUsers.length}
          />
        </div>
      </div>

      {activeTab === 'chat' ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {msg.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  {msg.pending && (
                    <span className="text-xs text-gray-500 italic">
                      sending...
                    </span>
                  )}
                </div>
                <p className={`text-gray-600 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-700 rounded-lg p-2 ${
                  msg.pending ? 'opacity-70' : ''
                }`}>
                  {msg.message}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className={theme.input.base}
              />
              <button
                type="submit"
                className={theme.button.primary + " !p-2"}
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {activeUsers.map((user, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-gray-900 dark:text-white">{user.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useRoom } from '../hooks/useRoom';
import { ArrowLeft } from 'lucide-react';
import { theme, commonClasses } from '../styles/theme';
import Whiteboard from '../components/Whiteboard';
import Chat from '../components/Chat';
import api from '../api';

const Room = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [room, setRoom] = useState(null);
  const { activeUsers, messages, sendMessage, sendDrawing } = useRoom(id);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${id}`);
        setRoom(res.data);
      } catch (err) {
        console.error('Failed to fetch room', err);
      }
    };

    fetchRoom();

    if (socket && id) {
      socket.emit('joinRoom', id);
    }

    return () => {
      if (socket) {
        socket.emit('leaveRoom', id);
      }
    };
  }, [socket, id]);

  if (!room) {
    return (
      <div className={commonClasses.flexCenter + " h-full"}>
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div >
        <div className={theme.layout.container}>
          <div className={commonClasses.flexBetween + " py-3"}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/rooms')}
                className={commonClasses.iconButton + " text-gray-600 dark:text-gray-300"}
                title="Back to Rooms"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className={theme.text.title}>{room.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className={theme.layout.container + " h-full"}>
          <div className="flex h-full">
            <div className="flex-1 min-w-0">
              <Whiteboard roomId={id} sendDrawing={sendDrawing} />
            </div>
            <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <Chat 
                messages={messages} 
                sendMessage={sendMessage} 
                activeUsers={activeUsers}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
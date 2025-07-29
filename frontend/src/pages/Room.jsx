import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useRoom } from "../hooks/useRoom";
import { ArrowLeft, Users, Lock, LogOut } from "lucide-react";
import { theme, commonClasses } from "../styles/theme";
import Whiteboard from "../components/Whiteboard";
import Chat from "../components/Chat";
import api from "../api";
import toast from "react-hot-toast";
import chatService from "../services/chatService";

const Room = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [room, setRoom] = useState(null);
  const { activeUsers, messages, sendMessage, sendDrawing, leaveRoom } =
    useRoom(id);
  const [isJoining, setIsJoining] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await chatService.getChatHistory(id);
        setChatHistory(response.data);
      } catch (err) {
        console.error("Failed to load chat history:", err);
        toast.error("Failed to load chat history");
      }
    };

    if (!isJoining) {
      loadChatHistory();
    }
  }, [id, isJoining]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${id}`);
        const roomData = res.data;

        // Check if room is full
        if (roomData.activeUsers >= roomData.maxUsers) {
          toast.error("This room is full");
          navigate("/rooms");
          return;
        }

        setRoom(roomData);

        if (socket) {
          const password = localStorage.getItem(`room_${id}_password`);

          // Set up error handler before emitting join
          const handleError = (error) => {
            toast.error(error);
            navigate("/rooms");
          };
          socket.on("error", handleError);

          // Set up success handler
          const handleJoinSuccess = (data) => {
            if (data.activeUsers?.length >= roomData.maxUsers) {
              socket.off("error", handleError);
              socket.off("userJoined", handleJoinSuccess);
              toast.error("Room is full");
              navigate("/rooms");
              return;
            }
            setIsJoining(false);
            socket.off("error", handleError);
            socket.off("userJoined", handleJoinSuccess);
          };
          socket.on("userJoined", handleJoinSuccess);

          // Attempt to join
          socket.emit("joinRoom", { roomId: id, password });
        }
      } catch (err) {
        toast.error("Failed to fetch room");
        navigate("/rooms");
      }
    };

    fetchRoom();

    return () => {
      if (socket) {
        socket.emit("leaveRoom", id);
        // Clean up any remaining listeners
        socket.off("error");
        socket.off("userJoined");
      }
    };
  }, [socket, id, navigate]);

  const handleLeaveRoom = async () => {
    try {
      // Update database
      await api.post(`/rooms/${id}/leave`);

      // Use the leaveRoom function from useRoom hook
      leaveRoom();

      // Clear stored password
      localStorage.removeItem(`room_${id}_password`);

      // Navigate back to rooms list
      navigate("/rooms");
      toast.success("Left room successfully");
    } catch (err) {
      toast.error("Failed to leave room");
      console.error("Error leaving room:", err);
    }
  };

  if (!room || isJoining) {
    return (
      <div className={commonClasses.flexCenter + " h-full"}>
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div>
        <div className={theme.layout.container}>
          <div className={commonClasses.flexBetween + " py-3"}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/rooms")}
                className={
                  commonClasses.iconButton + " text-gray-600 dark:text-gray-300"
                }
                title="Back to Rooms"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className={theme.text.title}>{room.name}</h1>
                {room.isPrivate && <Lock className="h-4 w-4 text-gray-500" />}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>
                  {activeUsers.length}/{room.maxUsers} users
                </span>
              </div>
              <button
                onClick={handleLeaveRoom}
                className={theme.button.secondary}
                title="Leave Room"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave Room
              </button>
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
                messages={[...chatHistory, ...messages]}
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  ArrowRight,
  RefreshCw,
  Lock,
  Loader2,
  Palette,
  Trash2,
} from "lucide-react";
import { theme, commonClasses, animations } from "../styles/theme";
import CreateRoomModal from "../components/CreateRoomModal";
import JoinRoomModal from "../components/JoinRoomModal";
import DeleteRoomModal from "../components/DeleteRoomModal";
import api from "../api";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchRooms = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.get("/rooms");
      setRooms(res.data);
    } catch (error) {
      setError("Failed to fetch rooms: " + error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (formData) => {
    try {
      const res = await api.post("/rooms", formData);
      setRooms([...rooms, res.data]);
      setShowCreateModal(false);
      toast.success("Room created successfully");

      if (formData.isPrivate) {
        localStorage.setItem(
          `room_${res.data._id}_password`,
          formData.password
        );
      }

      navigate(`/rooms/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create room");
    }
  };

  const handleJoinRoom = (room) => {
    if (room.activeUsers >= room.maxUsers) {
      toast.error("This room is full");
      return;
    }

    if (room.isPrivate) {
      setSelectedRoom(room);
    } else {
      navigate(`/rooms/${room._id}`);
    }
  };

  const handleJoinPrivateRoom = (password) => {
    if (!selectedRoom) return;
    localStorage.setItem(`room_${selectedRoom._id}_password`, password);
    setSelectedRoom(null);
    navigate(`/rooms/${selectedRoom._id}`);
  };

  const handleDeleteClick = (e, room) => {
    e.stopPropagation(); // Prevent room join when clicking delete
    setRoomToDelete(room);
  };

  const handleDeleteConfirm = async () => {
    if (!roomToDelete) return;

    try {
      await api.delete(`/rooms/${roomToDelete._id}`);
      setRooms(rooms.filter((room) => room._id !== roomToDelete._id));
      toast.success("Room deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete room");
    } finally {
      setRoomToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className={commonClasses.flexCenter + " h-[calc(100vh-3.5rem)]"}>
        <Loader2 className={"h-8 w-8 text-blue-600 " + animations.spinner} />
      </div>
    );
  }

  return (
    <div className={theme.layout.section}>
      <div className={theme.layout.container}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Palette className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className={theme.text.title}>Canvas Rooms</h1>
              <p className={theme.text.subtitle}>
                Join a room or create your own to start collaborating
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchRooms}
              disabled={isRefreshing}
              className={theme.button.secondary}
              title="Refresh rooms list"
            >
              <RefreshCw
                className={
                  "h-4 w-4 " + (isRefreshing ? animations.spinner : "")
                }
              />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className={theme.button.primary}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </button>
          </div>
        </div>

        {error && <div className={theme.text.error + " mb-6"}>{error}</div>}

        {rooms.length === 0 ? (
          <div className={theme.card.base + " p-8"}>
            <div className="max-w-md mx-auto text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No rooms available
              </h3>
              <p className={theme.text.subtitle}>
                Create your first room to start collaborating with others in
                real-time.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className={theme.button.primary + " mt-6"}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Room
              </button>
            </div>
          </div>
        ) : (
          <div className={commonClasses.gridCards}>
            {rooms.map((room) => (
              <div
                key={room._id}
                onClick={() => handleJoinRoom(room)}
                className={`${theme.card.base} ${theme.card.interactive} p-4 relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:via-blue-600/5 group-hover:to-blue-600/0 transition-all duration-300" />

                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {room.name}
                      {room.isPrivate && (
                        <Lock className="h-4 w-4 text-amber-500" />
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      {user && room.createdBy === user.id && (
                        <button
                                                      onClick={(e) => handleDeleteClick(e, room)}
                            className={
                              commonClasses.iconButton +
                              " text-white hover:text-red-500 transition-colors"
                            }
                            title="Delete room"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    <span className="flex-1">
                      {room.activeUsers}/{room.maxUsers} users
                    </span>
                    {room.activeUsers >= room.maxUsers && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                        Full
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRoom}
        />
      )}

      {selectedRoom && (
        <JoinRoomModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onSubmit={handleJoinPrivateRoom}
        />
      )}

      <DeleteRoomModal
        isOpen={roomToDelete !== null}
        onClose={() => setRoomToDelete(null)}
        onConfirm={handleDeleteConfirm}
        roomName={roomToDelete?.name}
      />
    </div>
  );
};

export default Rooms;

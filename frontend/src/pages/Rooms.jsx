import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, ArrowRight, Loader2 } from 'lucide-react';
import { theme, commonClasses, animations } from '../styles/theme';
import api from '../api';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/rooms');
        setRooms(res.data);
      } catch (error) {
        setError('Failed to fetch rooms: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/rooms', { name: newRoomName });
      setRooms([...rooms, res.data]);
      setNewRoomName('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create room');
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
        <div className="space-y-1">
          <h1 className={theme.text.title}>Canvas Rooms</h1>
          <p className={theme.text.subtitle}>
            Create or join a room to start collaborating with others
          </p>
        </div>

        {error && <div className={theme.text.error}>{error}</div>}
        
        <div className="mt-6 space-y-6">
          <form onSubmit={handleCreateRoom} className={commonClasses.flexStart + " gap-4"}>
            <div className="relative flex-1">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter room name"
                className={theme.input.base}
                required
              />
              <Plus className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
            </div>
            <button type="submit" className={theme.button.primary}>
              Create Room
            </button>
          </form>

          <div>
            {rooms.length === 0 ? (
              <div className={theme.card.base + " p-8 text-center"}>
                <div className="max-w-[420px] mx-auto flex flex-col items-center justify-center">
                  <Users className="h-10 w-10 text-gray-500" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No rooms available</h3>
                  <p className={theme.text.subtitle + " mt-2"}>
                    Create your first room to start collaborating.
                  </p>
                </div>
              </div>
            ) : (
              <div className={commonClasses.gridCards}>
                {rooms.map((room) => (
                  <div
                    key={room._id}
                    className={theme.card.base + " " + theme.card.interactive + " p-6"}
                    onClick={() => navigate(`/rooms/${room._id}`)}
                  >
                    <div className="flex flex-col space-y-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{room.name}</h3>
                      <p className={theme.text.subtitle}>
                        Click to join and start collaborating
                      </p>
                    </div>
                    <button className={commonClasses.iconButton + " absolute right-4 top-4"}>
                      <ArrowRight className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
import api from '../api';

class ChatService {
  // Get chat messages for a room, with optional limit (default 50)
  async getChatHistory(roomId, limit = 50) {
    return api.get(`/rooms/${roomId}/messages`, { params: { limit } });
  }
}

export default new ChatService(); 
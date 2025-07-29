import api from '../api';

/**
 * Service for handling chat-related operations
 */
class ChatService {
  /**
   * Get chat history for a room
   * @param {string} roomId - The ID of the room
   * @param {number} limit - Maximum number of messages to fetch (default: 50)
   */
  async getChatHistory(roomId, limit = 50) {
    return api.get(`/rooms/${roomId}/messages`, { params: { limit } });
  }
}

export default new ChatService(); 
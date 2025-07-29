import api from '../api';

/**
 * Service for handling drawing-related API operations
 */
class DrawingService {
  /**
   * Save the current drawing state for a room
   * @param {string} roomId - The ID of the room
   * @param {Object} drawingData - The drawing data to save
   */
  async saveDrawing(roomId, drawingData) {
    return api.post(`/rooms/${roomId}/drawings`, drawingData);
  }

  /**
   * Get the latest drawing state for a room
   * @param {string} roomId - The ID of the room
   */
  async getLatestDrawing(roomId) {
    return api.get(`/rooms/${roomId}/drawings/latest`);
  }

  /**
   * Get all drawing snapshots for a room
   * @param {string} roomId - The ID of the room
   */
  async getDrawingHistory(roomId) {
    return api.get(`/rooms/${roomId}/drawings`);
  }
}

export default new DrawingService(); 
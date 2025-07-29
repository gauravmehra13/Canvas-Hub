import api from '../api';

class DrawingService {
  // Save current drawing state for a room
  async saveDrawing(roomId, drawingData) {
    return api.post(`/rooms/${roomId}/drawings`, drawingData);
  }

  // Get latest drawing state for a room
  async getLatestDrawing(roomId) {
    return api.get(`/rooms/${roomId}/drawings/latest`);
  }

  // Get all drawing snapshots for a room
  async getDrawingHistory(roomId) {
    return api.get(`/rooms/${roomId}/drawings`);
  }
}

export default new DrawingService(); 
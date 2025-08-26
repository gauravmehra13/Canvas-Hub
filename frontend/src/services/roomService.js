import api from "../api";

class RoomService {
  // Fetch all rooms
  async getRooms() {
    try {
      const response = await api.get("/rooms");
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to fetch rooms";
    }
  }

  // Fetch a single room by ID
  async getRoomById(id) {
    try {
      const response = await api.get(`/rooms/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to fetch room";
    }
  }

  // Create a new room
  async createRoom(formData) {
    try {
      const response = await api.post("/rooms", formData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to create room";
    }
  }

  // Delete a room by ID
  async deleteRoom(id) {
    try {
      await api.delete(`/rooms/${id}`);
    } catch (error) {
      throw error.response?.data?.error || "Failed to delete room";
    }
  }

  // Leave a room
  async leaveRoom(id) {
    try {
      await api.post(`/rooms/${id}/leave`);
    } catch (error) {
      throw error.response?.data?.error || "Failed to leave room";
    }
  }
}

export default new RoomService();

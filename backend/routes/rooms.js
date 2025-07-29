const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const {
  createRoom,
  getAllRooms,
  getRoomById,
  leaveRoom,
  deleteRoom,
  getChatHistory,
} = require("../controllers/roomController");

router.use(auth);

router.post("/", auth, createRoom);
router.get("/", auth, getAllRooms);
router.get("/:id", auth, getRoomById);
router.post("/:id/leave", auth, leaveRoom);
router.delete("/:id", auth, deleteRoom);
router.get("/:id/messages", auth, getChatHistory);

module.exports = router;

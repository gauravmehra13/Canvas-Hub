const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const {
  createRoom,
  getAllRooms,
  getRoomById,
  leaveRoom,
  deleteRoom
} = require('../controllers/roomController');

router.post("/", auth, createRoom);
router.get("/", auth, getAllRooms);
router.get("/:id", auth, getRoomById);
router.post("/:id/leave", auth, leaveRoom);
router.delete("/:id", auth, deleteRoom);

module.exports = router;
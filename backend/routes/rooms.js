const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const {
  createRoom,
  getAllRooms,
  getRoomById,
  leaveRoom
} = require('../controllers/roomController');

router.post("/", auth, createRoom);
router.get("/", auth, getAllRooms);
router.get("/:id", auth, getRoomById);
router.post("/:id/leave", auth, leaveRoom);

module.exports = router;
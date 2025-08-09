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

router.post("/", createRoom);
router.get("/", getAllRooms);
router.get("/:id", getRoomById);
router.post("/:id/leave", leaveRoom);
router.delete("/:id", deleteRoom);
router.get("/:id/messages", getChatHistory);

module.exports = router;

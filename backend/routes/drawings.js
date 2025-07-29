const express = require('express');
const router = express.Router();
const drawingController = require('../controllers/drawingController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Save drawing state
router.post('/:roomId/drawings', drawingController.saveDrawing);

// Get latest drawing state
router.get('/:roomId/drawings/latest', drawingController.getLatestDrawing);

// Get drawing history
router.get('/:roomId/drawings', drawingController.getDrawingHistory);

module.exports = router; 
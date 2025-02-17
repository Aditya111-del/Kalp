const express = require('express');
const chatController = require('../controllers/chat.controller.js');

const router = express.Router();

router.post('/create', chatController.createChat);
router.delete('/delete', chatController.deleteChat);
router.put('/update', chatController.updateChat);
router.get('/get', chatController.getChat);

module.exports = router;
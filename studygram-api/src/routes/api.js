const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Define API routes
router.get('/', homeController.getHome);
router.get('/health', homeController.getHome);
router.get('/db-check', homeController.checkDbStatus);

module.exports = router;

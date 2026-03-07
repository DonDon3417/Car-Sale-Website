const express = require('express');
const router = express.Router();
const contactController = require('../controller/contact.controller');
const { authUser } = require('../auth/checkAuth');

// Public route
router.post('/', contactController.createContact);

// Admin routes
router.get('/', authUser, contactController.getAllContacts);
router.put('/:id/status', authUser, contactController.updateStatus);
router.delete('/:id', authUser, contactController.deleteContact);

module.exports = router;

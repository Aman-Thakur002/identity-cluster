const express = require('express');
const contactController = require('../controller/contact.controller');

const api = express.Router();

// Identity reconciliation endpoint
api.post('/identify', contactController.identify);

module.exports = api;
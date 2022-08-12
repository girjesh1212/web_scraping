const express = require('express');
const router = express.Router();

const { scrape } = require('../controllers/googlesearchCtrl');

router.get('/:query', scrape);

module.exports = router;

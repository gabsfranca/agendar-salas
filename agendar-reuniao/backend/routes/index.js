const express = require('express');
const authRoutes = require('./auth');
const schedulingRoutes = require('./scheduling');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/scheduling', schedulingRoutes);



module.exports = router;
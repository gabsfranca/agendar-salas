const express = require('express');
const authRoutes = require('./auth');
const schedulingRoutes = require('./scheduling');
const emailRoutes = require('./email')

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/scheduling', schedulingRoutes);
router.use('/email', emailRoutes);



module.exports = router;
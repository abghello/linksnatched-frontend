var express = require('express');
var router = express.Router();
const linkRouter = require('./linkRouter');
const userRouter = require('./userRouter');
const authJwt = require('../../middlewares/authJwt');

router.use('/link', authJwt.verifySupabaseToken, linkRouter);
router.use('/user', authJwt.verifySupabaseToken, userRouter);

module.exports = router;

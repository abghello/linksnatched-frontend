var express = require('express');
var router = express.Router();
const userRouter = require('../src/v1/routes');

router.use('/v1', userRouter);

module.exports = router;

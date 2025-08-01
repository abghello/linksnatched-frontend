var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const { authJwt } = require('../../middlewares');

router.get('/', authJwt.verifySupabaseToken, userController.getUser);

module.exports = router;

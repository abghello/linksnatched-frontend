const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const supabaseConfig = require('../../config/supabase.config');

verifySupabaseToken = (req, res, next) => {
  let authHeader = req.headers['authorization'];
  let token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

  if (!token) {
    console.log('No token provided!');
    return res
      .status(StatusCodes.FORBIDDEN)
      .send({ code: StatusCodes.FORBIDDEN, message: 'No token provided!' });
  }

  jwt.verify(token, supabaseConfig.SUPABASE_JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('verifySupabaseToken err------>', err);
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ code: StatusCodes.UNAUTHORIZED, message: 'Unauthorized!' });
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      accessToken: token,
    };

    next();
  });
};

const authJwt = {
  verifySupabaseToken,
};
module.exports = authJwt;

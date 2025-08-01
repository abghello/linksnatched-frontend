const { StatusCodes } = require('http-status-codes');
const { getSupabaseClient } = require('../../../lib/supabase');

const getUser = async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.user;
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('id', id)
      .single();

    if (data) {
      return res.json({ code: StatusCodes.OK, data, message: 'success' });
    } else {
      return next({
        code: StatusCodes.NOT_FOUND,
        message: 'User is not found',
      });
    }
  } catch (err) {
    console.log('getUseerr->', err);
    const error = {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    };
    next(error);
  }
};

const userController = {
  getUser,
};

module.exports = userController;

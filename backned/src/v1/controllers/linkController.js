const { StatusCodes } = require('http-status-codes');
const { getSupabaseClient } = require('../../../lib/supabase');
const { body } = require('express-validator');
const { getFirstImageUrl, getTitle } = require('../../../utils/extractInfo');

const createLink = async (req, res, next) => {
  try {
    const { url, title } = req.body;
    const supabase = getSupabaseClient();

    const domain = new URL(url).hostname;

    const imgUrl = await getFirstImageUrl(url);
    const resolvedTitle = await getTitle(url);

    const newLink = {
      user_id: req.user.id,
      given_title: title,
      resolved_title: resolvedTitle,
      display_url: url,
      given_url: url,
      resolved_url: url,
      domain: domain,
      top_image_url: imgUrl,
    };

    const { data, error } = await supabase
      .from('links')
      .insert({ ...newLink })
      .select()
      .single();

    if (data) {
      return res.json({ code: StatusCodes.OK, data, message: 'success' });
    } else {
      console.log('error->', error);
      return next({
        code: StatusCodes.NOT_FOUND,
        message: 'Link is not found',
      });
    }
  } catch (err) {
    console.log(err);
    const error = {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    };
    next(error);
    return next({
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    });
  }
};

const getLink = async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;
    const { data, error } = await supabase.from('links').select().eq('id', id);

    if (data) {
      return res.json({ code: StatusCodes.OK, data, message: 'success' });
    } else {
      return next({
        code: StatusCodes.NOT_FOUND,
        message: 'Line is not found',
      });
    }
  } catch (err) {
    const error = {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    };
    next(error);
  }
};

const getLinks = async (req, res, next) => {
  try {
    const { url } = req.query;
    const supabase = getSupabaseClient();

    let query = supabase.from('links').select();
    if (url) {
      query = query.eq('given_url', url);
    }

    const { data, error } = await query;

    if (error) {
      return next({
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Database error',
        details: error,
      });
    }

    if (data && data.length > 0) {
      return res.json({ code: StatusCodes.OK, data, message: 'success' });
    } else {
      return next({
        code: StatusCodes.NOT_FOUND,
        message: 'Links not found',
      });
    }
  } catch (err) {
    next({
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    });
  }
};

const updateLink = async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();

    const { id } = req.params;
    const { url } = req.body;
    const { data, error } = await supabase
      .from('links')
      .update({ url })
      .eq('id', id)
      .select();

    if (data) {
      return res.json({ code: StatusCodes.OK, data, message: 'success' });
    } else {
      return next({
        code: StatusCodes.NOT_FOUND,
        message: 'Line is not found',
      });
    }
  } catch (err) {
    const error = {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    };
    next(error);
  }
};

const updateLinkTags = async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();

    const { id } = req.params;
    const { tags } = req.body;
    const { data, error } = await supabase
      .from('links')
      .update({ tags })
      .eq('id', id)
      .select();

    if (data) {
      return res.json({ code: StatusCodes.OK, data, message: 'success' });
    } else {
      return next({
        code: StatusCodes.NOT_FOUND,
        message: 'Line is not found',
      });
    }
  } catch (err) {
    const error = {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    };
    next(error);
  }
};

const deleteLink = async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;
    const { data, error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)
      .select();

    if (data) {
      return res.json({ code: StatusCodes.OK, data });
    } else {
      console.log('deleteLink error->', error);
      return next({
        code: StatusCodes.NOT_FOUND,
        message: 'Link is not found',
      });
    }
  } catch (err) {
    const error = {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      data: {},
    };
    console.log('deleteLink error->', error);
    return res.json({
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      data: {},
    });
  }
};

const validate = (method) => {
  switch (method) {
    case 'create':
      return [body('url', 'Url is required').exists()];
    case 'update':
      return [body('url', 'Url is required').exists()];
    case 'delete':
      return [body('id', 'Id is required').exists()];
  }
};

const lineController = {
  getLinks,
  getLink,
  createLink,
  updateLink,
  updateLinkTags,
  validate,
  deleteLink,
};

module.exports = lineController;

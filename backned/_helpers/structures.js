var _ = require("lodash");

users = (users, token = null) => {
  let res = [];

  const responseParams = {
    _id: null,
    email: null,
    first_name: null,
    last_name: null,
    email: null,
    phone_number: null,
    country: null,
    state: null,
    city: null,
    zip_code: null,
    address: null,
    about: null,
    created_at: null,
    updated_at: null,
  };
  if (Array.isArray(users)) {
    let structuredUser = null;
    _.each(users, function (user) {
      structuredUser = _.pick(user, _.keys(responseParams));
      res.push(structuredUser);
    });

    return res;
  } else {
    const structuredUser = _.pick(users, _.keys(responseParams));
    if (token && token != "") {
      structuredUser.accessToken = token;
    }
    return structuredUser;
  }
};

admins = (users, token = null) => {
  let res = [];

  const responseParams = {
    _id: null,
    email: null,
    first_name: null,
    last_name: null,
    email: null,
    phone_number: null,
    country: null,
    state: null,
    city: null,
    zip_code: null,
    address: null,
    about: null,
    status: null,
    created_at: null,
    updated_at: null,
  };

  if (Array.isArray(users)) {
    let structuredUser = null;
    _.each(users, function (user) {
      structuredUser = _.pick(user, _.keys(responseParams));
      res.push(structuredUser);
    });

    return res;
  } else {
    const structuredUser = _.pick(users, _.keys(responseParams));
    if (token && token != "") {
      structuredUser.accessToken = token;
    }
    return structuredUser;
  }
};

// handles single and multiple user responses
const structures = {
  users,
  admins,
};

module.exports = structures;

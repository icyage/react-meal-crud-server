const validator = require('validator');
const { User } = require('../models');
const { to, TE } = require('./util.service');

module.exports.createUser = async (userInfo) => {
  if (validator.isEmail(userInfo.email)) {
    const [err, user] = await to(User.create(userInfo));
    if (err) TE('not enough infos or user already exists with that email');

    return user;
  }
  TE('A valid email was not entered.');
  return null;
};

module.exports.authUser = async (userInfo) => { // returns token
  const { email, password } = userInfo;

  if (!password || !email) TE('Please enter an email and password to login');

  let err;
  let user;
  if (validator.isEmail(email)) {
    [err, user] = await to(User.findOne({ where: { email } }));
    if (err) TE(err.message);
  } else {
    TE('A valid email was not entered');
  }

  if (!user) TE('Not registered');

  [err, user] = await to(user.comparePassword(password));

  if (err) TE(err.message);

  return user;
};

module.exports.getOneUser = async (query) => {
  const [err, user] = await to(User.findOne({ where: query }));
  if (err) TE(err.message);
  return user;
};

module.exports.getManyUsers = async (query) => {
  const [err, users] = await to(User.findAll({ where: query }));
  if (err) TE(err.message);
  return users;
};

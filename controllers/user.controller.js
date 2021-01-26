/* eslint-disable no-await-in-loop */
const { Op } = require('sequelize');
const userService = require('../services/user.service');
const mealService = require('../services/meal.service');
const { to, ReE, ReS } = require('../services/util.service');

const roles = ['Manager', 'Regular', 'Admin'];

module.exports.create = async (req, res) => {
  const {
    email, password, role, calories,
  } = req.body;

  if (!email) {
    return ReE(res, 'Please enter an email to register.');
  }
  if (!password) {
    return ReE(res, 'Please enter a password to register.');
  }
  if (role && !roles.includes(role)) {
    return ReE(res, 'Invalid role');
  }
  if (calories && calories < 0) {
    return ReE(res, 'Invalid calories');
  }

  const [err, user] = await to(userService.createUser(req.body));
  if (err) return ReE(res, err, 422);
  return ReS(res, { message: 'Successfully created new user.', user: user.toWeb(), token: user.getJWT() }, 201);
};

module.exports.read = async (req, res) => {
  const { user } = req;

  const query = {};
  if (user.role === 'Manager') {
    query.role = {
      [Op.notIn]: ['Admin', 'Manager'],
    };
  }

  const [err, users] = await to(userService.getManyUsers(query));
  if (err) {
    return ReE(res, err);
  }

  const data = users.map((u) => u.toWeb());
  return ReS(res, { users: data });
};

module.exports.update = async (req, res) => {
  const { userId } = req.params;
  const data = req.body;

  let [err, user] = await to(userService.getOneUser({ id: userId }));
  if (err || !user) {
    return ReE(res, 'User not exist');
  }

  if (user.role === 'Admin' && req.user.id === user.id && data.role && data.role !== 'Admin') {
    return ReE(res, 'Admin user can\'t change his role by himself');
  }

  if (req.user.role === 'Manager' && user.role !== 'Regular') {
    return ReE(res, 'Manger can edit only Regular users');
  }

  if (data.role === 'Manager') {
    const [err1, meals] = await to(mealService.getManyMeals({ user: user.id }));
    if (err1) {
      return ReE(res, err1);
    }

    let i = 0;
    for (;i < meals.length; i += 1) {
      const [err2] = await to(meals[i].destroy());
      if (err2) return ReE(res, 'error occured trying to update user');
    }
  }

  if (data.role && !roles.includes(data.role)) {
    return ReE(res, 'Invalid role');
  }
  if (data.calories && data.calories < 0) {
    return ReE(res, 'Invalid calories');
  }

  user.set(data);

  [err, user] = await to(user.save());
  if (err) {
    if (err.message === 'Validation error') err = 'The email address is already in use';
    return ReE(res, err);
  }

  return ReS(res, { message: `Updated User: ${user.email}`, user: user.toWeb() });
};

module.exports.remove = async (req, res) => {
  const { userId } = req.params;

  let [err, user] = await to(userService.getOneUser({ id: userId }));
  if (err || !user) {
    return ReE(res, 'User not exist');
  }

  if (user.role === 'Admin' && req.user.id === user.id) {
    return ReE(res, 'Admin user can\'t delete himself');
  }

  if (req.user.role === 'Manager' && user.role !== 'Regular') {
    return ReE(res, 'Manger can edit only Regular users');
  }

  if (user.role !== 'Manager') {
    const [err1, meals] = await to(mealService.getManyMeals({ user: user.id }));
    if (err1) {
      return ReE(res, err1);
    }
    let i = 0;
    for (; i < meals.length; i += 1) {
      const [err2] = await to(meals[i].destroy());
      if (err2) return ReE(res, 'error occured trying to delete user');
    }
  }

  [err, user] = await to(user.destroy());
  if (err) return ReE(res, 'error occured trying to delete user');

  return ReS(res, { message: 'Deleted User' });
};

module.exports.login = async (req, res) => {
  const [err, user] = await to(userService.authUser(req.body));
  if (err) return ReE(res, err, 422);

  return ReS(res, { token: user.getJWT(), user: user.toWeb() });
};

module.exports.register = async (req, res) => {
  const { body } = req;

  if (!body.email) {
    return ReE(res, 'Please enter an email to register.');
  } if (!body.password) {
    return ReE(res, 'Please enter a password to register.');
  }

  const [err, user] = await to(userService.createUser(body));
  if (err) return ReE(res, err, 422);

  return ReS(res, { message: 'Successfully created new user.', user: user.toWeb(), token: user.getJWT() }, 201);
};

module.exports.self = async (req, res) => ReS(res, {
  user: {
    id: req.user.id,
    first: req.user.first,
    last: req.user.last,
    email: req.user.email,
    role: req.user.role,
    calories: req.user.calories,
  },
});

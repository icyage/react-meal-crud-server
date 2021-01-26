/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-const */
const { Op } = require('sequelize');
const mealService = require('../services/meal.service');
const userService = require('../services/user.service');
const { to, ReE, ReS } = require('../services/util.service');

module.exports.create = async (req, res) => {
  const authUser = req.user;
  let { user } = req.body;

  if (!user) {
    user = authUser.id;
  }

  const {
    date, time, text, calories,
  } = req.body;

  if (!date || !time || !text || !calories) {
    return ReE(res, 'Please provide all information.');
  }

  let [err, mealUser] = await to(userService.getOneUser({ id: user }));
  if (err || !mealUser) {
    return ReE(res, 'Invalid meal user id');
  }
  if (mealUser.role === 'Manager') {
    return ReE(res, 'Manager can\'t create meals');
  }

  let [err1, meal] = await to(mealService.createMeal(req.body));
  if (err1) {
    return ReE(res, err1);
  }

  let [err2, total] = await to(mealService.getDayCalories(meal.user, meal.date));
  if (err2) {
    return ReE(res, err2);
  }

  const mealData = meal.toWeb();
  mealData.over = total > mealUser.calories;

  return ReS(res, { message: 'Successfully created new meal.', meal: mealData }, 201);
};

module.exports.read = async (req, res) => {
  const { user } = req;
  const {
    dateFrom, dateTo, timeFrom, timeTo,
  } = req.body;

  const query = {};
  if (user.role === 'Regular') {
    query.user = user.id;
  }

  if (dateFrom) {
    query.date = {
      [Op.gte]: dateFrom,
    };
  }
  if (dateTo) {
    query.date = {
      ...query.date,
      [Op.lte]: dateTo,
    };
  }
  if (timeFrom) {
    query.time = {
      [Op.gte]: timeFrom,
    };
  }
  if (timeTo) {
    query.time = {
      ...query.time,
      [Op.lte]: timeTo,
    };
  }

  let [err, meals] = await to(mealService.getManyMeals(query));
  if (err) {
    return ReE(res, err);
  }
  meals = meals.map((meal) => meal.toWeb());

  const dateToCal = {};
  let i = 0;
  const data = [];
  for (; i < meals.length; i += 1) {
    const mealData = meals[i];

    const { user, date } = mealData;

    let totalCalories;
    if (!dateToCal[user]) {
      dateToCal[user] = {};
    }
    if (dateToCal[user][date]) {
      totalCalories = dateToCal[user][date];
    } else {
      const [err1, total] = await to(mealService.getDayCalories(user, date));
      if (err1) {
        return ReE(res, err1);
      }
      dateToCal[user][date] = total;
      totalCalories = total;
    }

    const [err2, mealUser] = await to(userService.getOneUser({ id: user }));
    if (err2) {
      return ReE(res, err2);
    }

    mealData.over = totalCalories > mealUser.calories;
    data.push(mealData);
  }

  return ReS(res, { meals: data });
};

module.exports.update = async (req, res) => {
  let data = req.body;

  const { mealId } = req.params;
  let [err, meal] = await to(mealService.getOneMeal({ id: mealId }));
  if (err || !meal) {
    return ReE(res, 'Meal doesn\'t exist');
  }

  const oldUser = meal.user;

  let { user } = data;
  if (!user) {
    user = meal.user;
  }
  let [err1, mealUser] = await to(userService.getOneUser({ id: user }));
  if (err1 || !mealUser) {
    return ReE(res, 'User not found');
  }
  if (mealUser.role === 'Admin' && req.user.role === 'Regular') {
    return ReE(res, 'Permission denied');
  }

  meal.set(data);

  [err, meal] = await to(meal.save());
  if (err) {
    return ReE(res, err);
  }

  let [err2, total] = await to(mealService.getDayCalories(meal.user, meal.date));
  if (err2) {
    return ReE(res, err2);
  }
  const mealData = meal.toWeb();
  mealData.over = total > mealUser.calories;

  if (oldUser !== meal.user) {
    [err, mealUser] = await to(userService.getOneUser({ id: oldUser }));
    if (err || !mealUser) {
      return ReE(res, 'Old user not found');
    }

    [err, total] = await to(mealService.getDayCalories(oldUser, meal.date));
    if (err) {
      return ReE(res, err);
    }
    mealData.oldOver = total > mealUser.calories;
    mealData.oldUser = oldUser;
  }

  return ReS(res, { meal: mealData });
};

module.exports.remove = async (req, res) => {
  const { mealId } = req.params;
  let [err, meal] = await to(mealService.getOneMeal({ id: mealId }));
  if (err || !meal) {
    return ReE(res, 'Meal doesn\'t exist');
  }

  let [err1, mealUser] = await to(userService.getOneUser({ id: meal.user }));
  if (err1 || !mealUser) {
    return ReE(res, 'User not found');
  }

  let [err2, total] = await to(mealService.getDayCalories(meal.user, meal.date));
  if (err2) {
    return ReE(res, err2);
  }
  const over = (total - meal.calories) > mealUser.calories;

  [err, meal] = await to(meal.destroy());
  if (err) return ReE(res, 'error occured trying to delete user');

  return ReS(res, { message: 'Deleted Meal', over });
};

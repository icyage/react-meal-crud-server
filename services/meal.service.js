const { Meal } = require('../models');
const { to, TE } = require('./util.service');

module.exports.createMeal = async (mealInfo) => {
  const [err, meal] = await to(Meal.create(mealInfo));
  if (err) TE(err.message);
  return meal;
};

module.exports.getOneMeal = async (query) => {
  const [err, meal] = await to(Meal.findOne({ where: query }));
  if (err) TE(err.message);
  return meal;
};

module.exports.getManyMeals = async (query) => {
  const [err, meals] = await to(Meal.findAll({ where: query }));
  if (err) TE(err.message);
  return meals;
};

module.exports.getDayCalories = async (user, date) => {
  const [err, total] = await to(Meal.sum('calories', { where: { user, date } }));
  if (err) TE(err.message);
  return total;
};

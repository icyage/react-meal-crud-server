const { TE } = require('../services/util.service');

module.exports = (sequelize, DataTypes) => {
  const Meal = sequelize.define('Meal', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    calories: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Meal.assoicate = function (models) {
    Meal.belongsTo(models.User, { foreignKey: 'user', targetKey: 'user' });
  };

  Meal.beforeSave(async (meal) => {
    if (meal.calories < 0) TE('Calories is invalid');
  });

  Meal.prototype.toWeb = function () {
    const json = this.toJSON();
    return {
      id: json.id,
      user: json.user,
      date: json.date,
      time: json.time,
      text: json.text,
      calories: json.calories,
    };
  };

  return Meal;
};

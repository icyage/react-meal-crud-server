/* eslint-disable camelcase */
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const { TE, to } = require('../services/util.service');
const CONFIG = require('../config');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    first: {
      type: DataTypes.STRING,
    },
    last: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: { isEmail: { msg: 'Invalid email' } },
    },
    password: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'Regular',
      allowNull: false,
    },
    calories: {
      type: DataTypes.INTEGER,
      defaultValue: 500,
    },
  });

  User.associate = function (models) {
    this.hasMany(models.Meal, { foreignKey: 'user', targetKey: 'user' });
  };

  User.beforeSave(async (user) => {
    if (user.calories < 0) TE('Calories is invalid');
    if (user.changed('password')) {
      const [err, salt] = await to(bcrypt.genSalt(10));
      if (err) TE(err.message, true);

      const [err1, hash] = await to(bcrypt.hash(user.password, salt));
      if (err1) TE(err1.message, true);

      // eslint-disable-next-line no-param-reassign
      user.password = hash;
    }
  });

  User.prototype.comparePassword = async function (pw) {
    if (!this.password) TE('password not set');

    const [err, pass] = await to(bcrypt_p.compare(pw, this.password));
    if (err) TE(err);

    if (!pass) TE('invalid password');

    return this;
  };

  User.prototype.getJWT = function () {
    const expiration_time = parseInt(CONFIG.jwt_expiration, 10);
    return `Bearer ${jwt.sign({ user_id: this.id }, CONFIG.jwt_encryption, { expiresIn: expiration_time })}`;
  };

  User.prototype.toWeb = function () {
    const json = this.toJSON();
    return {
      id: json.id,
      first: json.first,
      last: json.last,
      email: json.email,
      role: json.role,
      calories: json.calories,
    };
  };

  return User;
};

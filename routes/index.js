const express = require('express');

const router = express.Router();

const passport = require('passport');
const UserController = require('../controllers/user.controller');
const MealController = require('../controllers/meal.controller');

const role = require('../middleware/role');


require('../middleware/passport')(passport);

router.post('/meals', [passport.authenticate('jwt', { session: false }), role(['Regular', 'Admin'])], MealController.create); // C
router.post('/meals/read', [passport.authenticate('jwt', { session: false }), role(['Regular', 'Admin'])], MealController.read); // R
router.put('/meals/:mealId', [passport.authenticate('jwt', { session: false }), role(['Regular', 'Admin'])], MealController.update); // U
router.delete('/meals/:mealId', [passport.authenticate('jwt', { session: false }), role(['Regular', 'Admin'])], MealController.remove); // D

router.post('/users', [passport.authenticate('jwt', { session: false }), role(['Manager', 'Admin'])], UserController.create); // C
router.get('/users', [passport.authenticate('jwt', { session: false }), role(['Manager', 'Admin'])], UserController.read); // R
router.get('/users/self', [passport.authenticate('jwt', { session: false })], UserController.self); // R
router.put('/users/:userId', [passport.authenticate('jwt', { session: false }), role(['Manager', 'Regular', 'Admin'])], UserController.update); // U
router.delete('/users/:userId', [passport.authenticate('jwt', { session: false }), role(['Manager', 'Admin'])], UserController.remove); // D

router.post('/users/login', UserController.login);
router.post('/users/register', UserController.register);

module.exports = router;

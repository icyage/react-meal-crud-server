const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');
const cors = require('cors');

const app = express();
const routes = require('./routes');
const CONFIG = require('./config');

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(passport.initialize());

// DATABASE
const models = require('./models');

models.sequelize.authenticate().then(() => {
  console.log('Connected to SQL database:', CONFIG.db_name);
}).catch((err) => {
  console.error('Unable to connect to SQL database:', CONFIG.db_name, err);
});

if (CONFIG.app === 'dev') {
  models.sequelize.sync();// creates table if they do not already exist
  // deletes all tables then recreates them useful
  // for testing and development purposes
  // models.sequelize.sync({ force: true });
}

app.use(cors());

app.use('/', routes);

app.listen(CONFIG.port, () => console.log(`Server is running on port ${CONFIG.port}`));

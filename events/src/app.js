const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const { i18nMiddleware } = require('./config/i18n');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(i18nMiddleware);

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: req.t('errors.notFound') });
});

app.use(errorHandler);

module.exports = app;

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const errorHandler = require('./_helpers/error.handler');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Pocket_APP API',
      version: '1.0.0',
      description: 'Pocket_APP API',
    },
    servers: [
      {
        url: 'http://127.0.0.1:5000',
      },
    ],
  },
  apis: ['./src/v1/routes/*.js'],
};

Date.prototype.getWeekOfMonth = function (exact) {
  var month = this.getMonth(),
    year = this.getFullYear(),
    firstWeekday = new Date(year, month, 1).getDay(),
    lastDateOfMonth = new Date(year, month + 1, 0).getDate(),
    offsetDate = this.getDate() + firstWeekday - 1,
    index = 0,
    weeksInMonth = index + Math.ceil((lastDateOfMonth + firstWeekday - 7) / 7),
    week = index + Math.floor(offsetDate / 7);
  if (exact || week < 2 + index) return week;
  return week === weeksInMonth ? index + 5 : week;
};

require('dotenv').config();

var app = express();

// For developement: Run the frontend app on port 8081 to access this API
var corsOptions = {
  origin: '*',
};
app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res, next) {
  res.json({ title: 'Node - Express - Mongo - JWT - MVC - Starter Project' });
  // next(createError(404));
});

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const router = require('./routes');

app.use('/api', router);

// Catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

app.use(errorHandler);
// default error handler that comes with express generator - can be used instead of the above
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.json({ "error": true });
// });

module.exports = app;

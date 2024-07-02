const express = require('express');
// morgan is thirt-party middleware
const morgan = require('morgan');
// express is node js framework
const app = express();


const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// 1) MIDDLEWARE
app.use(morgan('dev'));
app.use(express.json());



app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})


// 3) ROUTE
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;



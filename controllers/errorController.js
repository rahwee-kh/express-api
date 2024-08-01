const AppError = require("../utils/appError");


const handleJsonWebTokenError = err => {
  const message = `Invalid token. Please login again.`
  return new AppError(message, 401);
}

const handleTokenExpiredError = () => new AppError('Expired token', )


const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const keys = Object.keys(err.keyPattern);
    const message = `Duplicate field value: ${keys}. Please use another value!`;
    return new AppError(message, 400);
}

const handleValidationFieldsDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400)
}

const respondErrorDev = (err, res) => {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
}

const respondErrorProduction = (err, res) => {
    // Operational, trusted error: send message to the client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // Programming or other unknown error: don't leak error detail
    else {
      // 1- Log error
      console.log('ERROR', err);

      // 2 - Send generic message
      res.status(500).json({
        status: 'error',
        message: 'Something weng wrong!',
      });
    }
    
}


module.exports = ((err, req, res, next) => {

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if(process.env.NODE_ENV === 'development'){

    respondErrorDev(err, res);

  }else if(process.env.NODE_ENV === 'production'){

    // let error = {...err };
    let error = JSON.parse(JSON.stringify(err));    
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationFieldsDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJsonWebTokenError()
    if (error.name === 'TokenExpiredError')
      error = handleTokenExpiredError();
      
      respondErrorProduction(error, res);

  }

});
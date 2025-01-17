
const { promisify } = require('util');
const jwt           = require('jsonwebtoken');
const User          = require('./../models/userModel');
const catchAsync    = require('../utils/catchAsync');
const AppError      = require('../utils/appError');
const sendEmail     = require('../utils/email');
const crypto        = require('crypto')

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync( async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: req.body.passwordChangeAt,
    role: req.body.role
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1- Check if email and password exist
  if (!email || !password) {
    next(console.log('email or password incorrect!, 400'));
  }

  // 2- Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(console.log('Incorrect email or password 401'));
  }

  // 3- If everything ok, send token to client
  createSendToken(user, 200, res);
});




exports.protect = catchAsync(async (req, res, next) => {

  // 1- Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! please log in to get access.', 401)
    );
  }

  // 2- Verification token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3- Check if user still exists
  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(new AppError('The user belong to this token no longer exist.'));
  }

  // 4- Check if user changed password after the token was issued
  if( currentUser.changePasswordAfter(decode.iat)){
    return next(new AppError('User recently change password! Please login again.', 401));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  
  next();
});


exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin, 'lead-guide']. role='user'
    // 403 forbidden
    console.log('User role:', req.user.role); // Add this line
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync( async (req, res, next) => {
  // 1- Get user based on POST email
  const user = await User.findOne({email: req.body.email});

  if(!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2- Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false});//turn of validation to be able to save

  // 3- Send it to user's email
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message  = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password, please ingore this email!`;

  try{
    await sendEmail({
    email: user.email,
    subject: 'Your password reset token (valid for 10 min)',
    message
  })

  res.status(200).json({
    status: 'Success',
    message: 'Token sent to email'
  });

  }catch(err){
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false})

    return next(AppError('There was an error sending the email. Try again later.'), 500);
  }
  
});

exports.resetPassword = catchAsync( async (req, res, next) => {
  // 1- Get user base on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user        = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}});

  // 2- If token has not expired, and there is user, set the new password
  if(!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password             = req.body.password;
  user.passwordConfirm      = req.body.passwordConfirm;
  user.passwordResetToken   = undefined;
  user.passwordResetExpires = undefined
  await user.save();

  // 4- Log the user in, send JWT
  createSendToken(user, 200, res);
});



exports.updatePassword = catchAsync( async (req, res, next) => {
  // 1- Get user from collection 
  // We get id of use auhenticated user
  const user = await User.findById(req.user.id).select('+password');

  // 2- Check if Posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // 3- If so, update password
  user.password        = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); // User.findByIdAndUpdate will NOT work as intended!
  
  // 4- Log user in, send JWT
  createSendToken(user, 200, res);
})

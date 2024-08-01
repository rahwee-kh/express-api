const AppError   = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User       = require('./../models/userModel');


const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el)) newObj[el] = obj[el];
  })
  return newObj;
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    // SEND RESPOND
    res.status(200).json({
      status: 'Success',
      results: users.length,
      data: {
        users,
      },
    });

});

exports.getUser = catchAsync( async(req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1- Create error is user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Plese use /updateMyPassword.',
        400
      )
    );
  }
  // 2 - Filtered out unwanted fields name that are allow to be update
  const filterBody = filterObj(req.body, 'name', 'email');
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

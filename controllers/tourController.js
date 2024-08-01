
const AppError = require('../utils/appError')
const Tour        = require('./../models/tourModel')
const BaseFeature = require('./../utils/apiFeatures')
const catchAsync  = require('./../utils/catchAsync')

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next();
}

exports.getAllTours = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  console.log('==============')
  const features = new BaseFeature(Tour.find(), req.query)
    .filter()
    .sort()
    .litmitField()
    .paginate();
  const tours = await features.query;

  // SEND RESPOND
  res.status(200).json({
    status: 'Success',
    results: tours.length,
    data: {
      tours,
    },
  });
});


exports.createTour = catchAsync( async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'Success',
    data: {
      tour: newTour,
    },
  });
});


exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  res.status(200).json({
    status: 'Success',
    data: {
      tour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError(`No tour found with that ID`, 404));
  }

  res.status(200).json({
    status: 'Success',
    data: {
      tour,
    },
  });
});


exports.deleteTour = catchAsync( async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError(`No tour found with that ID`, 404));
  }
  res.status(204).json({
    status: 'Success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {

    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty'},
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $avg: '$price' },
          maxPrice: { $avg: '$price' },
        },
      },
      {
        $sort: {
          avgPrice: 1
        }
      }

    ]);

    res.status(200).json({
      status: 'Success',
      data: {
        stats
      },
    });
});


const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    unique: true,
    trim: true,
  },

  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },

  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have group size'],
  },

  difficulty: {
    type: String,
    required: [true, 'A tour must have difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either: easy, medium, or difficult',
    },
  },

  ratingsAverage: {
    type: Number,
    default: 4.5,
  },

  ratingsQuatity: {
    type: Number,
    default: 0,
    max: [5, 'Ratings quantity must be less than or equal to 5'],
  },

  price: {
    type: Number,
    required: [true, 'Price is required'],
  },

  priceDiscount: {
    type: Number,
  },

  summary: {
    type: String,
    trim: true,
    required: [true, 'A ture mush have description'],
  },

  description: {
    type: String,
    trim: true,
  },

  imageCover: {
    type: String,
    required: [true, 'Tour must have a cover image'],
  },
  image: [String],

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  startDate: [Date],

  secretTour: {
    type: Boolean,
    default: false
  },

  startLocation: {
    // GeoJSON
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [ Number ],
    address: String,
    description: String
  },
  
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      }, 
      coordinates: [ Number ],
      address: String,
      description: String,
      day: Number
    }
  ]
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
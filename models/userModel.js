const mongoose  = require('mongoose')
const validator = require('validator')
const bcrypt    = require('bcryptjs')
const crypto    = require('crypto')

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A name is required'],
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email must be valide'],
  },

  photo: String,

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },

  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your confirm'],
    // This only work on CREATE and SAVE!!!
    validate: {
      validator: function (el) {
        return el === this.password; // abc===abc
      },
      message: 'Password are not the same!',
    },
  },
  

  passwordChangeAt: Date,

  passwordResetToken: String,
  passwordResetExpires: Date

  
});


userSchema.pre('save', async function (next) {
    // Only run this function if password is modified
    if(!this.isModified('password')) return next();
    
    // hash password with 12
    this.password = await bcrypt.hash(this.password, 12)

    this.passwordConfirm = undefined
    
    next();
});

userSchema.pre('save', function(next){
  if (!this.isModified('password') || this.isNew) return next();
  // Prevent sometime token created before passwordChangeAt
  // this make use can't login with new token
  this.passwordChangeAt = Date.now() - 1000;
  next();
})

// static instance method check if correct password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

// static instance method to check of user has change password after generate token
// * if JWTTimestamp < changeTimestamp mean not change password
userSchema.methods.changePasswordAfter = function(JWTTimestamp){
    if(this.passwordChangeAt){
        const changeTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10)
        return JWTTimestamp < changeTimestamp; // eg: 100 < 200
    }

    // False mean not change
    return false
    
}

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  // expired in 10 mn
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
}


const User = mongoose.model('User', userSchema);
module.exports = User;
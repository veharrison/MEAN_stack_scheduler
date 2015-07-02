var crypto = require('crypto');//crypto is  module that ships with node, using for hashing
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken'); // this is an external library used to generate jwt tokens
//defining the schema
var UserSchema = new mongoose.Schema({
  username: String,
  email: {type: String, lowercase:true, unique: true},
  hash: String,
  salt: String,
  contact_no: Number,
  description: String,
  address: {
    address: String,
    city: String,
    country: String,
    pincode: Number,
  }
  
});
//function to store password
UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');

  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};
// function to validate the password
UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

  return this.hash === hash;
};

//method used to generate jwt tokens
UserSchema.methods.generateJWT = function() {

  // set expiration to 60 days
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    email: this.email,
    exp: parseInt(exp.getTime() / 1000),
  }, 'SECRET');
};

//consolidating the schema into a model
mongoose.model('User', UserSchema);
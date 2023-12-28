const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.Promise = global.Promise;


const authSchema = mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    firstName: {type: String, default: ''},
    lastName: {type: String, default: ''},
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'userList'}]
  });
  
  authSchema.methods.serialize = function() {
    return {
      _id: this._id || '',
      username: this.username || '',
      firstName: this.firstName || '',
      lastName: this.lastName || '',
      posts: this.posts || []
    };
  };
  
  authSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
  };
  
  authSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
  };

  const authList = mongoose.model('authList', authSchema);

  module.exports = {authList};
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const searchSchema = mongoose.Schema({
    
  budget: {type: Number, required: true},
  location: {type: String, required: true},
  meals: {type: Number, required: true},
  time: {type: Number, required: true},
  info: {type: String, required: true},
  unit: {type: String, required: true}
});
 

searchSchema.methods.serialize = function() {
  return {
    budget: this.budget,
    location: this.location,
    meals: this.meals,
    time: this.time,
    info: this.info,
    unit: this.unit
  };
}


  const userList = mongoose.model('userList', searchSchema);

  module.exports = {userList};
  
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new Schema({
	email: {
		type: String,
    unique: true,
    required: true,
    trim: true
	},
	username: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
	token: {
		type: String,
	}
});

UserSchema.plugin(uniqueValidator);

UserSchema.statics.authenticate = function (email, password, callback) {
  User.findOne({ email: email })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      })
    });
}

UserSchema.pre('save', function (next) {
  let user = this;
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});

UserSchema.statics.findUserByToken = function findUserByToken(token, callback) {
	User.findOne(
		{ token: token },
		function (err, doc) {
			if(doc) {
				return callback(null, doc)
			}
			else {
				let error = "You must be logged";
				return callback(error);
			}
		}
	);
}

UserSchema.methods.toClient = function toClient() {
	const obj = this.toObject();
	// // Rename fields:
	obj.id = obj._id.toHexString();
	delete obj._id;
	return obj;
}

// Компилируем модель из схемы
const User = mongoose.model('User', UserSchema );

module.exports = User

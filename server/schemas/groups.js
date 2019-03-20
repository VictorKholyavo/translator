const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Words = require('../schemas/words');

const GroupSchema = new Schema({
	title: {
		type: String,
    required: true
	},
	date: {
    type: Date,
    default: Date.now,
  },
  words: [],
	userId: {
		type: String
	},
});

GroupSchema.methods.toClient = function toClient() {
	const obj = this.toObject();
	// // Rename fields:
	obj.words = obj.words.length;
	obj.id = obj._id.toHexString();
	delete obj._id;
	return obj;
}

GroupSchema.methods.idsOfWords = function idsOfWords() {
	const obj = this.toObject();
	// // Rename fields:
	obj.id = obj._id.toHexString();
	delete obj._id;
	return obj;
}

GroupSchema.statics.findGroupsForUser = function findGroupsForUser(userId, callback) {
	Groups.find(
		{ userId: userId },
		function (err, doc) {
			//doc.findByToken()
			if (err) {
				let error = "No groups found";
				return callback(error);
			}
			else {
				return callback(null, doc)
			}
		}
	);
}

// Компилируем модель из схемы
const Groups = mongoose.model('Groups', GroupSchema );

module.exports = Groups

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WordSchema = new Schema({
	english: {
		type: String,
    required: true,
	},
	russian: {
    type: String,
    required: true,
  },
  partOfSpeech: {
    type: String,
    required: true,
  }
});

WordSchema.methods.toClient = function toClient() {
	const obj = this.toObject();
	// // Rename fields:
	obj.id = obj._id.toHexString();
	delete obj._id;
	return obj;
}

// Компилируем модель из схемы
const Words = mongoose.model('Words', WordSchema );

module.exports = Words;

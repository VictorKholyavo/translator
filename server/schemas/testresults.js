const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResultsSchema = new Schema({
	userId: {
		type: String,
		sparse: true
	},
	results: []
});

ResultsSchema.methods.toClient = function toClient() {
	const obj = this.toObject();
	// // Rename fields:
	obj.id = obj._id.toHexString();
	delete obj._id;
	return obj;
}

// Компилируем модель из схемы
const Results = mongoose.model('Results', ResultsSchema );

module.exports = Results

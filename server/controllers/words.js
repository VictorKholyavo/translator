const Groups = require('../schemas/groups');
const Words = require('../schemas/words');
const express = require('express');
let app = express();
const mongoose = require('mongoose');

app.get('/', async (req, res) => {
	try {
		const words = await Words.find().exec();
		res.send(words.map(word => word.toClient()));
	} catch (error) {
		res.status(500).send("Something broke");
	}
})

app.post('/', async (req, res) => {
	try {
		let newWord = await new Words({
			english: req.body.english,
			russian: req.body.russian,
			partOfSpeech: req.body.partOfSpeech,
			group: req.body.group
		});
		newWord.save(function(err, docs) {
			res.send(newWord.toClient());
		});
		await Groups.findOneAndUpdate(
			{ _id: newWord.group },
			{
				$push: {
					amount: newWord._id
				}
			}
		);
	} catch (error) {
		res.status(500).send("Something broke");
	}
})

app.delete('/:id', async (req, res) => {
	try {
		await Words.findOneAndRemove(
			{ _id: req.params.id },
		);
		res.send({id: req.params.id})
	} catch (error) {
		res.status(500).send("Something broke");
	}
})

module.exports = app

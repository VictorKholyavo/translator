const express = require('express');
let app = express();
const mongoose = require('mongoose');
const Groups = require('../schemas/groups');
const User = require('../schemas/users');
const Words = require('../schemas/words');
const Results = require('../schemas/testresults');

app.get('/all', async (req, res) => {
	try {
		const groups = await Groups.find().exec();
		res.send(groups.map(group => group.idsOfWords()));
	} catch (error) {
		res.status(500).send("Something broke");
	}
})

app.post('/', async (req, res) => {
	try {
		await Groups.findById(req.body.groupId, function (err, docs) {
			if (req.body.mode == "generate") {
				let array = [];
				let wordsForTest = []

				function compareRandom(a, b) {
				  return Math.random() - 0.5;
				}

				docs.words.sort(compareRandom);

				function addVariables(word) {
					function filterByPartOfSpeech(el) {
						return el.partOfSpeech == word.partOfSpeech
					}
					let wordsByPartOfSpeech = docs.words.filter(filterByPartOfSpeech)

					let temp = [];
					let variables = [];
					for (let i = 0; i < wordsByPartOfSpeech.length; i++) {
						if (wordsByPartOfSpeech[i].russian == word.russian) {
							continue;
						}
						else {
							temp.push(wordsByPartOfSpeech[i].russian);
						}
					}

					for (let i = 0; i < 3; i++) {
						if (temp[i]) {
							variables.push(temp[i])
						}
					}
					variables.push(word.russian);
					variables.sort(compareRandom);

					word.option1 = variables[0];
					word.option2 = variables[1];
					word.option3 = variables[2];
					word.option4 = variables[3];

					array.push(word)
				}

				for (let i = 0; i < 5; i++) {
					if (docs.words[i]) {
						wordsForTest.push(docs.words[i]);
						addVariables(wordsForTest[i])
					}
					else break;
				}

				return res.send(array.map(function(word) {
					word.id = word._id.toHexString();
					delete word._id;
					return word;
				}));
			}
			else if (req.body.mode == "check") {
				let mark = 0;
				let test = req.body.test;
				test = JSON.parse(test);
				outer: for (let i = 0; i < test.length; i++) {
					for (let j = 0; j < docs.words.length; j++) {
						if (test[i].id == docs.words[j]._id && test[i].value == docs.words[j].russian) {
							if (test[i].partOfSpeech == "Noun" || test[i].partOfSpeech == "Verb" ) {
								mark = mark + 2;
							}
							else {
								mark = mark + 1;
							}
							continue outer;
						}
					}
				}

				let result = { date: new Date(), result: mark}
				User.findUserByToken(req.headers.authorization, function (err, userInfo) {
					if (err) {
						return res.sendStatus(403)
					}
					else if (userInfo) {
						Results.findOneAndUpdate(
							{ userId: userInfo._id},
							{
								$push: {
									results: result
								}
							},
							{
								new: true
							},
							function (err, docs) {
								if (err) {
									return console.log(err);
								}
								return res.json(mark)
							}
						);
					}
				})
			}
		});
	} catch (error) {
		res.status(500).send("Something broke");
	}
})

app.delete('/:id', async (req, res) => {
	try {
		await Groups.findOneAndRemove(
			{ _id: req.params.id },
		);
		res.send({id: req.params.id})
	} catch (error) {
		res.status(500).send("Something broke");
	}
})

module.exports = app

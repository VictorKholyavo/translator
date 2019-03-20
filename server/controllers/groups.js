const express = require('express');
let app = express();
const mongoose = require('mongoose');
const Groups = require('../schemas/groups');
const User = require('../schemas/users');
const Words = require('../schemas/words');

app.get('/all', async (req, res) => {
	try {
		const groups = await Groups.find().exec();
		res.send(groups.map(group => group.idsOfWords()));
	} catch (error) {
		res.status(500).send("Something broke");
	}
})

app.get('/', async (req, res) => {
	try {
		await User.findUserByToken(req.headers.authorization, async (err, userInfo) => {
			if (err) {
				return res.sendStatus(403)
			}
			else if (userInfo) {
				let userId = userInfo._id;
				await Groups.findGroupsForUser(userId, function(err, groups){
					return res.send(groups.map(group => group.toClient()));
				})
			}
		})
	} catch (error) {
		res.status(500).send("Something broke");
	}
});

app.get('/words', async (req, res) => {
	try {
		await User.findUserByToken(req.headers.authorization, async (err, userInfo) => {
			if (err) {
				return res.sendStatus(403)
			}
			else if (userInfo) {
				let userId = userInfo._id;
				await Groups.find(
					{ userId: userId }, function (err, docs) {
						let arrayOfWords = [];
						for (let i = 0; i < docs.length; i++) {
							for (let j = 0; j < docs[i].words.length; j++) {
								docs[i].words[j].groupId = docs[i]._id						// приписываем каждому слову id группы, к которой оно принадлежит
								arrayOfWords.push(docs[i].words[j]);
							}
						}
						res.send(arrayOfWords);
				});
			}
		})
	} catch (error) {
		res.status(500).send("Something broke");
	}
});

app.put('/:id', async (req, res) => {
	let newWord = await new Words({
		english: req.body.english,
		russian: req.body.russian,
		partOfSpeech: req.body.partOfSpeech
	});
	try {
		await Groups.findOneAndUpdate(
			{ _id: req.body.group },
			{
				$push: {
					words: newWord
				}
			},
			{
				new: true,
				upsert: false
			}
		);
		return res.send(newWord);

	} catch (error) {
		res.status(500).send("Something broke");
	}
});

app.post('/', async (req, res) => {
	try {
		await User.findUserByToken(req.headers.authorization, async (err, userInfo) => {
			if (err) {
				return res.status(403).send("User not found");
			}
			let newGroup = await new Groups({
				title: req.body.title,
				amount: req.body.amount,
				userId: userInfo._id
			});
			Groups.collection.dropIndexes();
			newGroup.save(function(err, docs) {
				if (err) {
					res.status(500).send("Something broke");
				}
				return res.send(newGroup.toClient());
			});
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
});

module.exports = app

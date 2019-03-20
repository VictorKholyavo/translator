const express = require('express');
let app = express();
const mongoose = require('mongoose');
const Groups = require('../schemas/groups');
const User = require('../schemas/users');
const Results = require('../schemas/testresults');

app.get('/', async (req, res) => {
	try {
		const results = await Results.find().exec();
		res.send(results.map(result => result.toClient()));
	} catch (error) {
		res.status(500).send("Something broke");
	}
})

app.get("/all", async (req, res) => {
	try {
		User.findUserByToken(req.headers.authorization, async (err, userInfo) => {
			if (err) {
				return res.sendStatus(403)
			}
			else if (userInfo) {
				await Results.findOne({userId: userInfo._id}, function (err, docs) {
					if (err) {
						return res.status(500).send("Something broke");
					}
					else if (docs) {
						for (let i = 0; i < docs.results.length; i++) {
							if (docs.results[i]) {
								docs.results[i].index = i + 1;
							}
						}
						res.send(docs.results);
					}
					else if (!docs) {
						return res.send({result: "No passed tests"});
					}
				});
			}
		})
	} catch (error) {
		res.status(500).send("Something broke");
	}
})

app.delete('/:id', async (req, res) => {
	try {
		await Results.findOneAndRemove(
			{ _id: req.params.id },
		);
		res.send({id: req.params.id})
	} catch (error) {
		res.status(500).send("Something broke");
	}
})

module.exports = app

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const bcrypt = require('bcrypt');
const User = require('../schemas/users');
const Results = require('../schemas/testresults');

app.get('/', async (req, res) => {
	try {
		const users = await User.find().exec();
		res.send(users.map(user => user.toClient()));
	} catch (error) {
		res.status(500).send("Something broke");
	}
})

app.get('/status', async (req, res) => {
	try {
		await User.findUserByToken(req.headers.authorization, function(err, userInfo) {
			if (err) {
				return res.sendStatus(403);
			}
			return res.json({token: req.body.token, username: userInfo.username});
		})
	}
	catch (error) {
		return res.sendStatus(403);
	}
})

app.post('/login', async (req, res) => {
	try {
		User.authenticate(req.body.email, req.body.password, function (error, user) {
			if (!user) {
				console.log('Wrong email or password.');
				res.sendStatus(403)
			} else {
				let token = jwt.sign({ email: req.body.email, password: req.body.password }, 'keyboard', { expiresIn: 129600 }); // Sigining the token
				User.findOneAndUpdate(
					{ _id: user._id },
					{
						$set: {
							token: token,
						}
					},
					function (err, doc) {
						res.json({token:token, _id: doc._id, username: doc.username});
					}
				)
			}
		})
	} catch (e) {
		res.sendStatus(403)
	}
})

app.post('/registration', async (req, res) => {
	try {
		if (req.body.email && req.body.username && req.body.password) {
			let newUser = await new User({
				email: req.body.email,
				username: req.body.username,
				password: req.body.password,
				token: "inactive"
			});
			newUser.save(function(err, docs) {
				if (err) {
					return res.status(401).send("Email already registered")
				}
				let token = jwt.sign({ email: docs.email, password: docs.password }, 'keyboard', { expiresIn: 129600 }); // Sigining the token
				User.findOneAndUpdate(
					{ _id: docs._id },
					{
						$set: {
							token: token,
						}
					},
					function (err, doc) {
						Results.collection.dropIndexes();
						let newResultsForUser = new Results ({
							userId: docs._id,
							results: [],
						});
						newResultsForUser.save();
						res.json({token:token, email: doc.email, username: doc.username});
					}
				)
			});
		}
	} catch (error) {
		res.status(500).send("Something brokeasd");
	}
});


app.post('/logout', async (req, res, next) => {
	User.findOneAndUpdate(
		{ username: req.body.username},
		{
			$set: {
				token: "inactive",
			}
		},
		function (err, docs) {
			res.json(docs);
		}
	)
});

app.delete('/:id', async (req, res) => {
	try {
		await User.findOneAndRemove(
			{ _id: req.params.id },
		);
		res.send({id: req.params.id})
	} catch (error) {
		res.status(500).send("Something broke");
	}
})

module.exports = app;

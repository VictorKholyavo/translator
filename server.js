const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
//const MongoStore = require('connect-mongo')(session);
const ObjectID = require('mongodb').ObjectID;
const session = require('express-session');
const UsersController = require('./server/controllers/users');
const GroupsController = require('./server/controllers/groups');
const TestsController = require('./server/controllers/tests');
const ResultsController = require('./server/controllers/testresults');
const cors = require('cors');
const path = require('path');
const app = express();
const MongoStore = require('connect-mongo')(session);
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');

app.use(cors());
app.use(express.static(path.join(__dirname, '../')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', function (req, res) {
	res.send('Hello API');
})

mongoose.connect(`mongodb://${process.env.DB_HOST || 'localhost'}:27017/myapir`, function (err) {
	if (err) throw err;
  console.log('Successfully connected');
	const db = mongoose.connection;

	// app.use(session({
	//   secret: 'work hard',
	// 	path: '/',
	//   resave: true,
	//   saveUninitialized: false,
	// 	cookie: {maxAge: 10000},
	//   store: new MongoStore({
	//     mongooseConnection: db
	//   })
	// }));

	app.use('/users', UsersController);

	app.use('/groups', GroupsController);

	app.use('/test', TestsController);

	app.use('/testresults', ResultsController);

	app.listen(3013, function () {
		console.log('API app started');
	})
})

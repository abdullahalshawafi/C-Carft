const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const fs = require('fs');
const fileUpload = require('express-fileupload');
require('dotenv/config');

// Importing Courses model
const Courses = require('./models/Course');

// init express app
const app = express();

// Setting the listening port
const port = process.env.PORT || 8080;

// Determining the enviroment
const env = process.env.NODE_ENV || 'development';

// Connecting to MongoDB
mongoose.connect((env === 'development') ? process.env.DB_LOCAL_CONNECTION : process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("Connected to DB");
});

// Setting the public folder
app.use(express.static(path.join(__dirname, 'public')));

// body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// express-session middleware
const MongoStore = require('connect-mongo')(session);
app.use(session({
    secret: 'secret cat',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: db })
}));

// passport configuration
require("./config/passport")(passport);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// express-fileupload middleware
app.use(fileUpload());

// connect-flash & express-messages middlewares
app.use(require('connect-flash')());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Declaring all courses as global variables
app.use((req, res, next) => {
    Courses.find({}, (err, courses) => {
        if (err) return console.log(err);
        if (courses) {
            res.locals.courses = courses;
            next();
        }
    });
});

// Declaring the logged in user as a global variable
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Setting up the view folder & views engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// GET home page
app.get('/', (req, res) => {
    res.render('home', {
        title: 'Home'
    });
});

// GET delete all users & their images folder
app.get('/deleteAll', (req, res) => {
    require('./models/User').find({}, (err, users) => {
        if (err) return console.log(err);
        users.forEach(user => {
            fs.unlink(`public/images/profile pictures/${user.Image}`, () => {
                require('./models/User').findByIdAndRemove(user._id, err => {
                    if (err) return console.log(err);
                });
            });
        });
    });
    res.redirect('/');
});

// routes middlewares
app.use('/user', require('./routes/user'));
app.use('/profile', require('./routes/profile'));
app.use('/course', require('./routes/course'));

// Listening to requests
app.listen(port, (err) => {
    if (err) return console.log(err);
    console.log(`Server started listening at ${port}`);
})

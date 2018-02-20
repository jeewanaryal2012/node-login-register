var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var path = require("path");
var User = require('./models/user');

// invoke an instance of express application.
var app = express();

// set our application port
app.set('port', 9000);


app.set('view engine', 'ejs');
app.set('views', [
    path.join(__dirname, 'views'), path.join(__dirname, 'views/common')
]);

// set morgan to log info about our requests for development use.
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'dist')));

// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({ extended: true }));

// initialize cookie-parser to allow us access the cookies stored in the browser. 
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));


// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});


// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }    
};


// route for Home-Page
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});


// route for user signup
app.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.render(__dirname + '/views/signup', {
            member: false
        });
    })
    .post((req, res) => {
        User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
        .then(user => {
            req.session.user = user.dataValues;
            res.redirect('/dashboard');
        })
        .catch(error => {
            res.redirect('/signup');
        });
    });


// route for user Login
app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.render(__dirname + '/views/login', {
            member: false
        });
    })
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;

        User.findOne({ where: { username: username } }).then(function (user) {
            if (!user) {
                res.redirect('/login');
            } else if (!user.validPassword(password)) {
                res.redirect('/login');
            } else {
                req.session.user = user.dataValues;
                res.redirect('/dashboard');
            }
        });
    });


// route for user's dashboard
app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        User.findAll().then(user => {
            console.log(req.session.user.username);
            //console.log(user);
            res.render(__dirname + '/views/dashboard', {
                member: true,
                firstName: req.session.user.username
            });
        })
    } else {
        res.redirect('/login');
    }
});

// route for user's dashboard
app.get('/contact', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        User.findAll().then(user => {
            res.render(__dirname + '/views/contact', {
                member: true,
                firstName: req.session.user.username
            });
        })
    } else {
        res.redirect('/login');
    }
});

app.post('/contact', (req, res) => {
    res.render('contact', {
        data: req.body, // { message, email }
        errors: {
        message: {
            msg: 'A message is required'
        },
        email: {
            msg: 'That email doesn‘t look right'
        }
        }
    })
});


// route for user logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});


// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
});


// start the express server
app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));
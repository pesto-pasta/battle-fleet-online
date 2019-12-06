const express = require('express');
const session = require('express-session');
const handleBars = require('express-handlebars');

//const area
const users = [
    { username: "Tyler", password: "Sayvetz" },
    { username: "Jordan", password: "Soltman Pizza" },
    { username: "asdf", password: "asdf" }
];
const app = express();
const customHandlebars = handleBars.create({
    helpers: {
        "switch": function (value, options) {
            this.switch_value = value;
            return options.fn(this);
        },
        "case": function (value, options) {
            if (value == this.switch_value) {
                return options.fn(this);
            }
        },
        "exists": function(variable, options) {
            if (typeof variable !== 'undefined') {
                return options.fn(this);
            }
        }
    }

})

app.use(express.static("static"));

//configure express
app.engine('handlebars', customHandlebars.engine);
app.set('view engine', 'handlebars');
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "87654dddkl", resave: true, saveUninitialized: true }));

app.listen(3000, () => {
    console.log("The server is now running");
})

function authorize(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login?login=required');
        return;
    }
    next();
}



app.get('/', (req, res) => {
    console.log("welcome home");

})

app.get('/login', (req, res) => {
    res.render("login", { failureReason: req.query.login });
})

app.post('/login', (req, res) => {
    console.log(req.body);
    const user = users.find((user) => req.body.username === user.username && req.body.password === user.password);
    if (user) {
        req.session.user = user;
        res.redirect('/account');
    } else {
        res.redirect('/login?login=failed');
    }
})

app.get('/account', authorize, (req, res) => {
    res.render('account', { user: req.session.user });
})

app.get('/logout', (req, res) => {
    delete req.session.user;
    res.redirect('/login');
})

app.get('/signup', (req, res) => {
    res.render('login', { signup: true });
})

app.post('/signup', (req, res) => {
    const conflict = users.find((user) => user.username === req.body.username);
    let error;
    if (conflict) {
        error = "That username already exists";
    } else if (req.body.username.length === 0 || req.body.password.length === 0) {
        error = "Username and password are required.";
    }
    // more error conditions would go here..
    
    if (error) {
        res.render('login', { error });
    } else {
        const newUser = { username: req.body.username, password: req.body.password };
        users.push(newUser);
        req.session.user = newUser;
        res.redirect('/account');
    }
})

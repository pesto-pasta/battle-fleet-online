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
        res.render('login', { errors: ["Username or password is not valid!"] })
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

    let errors = [];

    const conflict = users.find((user) => user.username === req.body.username);
    if (conflict) { errors.push("That username already exists") }
    if (req.body.username.length === 0 || req.body.password.length === 0) { errors.push("Username and password are required."); }
    
    if (errors.length > 0) {
        res.render('login', { errors, signup: true });
    } else {
        const newUser = { username: req.body.username, password: req.body.password };
        users.push(newUser);
        req.session.user = newUser;
        res.redirect('/account');
    }
})

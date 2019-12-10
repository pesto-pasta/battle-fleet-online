const express = require('express');
const session = require('express-session');
const handleBars = require('express-handlebars');
const { flipCoin } = require('./lib/random');

//battleship game area
let gameCounter = 9951;
const games = {
    9950: {
        inviter: null,
        invitee: null,
        status: "active", //is the game pending, active, or complete? It is pending when created.
        winner: null,
        turnIndex: flipCoin() ? null : null,
        players: {
            bob: {
                ships: null,
                attacks: (new Array(100)).fill(null),
                lastAttack: null,
            },
            josie: {
                ships: null,
                attacks: (new Array(100)).fill(null),
                lastAttack: null,
            }
        }
    }
};

function makeGame(gameId, inviter, invitee) {
    return {
        id: gameId,
        inviter: inviter,
        invitee: invitee,
        status: "pending", //is the game pending, active, or complete? It is pending when created.
        winner: null,
        turnIndex: flipCoin() ? inviter : invitee,
        players: {
            [inviter]: {
                ships: null,
                attacks: (new Array(100)).fill(null),
                lastAttack: null,
            },
            [invitee]: {
                ships: null,
                attacks: (new Array(100)).fill(null),
                lastAttack: null,
            }
        }
    }

}

function getGameSubset(gamesObj, status) {
    const keysArray = Object.keys(gamesObj);
    const pendingArray = keysArray.filter((key) => gamesObj[key].status === status);
    const pendingGames = {};
    for (const key of pendingArray) {
        Object.assign(pendingGames, {[key]: gamesObj[key]} )
    }
    
    return pendingGames;
}


//const area
const users = [
    { username: "Tyler", password: "Sayvetz" },
    { username: "Jordan", password: "Soltman Pizza" },
    { username: "asdf", password: "asdf" },
    { username: "a", password: "a" },
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
        "exists": function (variable, options) {
            if (typeof variable !== 'undefined') {
                return options.fn(this);
            }
        }
    }

})

(function() {
    function checkCondition(v1, operator, v2) {
        switch(operator) {
            case '==':
                return (v1 == v2);
            case '===':
                return (v1 === v2);
            case '!==':
                return (v1 !== v2);
            case '<':
                return (v1 < v2);
            case '<=':
                return (v1 <= v2);
            case '>':
                return (v1 > v2);
            case '>=':
                return (v1 >= v2);
            case '&&':
                return (v1 && v2);
            case '||':
                return (v1 || v2);
            default:
                return false;
        }
    }

    handleBars.registerHelper('ifCond', function (v1, operator, v2, options) {
        return checkCondition(v1, operator, v2)
                    ? options.fn(this)
                    : options.inverse(this);
    });
}());



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
    res.redirect('/login')
});

app.get('/login', (req, res) => {
    res.render("login", { failureReason: req.query.login });
});

app.post('/login', (req, res) => {
    console.log(req.body);
    const user = users.find((user) => req.body.username.toLowerCase() === user.username.toLowerCase() && req.body.password === user.password);
    if (user) {
        req.session.user = user;
        res.redirect('/account');
    } else {
        res.render('login', { errors: ["Username or password is not valid!"] })
    }
});

app.get('/account', authorize, (req, res) => {

    const pendingGames = getGameSubset(games, "pending");
    const activeGames = getGameSubset(games, "active");
    const completedGames = getGameSubset(games, "complete");


    res.render('account', {

        user: req.session.user,
        users: users.map((user) => user.username).filter((username) => username !== req.session.user.username), //this variable, being sent to the client, makes a list of users that excludes the active user.
        pendingGames: pendingGames,
        activeGames: activeGames,
        completedGames: completedGames,
        
    })

});

app.get('/logout', (req, res) => {
    delete req.session.user;
    res.redirect('/login');
});

app.get('/signup', (req, res) => {
    res.render('login', { signup: true });
});

app.get('/game', (req, res) => {
    const gameId = req.query.id;
    res.render('game', { gameId });
});

app.post('/create_game', authorize, (req, res) => {

    const opponent = users.find((user) => req.body.opponent === user.username);
    if (!opponent) {
        res.redirect('/account');
        return;
    }
    const gameId = gameCounter++;

    //create the game object
    games[gameId] = makeGame(gameId, req.session.user.username, req.body.opponent);  //as far as server is concerned, the game is made here.

    //notify the opponent player that they are in a game


    //render the game page
    res.render('game', { gameId })

});

app.post('/signup', (req, res) => {

    let errors = [];

    const conflict = users.find((user) => user.username.toLowerCase() === req.body.username.toLowerCase());
    if (conflict) { errors.push("That username already exists") }
    if (req.body.username.length === 0 || req.body.password.length === 0) { errors.push("Username and password are required."); }
    if (!/^[a-zA-Z0-9]*$/.test(req.body.username)) { errors.push("Username can only contain numbers and letters."); }

    if (errors.length > 0) {
        res.render('login', { errors, signup: true });
    } else {
        const newUser = { username: req.body.username, password: req.body.password };
        users.push(newUser);
        req.session.user = newUser;
        res.redirect('/account');
    }
});

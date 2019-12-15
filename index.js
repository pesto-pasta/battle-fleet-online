const express = require('express');
const session = require('express-session');
const handleBars = require('express-handlebars');
const { flipCoin } = require('./lib/random');
const { GameStatus } = require('./const');

//battleship game area
let gameCounter = 9954;
const games = {};
    

function makeGame(gameId, inviter, invitee) {
    return {
        id: gameId,
        inviter: inviter,
        invitee: invitee,
        status: GameStatus.PENDING, //is the game pending, active, or complete? It is pending when created.
        winner: null,
        turnIndex: flipCoin() ? inviter : invitee,
        shipConfig: [2, 3, 3, 4, 5],
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

function getGameSubset(gamesObj, status, user) {
    const keysArray = Object.keys(gamesObj);
    const pendingArray = keysArray.filter((key) => gamesObj[key].status === status && (user.username === gamesObj[key].invitee || user.username === gamesObj[key].inviter));
    const gameSubset = pendingArray.map(key => gamesObj[key]);
    if (status === GameStatus.PENDING) {
        for (const game of gameSubset) {
            game.inviter === user.username ? 
                game.challengeText = "You declared war on " + game.invitee : 
                game.challengeText = "You were challenged by " + game.inviter;
        }
    }
    return gameSubset;
}


//const area
const users = [
    { username: "Tyler", password: "S", wins: 0, losses: 0 },
    { username: "Jordan", password: "S", wins: 0, losses: 0 },
    { username: "asdf", password: "a", wins: 0, losses: 0 },
    { username: "a", password: "a", wins: 0, losses: 0 },
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
        },
    }

})

app.use(express.static("static"));

//configure express
app.engine('handlebars', customHandlebars.engine);
app.set('view engine', 'handlebars');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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

    const pendingGamesArrayIncludingCurrentUser = getGameSubset(games, GameStatus.PENDING, req.session.user);
    const activeGamesArrayIncludingCurrentUser = getGameSubset(games, GameStatus.ACTIVE, req.session.user);
    const completedGamesArrayIncludingCurrentUser = getGameSubset(games, GameStatus.COMPLETE, req.session.user);

    res.render('account', {
        user: req.session.user,
        users: users.map((user) => user.username).filter((username) => username !== req.session.user.username), //this variable, being sent to the client, makes a list of users that excludes the active user.
        pendingGames: pendingGamesArrayIncludingCurrentUser,
        activeGames: activeGamesArrayIncludingCurrentUser,
        completedGames: completedGamesArrayIncludingCurrentUser,
    })

});

app.get('/logout', (req, res) => {
    delete req.session.user;
    res.redirect('/login');
});

app.get('/signup', (req, res) => {
    res.render('login', { signup: true });
});

app.get('/setup/:game_id', (req, res) => {
    // FIXME: check if game is valid for setup
    const gameId = req.params.game_id;
    res.render('setup', { gameID: gameId });
});

app.get('/game/:game_id', (req, res) => {
    const gameId = req.params.game_id;
    res.render('game', { gameID: gameId });
})


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
    //This will happen after placements of ships by the agressor are confirmed

    //render the game page
    res.redirect('/setup/'+gameId);

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

//game API section
app.post('/confirm_placements/:game_id', authorize, (req, res) => {
    
    console.dir(req.body);

    const currentGame = games[req.params.game_id];
    const userGame = currentGame.players[req.session.user.username];
    const opponent = (req.session.user.username === currentGame.inviter) ? currentGame.invitee : currentGame.inviter;
    const opponentGame = currentGame.players[opponent];
    

    //validate the number and configuration of placed ships to make sure they match the ShipConfig set in game.
    const shipConfigInput = req.body.map((ship) => {return ship.size}).sort();
    let valid = true;
    if (shipConfigInput.length === currentGame.shipConfig.length) {
        for (let i = 0; i < shipConfigInput.length; i++) {
            if (shipConfigInput[i] !== currentGame.shipConfig[i]) {
                valid = false;
                break;
            }
        }
    
    } else {
        valid = false;   
    }

    if (!valid) {
        res.json({error: "ship configuration not legal"})
        return;
    }

    //check for ship placement already. Cant reset your ships... 
    if (!userGame.ships) {
        userGame.ships = req.body;
    }
    
    // if both users have ship placement, this game is active.
    if (opponentGame.ships) {
        currentGame.status = GameStatus.ACTIVE;
        res.json({status: "ready"});
    } else {
        res.json({status: "waiting"});
    }
})

app.get('/game_config/:game_id', authorize, (req, res) => {
    //TODO: send ship config to client
    res.json(games[req.params.game_id].shipConfig);
})

app.get('/game_status/:game_id', authorize, (req, res) => {

    const currentGame = games[req.params.game_id];
    const userGame = currentGame.players[req.session.user.username];
    const opponent = (req.session.user.username === currentGame.inviter) ? currentGame.invitee : currentGame.inviter;
    const opponentGame = currentGame.players[opponent];

    const returnObject = {
        ownShipLocations: userGame.ships,
        ownHitMap: userGame.attacks,
        opponentHitMap: opponentGame.attacks,
        gameStatus: currentGame.status,
        yourTurn: (currentGame.turnIndex === req.session.user.username),
    };

    res.json(returnObject);
})
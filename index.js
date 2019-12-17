const express = require('express');
const session = require('express-session');
const handleBars = require('express-handlebars');
const { flipCoin } = require('./lib/random');
const { GameStatus } = require('./const');
const { convertShipToOccupancyArray } = require('./lib/util.js');

const almostOver = JSON.parse(`{"id":9954,"size":10,"inviter":"Tyler","invitee":"Jordan","status":"ACTIVE","winner":null,"turnIndex":"Jordan","shipConfig":[2,3,3,4,5],"players":{"Tyler":{"ships":[{"coords":{"x":0,"y":0},"direction":"HORIZONTAL","size":2,"occupancyArray":[true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"hits":2},{"coords":{"x":0,"y":2},"direction":"HORIZONTAL","size":3,"occupancyArray":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"hits":3},{"coords":{"x":0,"y":1},"direction":"HORIZONTAL","size":3,"occupancyArray":[false,false,false,false,false,false,false,false,false,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"hits":3},{"coords":{"x":0,"y":4},"direction":"HORIZONTAL","size":4,"occupancyArray":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"hits":3},{"coords":{"x":0,"y":3},"direction":"HORIZONTAL","size":5,"occupancyArray":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"hits":5}],"attacks":[true,true,null,null,null,null,null,null,null,null,true,true,true,null,null,null,null,null,null,null,true,true,true,false,false,null,null,null,null,null,true,true,true,true,true,null,null,null,null,null,true,true,true,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"lastAttack":null},"Jordan":{"ships":[{"coords":{"x":0,"y":0},"direction":"HORIZONTAL","size":2,"occupancyArray":[true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"hits":2},{"coords":{"x":0,"y":1},"direction":"HORIZONTAL","size":3,"occupancyArray":[false,false,false,false,false,false,false,false,false,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"hits":3},{"coords":{"x":0,"y":2},"direction":"HORIZONTAL","size":3,"occupancyArray":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"hits":3},{"coords":{"x":0,"y":3},"direction":"HORIZONTAL","size":4,"occupancyArray":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"hits":4},{"coords":{"x":0,"y":4},"direction":"HORIZONTAL","size":5,"occupancyArray":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"hits":3}],"attacks":[true,true,null,null,null,null,null,null,null,null,true,true,true,null,null,null,null,null,null,null,true,true,true,null,null,null,null,null,null,null,true,true,true,true,false,null,null,null,null,null,true,true,true,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,false,null,null,null,false,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"lastAttack":null}},"challengeText":"You declared war on Jordan"}`);
console.log(almostOver);
//battleship game area
let gameCounter = 9954;
const games = {
    9954: almostOver,
    
};
    

function makeGame(gameId, inviter, invitee) {
    return {
        id: gameId,
        size: 10,
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
                //TODO: pass last attack in the game status to be used in banner
                lastAttack: null, //||"hit and sink" || "hit" || "miss"
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
    { username: "DJratpack", password: "indahouse", wins: 0, losses: 0 },
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
app.listen(4000, () => {
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

    const pendingGames = getGameSubset(games, GameStatus.PENDING, req.session.user);
    const activeGames = getGameSubset(games, GameStatus.ACTIVE, req.session.user);
    const completedGames = getGameSubset(games, GameStatus.COMPLETE, req.session.user);
    const deniedGames = getGameSubset(games, GameStatus.DENIED, req.session.user);
    const cancelledGames = getGameSubset(games, GameStatus.CANCELLED, req.session.user)


    //TODO: Solve scoreboard refresh bug. Symptom: Logout is required for new scores to populate. User: req.session.user (line 136) is used to pass user (and thus score) data.
    res.render('account', {
        user: req.session.user,
        users: users.map((user) => user.username).filter((username) => username !== req.session.user.username), //this variable, being sent to the client, makes a list of users that excludes the active user.
        pendingGames: pendingGames,
        activeGames: activeGames,
        completedGames: completedGames,
        cancelledGames: cancelledGames,
        deniedGames: deniedGames,
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

    const ships = req.body;
    const currentGame = games[req.params.game_id];
    const userGame = currentGame.players[req.session.user.username];
    const opponent = (req.session.user.username === currentGame.inviter) ? currentGame.invitee : currentGame.inviter;
    const opponentGame = currentGame.players[opponent];
    

    //validate the number and configuration of placed ships to make sure they match the ShipConfig set in game.
    const shipConfigInput = ships.map((ship) => {return ship.size}).sort();
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


        for (ship of ships) {
            ship.occupancyArray = convertShipToOccupancyArray(ship.coords, ship.size, ship.direction, currentGame.size);
            ship.hits = 0;
        }
        userGame.ships = ships;
        
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
    const oppShips = currentGame.status === GameStatus.COMPLETE ? opponentGame.ships : undefined;  // send oppships only if game status is complete
    const yourTurn = (currentGame.turnIndex === req.session.user.username);

    let gameMessage = "";
    yourTurn ? gameMessage = "Your turn." : gameMessage = "Waiting on enemy...";
    if (currentGame.status === GameStatus.COMPLETE) {
        gameMessage = "Game over! Yay " + currentGame.winner + "!";
    }
    

    const returnObject = {
        opponentShipLocations: oppShips,
        ownShipLocations: userGame.ships,
        ownHitMap: userGame.attacks,
        opponentHitMap: opponentGame.attacks,
        gameStatus: currentGame.status,
        yourTurn: yourTurn,
        inGameMessage: gameMessage,
    };

    res.json(returnObject);
})

app.post('/game_attack/:game_id', authorize, (req, res) => {


    let refresh = true;
    const currentGame = games[req.params.game_id];
    const userGame = currentGame.players[req.session.user.username];
    const opponent = (req.session.user.username === currentGame.inviter) ? currentGame.invitee : currentGame.inviter;
    const opponentGame = currentGame.players[opponent];

    const attackLocation = (req.body.y * currentGame.size) + req.body.x;

    //prerequisites for a turn to occur
    //TODO: make these errors visible in the view. 
    if (opponentGame.attacks[attackLocation] !== null) {
        res.json({error: "You already attacked here!"});
        return;
    }
    if (req.session.user.username !== currentGame.turnIndex) {
        res.json({error: "Its not your turn BUD"});
        return;
    }
    if (currentGame.status !== GameStatus.ACTIVE) {
        res.json({error: "This game is over BUD"});
        return;
    }


    let hit = false;
    let sink = false;
    for (ship of opponentGame.ships) {
        if (ship.occupancyArray[attackLocation]) {
            hit = true;
            ship.hits++;
            if (ship.hits === ship.size) {
                sink = true;
            } 
            break;
        }
    }


    //cleanup work
    opponentGame.attacks[attackLocation] = hit;
    currentGame.turnIndex = opponent;
    

    //check for win condition and update the necessary items.
    //TODO: handle what happens to the turnIndex. Can moves still be made on a complete game? 
    let gameOver = false;
    if (!opponentGame.ships.find((ship) => ship.hits !== ship.size)) {
       gameOver = true;
       currentGame.status = GameStatus.COMPLETE;
       currentGame.winner = req.session.user.username;
       users.find(user => user.username === req.session.user.username ).wins++;
       users.find(user => user.username === opponent ).losses++;
       refresh = false;
    }
    //TODO: handle what happens with these three arguments on the client.
    res.json({hit, sink, gameOver, refresh})
    
})

app.get('/game_deny/:game_id', authorize, (req, res) => {
    const currentGame = games[req.params.game_id];
    (currentGame.inviter === req.session.user.username) ? currentGame.status = GameStatus.CANCELLED : currentGame.status = GameStatus.DENIED;

    res.redirect('/account')

    console.log();
})  
const express = require('express');
const app = express();

app.listen(3000, () => {
    console.log("The server is now running");
})

app.get('/', (req, res) => {
    res.send("Root folder");
})

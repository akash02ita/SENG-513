const gameRouter = require('./routes/game.js');

const express = require('express');
const app = express();
const port = 4000;

const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.json());

// use static public folder: client -> npm run build
// app.use(express.static('public'))

app.use("/", gameRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


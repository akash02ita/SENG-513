const gameRouter = require('./routes/game.js');

const express = require('express');
const app = express();
const port =  process.env.port || 4000;

const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.json());

// use static public folder: client -> npm run build
// app.use(express.static('public'))

app.use("/", gameRouter);

app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening on port ${port}`)
})


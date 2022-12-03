const gameRouter = require('./routes/game.js');

const express = require('express');
const app = express();
const port = process.env.port || 4000;

// fix CORS issue
const cors = require('cors');
// using cors with also these parameters to allow usage of cookies
app.use(cors({
    origin: true,
    credentials: true,
    preflightContinue: true
}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.json());

// use static public folder: client -> npm run build
// app.use(express.static('public'))

app.use("/", gameRouter);

app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening on port ${port}`)
})


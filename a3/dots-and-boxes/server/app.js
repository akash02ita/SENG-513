const gameRouter = require('./routes/game.js');

const express = require('express');
const app = express();
const port =  process.env.port || 4000;

const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.json());

// use static public folder: client -> npm run build
const path = require('path');
app.use(express.static(path.join(__dirname, "../client", "build")));

app.use("/", gameRouter);

// allow routes of react
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "../client", "build", "index.html"));
});

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})




exports.generateToken = () => {
    // token should be guranteed to be unique. Date.now guarantees that.
    // Whereas Math.random() helps somewhat simulate a bit of security, but obviously not cryptographically secure.
    return Math.ceil(Math.random() * 100000) + "-" + Date.now();
}

exports.generatePlayersZeroScore = (playerCount) => {
    let playersZeroScore = {};
    for (let i = 0; i < playerCount; i++) {
        playersZeroScore['player' + i] = 0;
    }
    return playersZeroScore;
}

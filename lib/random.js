function flipCoin() {
    return Math.floor(Math.random() * 2) === 0;
}

module.exports = { flipCoin }
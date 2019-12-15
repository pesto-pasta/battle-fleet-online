

function convertShipToOccupancyArray(coords, size, direction, gameSize) {
    const array = new Array(gameSize * gameSize).fill(false);
    const startIndex = (gameSize * coords.y) + coords.x;
    const offset = direction === "HORIZONTAL" ? 1 : gameSize;
    for (let i = 0; i < size; i++) {
        array[startIndex + i * offset] = true;
    }
    return array;
}

module.exports = {convertShipToOccupancyArray};
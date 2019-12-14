(function (target) {

    // Configures a ship by setting it's x/y coords and classes
    function configureShipImg(img, imgSrc, coords, direction, options = {}) {
        // Clear the initial classes
        img.className = '';
        img.src = imgSrc;
        img.classList.add('vessel');
        if (direction === GameBoard.Direction.VERTICAL) {
            img.classList.add('vertical');
        }
        if (options.placing) {
            img.classList.add('placing');
        }
        if (options.invalid) {
            img.classList.add('invalid');
        }
        img.style.left = (coords.x + 1) * 50 + 'px';
        img.style.top = (coords.y + 1) * 50 + 'px';  
    }

    class GameBoard {

        constructor(targetElement, size = 10) {
            if (!targetElement) {
                throw new Error("Cannot draw board without a target element!");
            }
            this._targetElement = targetElement;
            this._size = size;
            this._eventListeners = {
                'mouseOverCell': [],
                'mouseOutCell': [],
                'clickCell': [],
                'mouseOutBoard': [],
                'shipPlaced': [],
                'shipClicked': [],
            };
            this._ships = {};
            this._makeBoard();
            this._shipPlacementEventHandlers();
        }

        startPlaceShip(size, imgSrc) {
            this.placingShip = { size, imgSrc, direction: GameBoard.Direction.HORIZONTAL, coords: null };
        }

        stopPlaceShip() {
            this.placingShip = null;
        }

        setShips(ships) {
            this.clearShips();
            this.addShips(ships);
        }

        getShips() {
            // Make a copy of ships and return it
            return [...this._ships];
        }

        // Should a be a ship (or array of ships),
        // ship := {
        //      coords: { x: number, y: number },
        //      direction: "VERTICAL" | "HORIZONTAL",
        //      size: number,
        //      imgSrc: string
        // }
        addShips(ships) {
            const shipsToAdd = Array.isArray(ships) ? ships : [ships];
            
            for (const ship of shipsToAdd) {

                // Remove the existing ship if there is already one here
                if (this._ships[this._coordinateToKey(ship.coords)]) {
                    this.removeShip(ship.coords);
                }

                this._ships[this._coordinateToKey(ship.coords)] = { ship, occupancy: this._mapToOccupancyArray(ship.coords, ship.size, ship.direction) };
            }
            
            this._drawShips();
        }

        removeShip(coords) {
            const key = this._coordinateToKey(coords);
            const element = this._ships[key].element;
            this.shipContainer.removeChild(element);
            delete this.shipContainer[key];
        }

        clearShips() {
            for (const ship of Object.values(this._ships)) {
                this.removeShip(ship.coords);
            }
        }

        addEventListener(event, callback) {
            if (this._eventListeners[event]) {
                this._eventListeners[event].push(callback);
            }
        }

        /** "PRIVATE" METHODS */

        //TYLER -- create [10*10] and fill it with Trues where ship occupies cells?
        _checkOccupancyArrayCollisions(arrays) {
            const tally = new Array(this._size * this._size).fill(false);
            for (const array of arrays) {
                for (let i = 0; i < tally.length; i++) {
                    if (array[i]) {
                        if (tally[i]) { return false; }
                        tally[i] = true;
                    }
                }
            }
            return true;
        }

        //TYLER -- convert polar coordinate ship to true/false array called OccupancyArray
        _mapToOccupancyArray(coords, size, direction) {
            const array = new Array(this._size * this._size).fill(false);
            const startIndex = this._coordinateToIndex(coords);
            const offset = direction === GameBoard.Direction.HORIZONTAL ? 1 : this._size;
            for (let i = 0; i < size; i++) {
                array[startIndex + i * offset] = true;
            }
            return array;
        }

        _coordinateToKey(coords) {
            return coords.x + '-' + coords.y;
        }
        
        // Calls all of the envet listener with all of the arguments (which should be an array)
        _callEventListeners(event, args = []) {
            // Make args an array if it's not
            const arrayArgs = Array.isArray(args) ? args : [args];
            if (this._eventListeners[event]) {
                for (const handler of this._eventListeners[event]) {
                    handler.apply(null, arrayArgs);
                }
            }
        }

        _checkIfShipIsValid(coords, size, direction) {

            // First cehck if it's even on the board
            if ((
                direction === GameBoard.Direction.HORIZONTAL && 
                (coords.x > this._size - size || coords.x < 0 ||
                coords.y > 0 && coords.y > this._size)
            ) || (direction === GameBoard.Direction.VERTICAL &&
                (coords.x < 0 || coords.x > this._size ||
                coords.y < 0 || coords.y > this._size - size)))
            { return false }

            const occupancyMaps = Object.values(this._ships).map((ship) => ship.occupancy)
            const newOccupancy = this._mapToOccupancyArray(coords, size, direction)
            return this._checkOccupancyArrayCollisions([...occupancyMaps, newOccupancy])
        }

        _shipPlacementEventHandlers() {
            this.addEventListener('mouseOverCell', (coords) => {
                if (this.placingShip) {
                    this.placingShip.coords = coords;
                }
                this._drawPlacingShip();
            });
            this.addEventListener('mouseOutBoard', () => {
                if (this.placingShip) {
                    this.placingShip.coords = null;
                }
                this._drawPlacingShip();
            })
            this.addEventListener('clickCell', (coords) => {
                if (this.placingShip && this._checkIfShipIsValid(coords, this.placingShip.size, this.placingShip.direction)) {
                    // If we are placing a ship and it's a valid placement, we'll call our event listener
                    const ship = {
                        coords,
                        direction: this.placingShip.direction,
                        size: this.placingShip.size,
                        imgSrc: this.placingShip.imgSrc
                    }
                    this._callEventListeners('shipPlaced', ship);
                    
                } else { // See if a ship was clicked
                    const index = this._coordinateToIndex(coords);
                    // check if an existing ship is clicked
                    const ship = Object.values(this._ships).find((ship) => ship.occupancy[index])
                    if (ship) {
                        this._callEventListeners('shipClicked', ship.ship);
                    }
                }
                this._drawPlacingShip();
            });
            
        }

        _coordinateToIndex(coord) {
            return this._size * coord.y + coord.x;
        }

        _drawPlacingShip() {

            // IF there is no more placing ship, we remove the element.
            if (!this.placingShip || !this.placingShip.coords) {
                if (this.placingShipElement) { 
                    this.shipContainer.removeChild(this.placingShipElement) 
                    this.placingShipElement = null;
                }
                return;
            }

            if (!this.placingShipElement) {
                this.placingShipElement = new Image();
                this.shipContainer.appendChild(this.placingShipElement);
            }

            const valid = this._checkIfShipIsValid(this.placingShip.coords, this.placingShip.size, this.placingShip.direction);
            configureShipImg(this.placingShipElement, this.placingShip.imgSrc, this.placingShip.coords, this.placingShip.direction, { placing: true, invalid: !valid })

        }

        _drawShips(ships) {
            // Clear out the existing ships
            for (const ship of Object.values(this._ships)) {
                if (!ship.element) {
                    ship.element = new Image();
                    configureShipImg(ship.element, ship.ship.imgSrc, ship.ship.coords, ship.ship.direction);
                    this.shipContainer.appendChild(ship.element);
                }
            }
        }

        _handleCellEvent(type, event) {
            if (event.target.dataset.index) {
                const y = Math.floor(event.target.dataset.index / this._size);
                const x = event.target.dataset.index % this._size;
                const coords = { x, y };
                // Fire off any event listeners
                this._callEventListeners(type, coords);
            }
        }

        _makeBoard() {

            const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

            const gridContainer = document.createElement('div');
            this._targetElement.appendChild(gridContainer);

            this.shipContainer = document.createElement('div');
            this.shipContainer.classList.add('ship-container');
            this._targetElement.appendChild(this.shipContainer);

            const topRow = document.createElement("div");
            topRow.classList.add('row');
            gridContainer.appendChild(topRow);

            const cells = [];

            for (let i = 0; i < this._size + 1; i++) {
                const numberCell = document.createElement("div");
                numberCell.classList.add('cell', 'header');
                topRow.appendChild(numberCell);
                if (i > 0) {
                    numberCell.innerText = i;
                }
            }

            for (let i = 0; i < this._size; i++) {
                const row = document.createElement("div");
                row.classList.add('row');
                gridContainer.appendChild(row);

                // First add my letter cell
                const letterCell = document.createElement("div");
                letterCell.classList.add('cell', 'header');
                row.appendChild(letterCell);
                letterCell.innerText = LETTERS.charAt(i);

                // Now add my remaining cells
                for (let j = 0; j < this._size; j++) {
                    const cell = document.createElement("div");
                    cell.dataset.index = i * this._size + j;
                    cell.classList.add('cell');
                    row.appendChild(cell);
                    cells.push(cell);
                }
            }


            this._targetElement.addEventListener('mouseover', (ev) => this._handleCellEvent('mouseOverCell', ev));
            this._targetElement.addEventListener('mouseout', (ev) => { 
                this._handleCellEvent('mouseOutCell', ev); 
                this._callEventListeners('mouseOutBoard');
            });
            this._targetElement.addEventListener('click', (ev) => this._handleCellEvent('clickCell', ev));

            window.addEventListener('keydown', (ev) => {
                if (ev.key === 'r' && this.placingShip) {
                    this.placingShip.direction = this.placingShip.direction === GameBoard.Direction.HORIZONTAL ?
                        GameBoard.Direction.VERTICAL :
                        GameBoard.Direction.HORIZONTAL;
                    this._drawPlacingShip();
                }
            })
        }
    }

    GameBoard.Direction = {
        VERTICAL: 'VERTICAL',
        HORIZONTAL: 'HORIZONTAL'
    }

    // Attach the gameboard to the window
    target.GameBoard = GameBoard;

})(window);
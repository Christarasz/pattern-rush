// Tile generator

const TileGenerator = {
    // Generate tiles for level
    generateTiles: function(level) {
        const config = this.getLevelConfig(level);
        const allContainers = [];
        
        // Track used match IDs to ensure unique pairs
        const usedMatchIds = new Set();

        // Generate pairs
        for (let i = 0; i < config.totalPairs; i++) {
            const matchId = this.generateUniqueId(usedMatchIds);
            usedMatchIds.add(matchId);
            
            const pair = this.generatePair(config.patternRows, config.patternCols, matchId);
            allContainers.push(pair[0]);
            allContainers.push(pair[1]);
        }

        // Shuffle all containers
        return utils.shuffle(allContainers);
    },

    // Get level configuration
    getLevelConfig: function(level) {
        const configs = {
            easy: {
                totalPairs: 6,      // 8 containers total
                patternRows: 4,     // ALL levels use 4x4 pattern
                patternCols: 4,
                timeLimit: 100     // 2 minutes
            },
            medium: {
                totalPairs: 6,      // 12 containers total
                patternRows: 4,     // ALL levels use 4x4 pattern
                patternCols: 4,
                timeLimit: 75       // 1.5 minutes
            },
            hard: {
                totalPairs: 7,      // 14 containers total
                patternRows: 4,     // ALL levels use 4x4 pattern
                patternCols: 4,
                timeLimit: 60       // 1 minute
            }
        };
        return configs[level];
    },

    // Generate unique ID
    generateUniqueId: function(usedIds) {
        let id;
        do {
            id = 'match-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        } while (usedIds.has(id));
        return id;
    },

    // Generate a matching pair with unique match ID
    generatePair: function(rows, cols, matchId) {
        const totalCells = rows * cols;
        
        // 30-60% grey cells
        const minGrey = Math.ceil(totalCells * 0.3);
        const maxGrey = Math.ceil(totalCells * 0.6);
        const greyCount = Math.floor(Math.random() * (maxGrey - minGrey + 1)) + minGrey;

        // Pick grey positions
        const positions = [];
        for (let i = 0; i < totalCells; i++) {
            positions.push(i);
        }
        const shuffled = utils.shuffle(positions);
        const greyPositions = new Set(shuffled.slice(0, greyCount));

        // Generate tile 1
        const tile1Grid = [];
        for (let row = 0; row < rows; row++) {
            tile1Grid[row] = [];
            for (let col = 0; col < cols; col++) {
                const pos = row * cols + col;
                if (greyPositions.has(pos)) {
                    tile1Grid[row][col] = 'grey';
                } else {
                    tile1Grid[row][col] = utils.getRandomColor();
                }
            }
        }

        // Generate tile 2 (complementary)
        const tile2Grid = [];
        for (let row = 0; row < rows; row++) {
            tile2Grid[row] = [];
            for (let col = 0; col < cols; col++) {
                const pos = row * cols + col;
                if (greyPositions.has(pos)) {
                    tile2Grid[row][col] = utils.getRandomColor();
                } else {
                    tile2Grid[row][col] = 'grey';
                }
            }
        }

        return [
            { 
                id: 'tile-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                grid: tile1Grid, 
                matchId: matchId,
                matched: false
            },
            { 
                id: 'tile-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9) + '-b',
                grid: tile2Grid, 
                matchId: matchId,
                matched: false
            }
        ];
    },

    // Render tile to DOM
    renderTile: function(tile, container, level) {
        const tileEl = document.createElement('div');
        tileEl.className = 'tile-container ' + level;
        tileEl.id = tile.id;
        tileEl.draggable = true;

        const gridEl = document.createElement('div');
        gridEl.className = 'tile-grid';
        gridEl.style.gridTemplateColumns = 'repeat(' + tile.grid[0].length + ', 1fr)';
        gridEl.style.gridTemplateRows = 'repeat(' + tile.grid.length + ', 1fr)';

        // Add dots
        for (let row = 0; row < tile.grid.length; row++) {
            for (let col = 0; col < tile.grid[row].length; col++) {
                const dotEl = document.createElement('div');
                dotEl.className = 'tile-dot ' + tile.grid[row][col];
                gridEl.appendChild(dotEl);
            }
        }

        tileEl.appendChild(gridEl);
        container.appendChild(tileEl);

        return tileEl;
    },

    // Update tile display
    updateTile: function(tileEl, newGrid) {
        const gridEl = tileEl.querySelector('.tile-grid');
        const dots = gridEl.querySelectorAll('.tile-dot');
        
        let index = 0;
        for (let row = 0; row < newGrid.length; row++) {
            for (let col = 0; col < newGrid[row].length; col++) {
                const dot = dots[index];
                dot.className = 'tile-dot ' + newGrid[row][col];
                index++;
            }
        }
    }
};

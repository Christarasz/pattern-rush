// Main game controller

const game = {
    currentLevel: null,
    tiles: [],
    draggedTile: null,
    matchedPairs: 0,
    totalPairs: 0,
    timeLimit: 0,
    timeRemaining: 0,
    timerInterval: null,
    startTime: 0,

    // Initialize game
    init: function() {
        this.showWelcome();
    },

    // Show welcome screen
    showWelcome: function() {
        this.hideAllScreens();
        document.getElementById('welcome-screen').classList.add('active');
        utils.hideAllModals();
        this.stopTimer();
    },

    // Show level selection
    showLevelSelect: function() {
        this.stopTimer();
        this.hideAllScreens();
        document.getElementById('level-screen').classList.add('active');
        utils.hideAllModals();
    },

    // Start game
    startGame: function(level) {
        this.currentLevel = level;
        this.matchedPairs = 0;
        
        // Generate tiles
        this.tiles = TileGenerator.generateTiles(level);
        
        // Get config
        const config = TileGenerator.getLevelConfig(level);
        this.totalPairs = config.totalPairs;
        this.timeLimit = config.timeLimit;
        this.timeRemaining = config.timeLimit;

        // Setup UI
        this.hideAllScreens();
        document.getElementById('game-screen').classList.add('active');
        document.getElementById('current-level').textContent = 
            level.charAt(0).toUpperCase() + level.slice(1);
        document.getElementById('pairs-count').textContent = this.totalPairs;
        document.getElementById('timer-value').textContent = utils.formatTime(this.timeRemaining);

        // Render tiles
        this.renderTiles();
        
        utils.hideAllModals();
        
        // Start timer
        this.startTimer();
    },

    // Restart level
    restartLevel: function() {
        if (this.currentLevel) {
            this.startGame(this.currentLevel);
        }
    },

    // Hide all screens
    hideAllScreens: function() {
        document.querySelectorAll('.screen').forEach(function(screen) {
            screen.classList.remove('active');
        });
    },

    // Render tiles
    renderTiles: function() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';

        const self = this;
        this.tiles.forEach(function(tile) {
            const tileEl = TileGenerator.renderTile(tile, board, self.currentLevel);
            self.addDragListeners(tileEl, tile);
        });
    },

    // Start timer
    startTimer: function() {
        const self = this;
        this.startTime = Date.now();
        
        this.timerInterval = setInterval(function() {
            self.timeRemaining--;
            document.getElementById('timer-value').textContent = utils.formatTime(self.timeRemaining);
            
            // Warning when time is low
            const timerEl = document.getElementById('timer');
            if (self.timeRemaining <= 10) {
                timerEl.classList.add('warning');
            } else {
                timerEl.classList.remove('warning');
            }
            
            // Time's up
            if (self.timeRemaining <= 0) {
                self.handleTimeout();
            }
        }, 1000);
    },

    // Stop timer
    stopTimer: function() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    // Handle timeout
    handleTimeout: function() {
        this.stopTimer();
        utils.playErrorSound();
        utils.showModal('timeout-modal');
    },

    // Add drag listeners
    addDragListeners: function(element, tile) {
        const self = this;

        // Drag start
        element.addEventListener('dragstart', function(e) {
            if (tile.matched) {
                e.preventDefault();
                return;
            }
            self.draggedTile = tile;
            element.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        // Drag end
        element.addEventListener('dragend', function(e) {
            element.classList.remove('dragging');
        });

        // Drag over
        element.addEventListener('dragover', function(e) {
            e.preventDefault();
            if (self.draggedTile && self.draggedTile.id !== tile.id && !tile.matched) {
                e.dataTransfer.dropEffect = 'move';
                element.classList.add('drag-over');
            }
        });

        // Drag leave
        element.addEventListener('dragleave', function(e) {
            element.classList.remove('drag-over');
        });

        // Drop
        element.addEventListener('drop', function(e) {
            e.preventDefault();
            element.classList.remove('drag-over');

            if (self.draggedTile && self.draggedTile.id !== tile.id && !tile.matched && !self.draggedTile.matched) {
                self.handleDrop(self.draggedTile, tile);
            }
        });

        // Touch support
        this.addTouchListeners(element, tile);
    },

    // Add touch listeners
    addTouchListeners: function(element, tile) {
        const self = this;
        let clone = null;

        element.addEventListener('touchstart', function(e) {
            if (tile.matched) return;
            
            const touch = e.touches[0];
            
            self.draggedTile = tile;
            element.classList.add('dragging');

            // Create clone
            clone = element.cloneNode(true);
            clone.style.position = 'fixed';
            clone.style.pointerEvents = 'none';
            clone.style.opacity = '0.8';
            clone.style.zIndex = '1000';
            clone.style.width = element.offsetWidth + 'px';
            clone.style.left = (touch.clientX - element.offsetWidth / 2) + 'px';
            clone.style.top = (touch.clientY - element.offsetHeight / 2) + 'px';
            document.body.appendChild(clone);
        });

        element.addEventListener('touchmove', function(e) {
            if (!clone) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            clone.style.left = (touch.clientX - element.offsetWidth / 2) + 'px';
            clone.style.top = (touch.clientY - element.offsetHeight / 2) + 'px';

            // Find element under touch
            clone.style.display = 'none';
            const elBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            clone.style.display = 'block';

            // Clear drag-over
            document.querySelectorAll('.tile-container').forEach(function(el) {
                el.classList.remove('drag-over');
            });

            // Add drag-over
            if (elBelow && elBelow.classList.contains('tile-container')) {
                const belowTile = self.tiles.find(function(t) {
                    return t.id === elBelow.id;
                });
                if (belowTile && belowTile.id !== tile.id && !belowTile.matched) {
                    elBelow.classList.add('drag-over');
                }
            }
        });

        element.addEventListener('touchend', function(e) {
            element.classList.remove('dragging');
            
            if (clone) {
                const touch = e.changedTouches[0];
                
                // Find element
                clone.style.display = 'none';
                const elBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                clone.style.display = 'block';

                // Remove clone
                document.body.removeChild(clone);
                clone = null;

                // Handle drop
                if (elBelow && elBelow.classList.contains('tile-container')) {
                    const targetTile = self.tiles.find(function(t) {
                        return t.id === elBelow.id;
                    });
                    
                    if (targetTile && targetTile.id !== tile.id && !tile.matched && !targetTile.matched) {
                        elBelow.classList.remove('drag-over');
                        self.handleDrop(self.draggedTile, targetTile);
                    }
                }

                // Clean up
                document.querySelectorAll('.tile-container').forEach(function(el) {
                    el.classList.remove('drag-over');
                });
            }

            self.draggedTile = null;
        });
    },

    // Handle drop
    handleDrop: function(droppedTile, targetTile) {
        // Check if they have the same matchId (unique pair)
        if (droppedTile.matchId === targetTile.matchId) {
            this.handleCorrectMatch(droppedTile, targetTile);
        } else {
            this.handleWrongMatch(droppedTile, targetTile);
        }
    },

    // Handle correct match
    handleCorrectMatch: function(tile1, tile2) {
        const self = this;
        utils.playSuccessSound();

        // Mark as matched
        tile1.matched = true;
        tile2.matched = true;

        const el1 = document.getElementById(tile1.id);
        const el2 = document.getElementById(tile2.id);

        const mergedGrid = utils.mergeTiles(tile1, tile2);

        el1.classList.add('matched');
        el2.classList.add('matched');

        setTimeout(function() {
            // Update both tiles to show merged pattern
            TileGenerator.updateTile(el1, mergedGrid);
            TileGenerator.updateTile(el2, mergedGrid);

            setTimeout(function() {
                // Remove the second tile
                if (el2 && el2.parentNode) {
                    el2.remove();
                }
                
                // Update first tile grid
                tile1.grid = mergedGrid;

                // Make merged tile non-draggable and move to end
                el1.draggable = false;
                el1.classList.add('completed');

                self.matchedPairs++;
                const remaining = self.totalPairs - self.matchedPairs;
                document.getElementById('pairs-count').textContent = remaining;

                if (self.matchedPairs === self.totalPairs) {
                    setTimeout(function() {
                        self.handleVictory();
                    }, 500);
                }
            }, 400);
        }, 400);
    },

    // Handle wrong match
    handleWrongMatch: function(tile1, tile2) {
        this.stopTimer();
        utils.playErrorSound();

        const el1 = document.getElementById(tile1.id);
        const el2 = document.getElementById(tile2.id);

        el1.classList.add('wrong-match');
        el2.classList.add('wrong-match');

        setTimeout(function() {
            el1.classList.remove('wrong-match');
            el2.classList.remove('wrong-match');
            
            utils.showModal('game-over-modal');
        }, 500);
    },

    // Handle victory
    handleVictory: function() {
        this.stopTimer();
        utils.playSuccessSound();
        
        // Calculate time taken
        const timeTaken = this.timeLimit - this.timeRemaining;
        document.getElementById('victory-time').textContent = 
            'Completed in ' + utils.formatTime(timeTaken) + '!';
        
        utils.showModal('victory-modal');
    }
};

// Start game when loaded
document.addEventListener('DOMContentLoaded', function() {
    game.init();
});

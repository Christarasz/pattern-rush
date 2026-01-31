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
    selectedLevel: null,
    customContainers: 8,
    customTime: 60,

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
        AudioManager.stopBackgroundMusic();
        this.hideAllScreens();
        document.getElementById('level-screen').classList.add('active');
        utils.hideAllModals();
        // Reset selection
        this.selectedLevel = null;
        document.getElementById('play-btn').disabled = true;
        document.querySelectorAll('.level-card').forEach(function(card) {
            card.classList.remove('selected');
        });
    },

    // Select a level (new function)
    selectLevel: function(level) {
        this.selectedLevel = level;
        
        // Update UI - remove all selections
        document.querySelectorAll('.level-card').forEach(function(card) {
            card.classList.remove('selected');
        });
        
        // Highlight selected card
        if (level === 'custom') {
            document.getElementById('card-custom').classList.add('selected');
            this.customContainers = parseInt(document.getElementById('custom-containers').value);
            this.customTime = parseInt(document.getElementById('custom-time').value);
        } else {
            document.getElementById('card-' + level).classList.add('selected');
        }
        
        // Enable play button
        document.getElementById('play-btn').disabled = false;
    },

    // Update custom selection
    updateCustomSelection: function() {
        this.customContainers = parseInt(document.getElementById('custom-containers').value);
        this.customTime = parseInt(document.getElementById('custom-time').value);
    },

    // Start the selected game
    startSelectedGame: function() {
        if (!this.selectedLevel) return;
        
        if (this.selectedLevel === 'custom') {
            this.startCustomGame();
        } else {
            this.startGame(this.selectedLevel);
        }
    },

    // Start custom game
    startCustomGame: function() {
        const containerCount = this.customContainers;
        const timeLimit = this.customTime;
        const pairCount = containerCount / 2;
        
        this.currentLevel = 'custom';
        this.matchedPairs = 0;
        this.totalPairs = pairCount;
        this.timeLimit = timeLimit;
        this.timeRemaining = timeLimit;
        
        // Generate custom tiles
        this.tiles = TileGenerator.generateCustomTiles(pairCount);
        
        // Setup UI
        this.hideAllScreens();
        document.getElementById('game-screen').classList.add('active');
        document.getElementById('current-level').textContent = 'Custom';
        document.getElementById('pairs-count').textContent = this.totalPairs;
        document.getElementById('timer-value').textContent = utils.formatTime(this.timeRemaining);
        
        // Render tiles
        this.renderTiles();
        
        utils.hideAllModals();
        
        // Start background music
        AudioManager.playBackgroundMusic();
        
        // Start timer
        this.startTimer();
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
        
        // Start background music
        AudioManager.playBackgroundMusic();
        
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
        AudioManager.stopBackgroundMusic();
        AudioManager.playErrorSound();
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

            // Find element under touch with larger detection radius
            clone.style.display = 'none';
            const elBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            
            // Also check nearby points for better detection (40px radius)
            let targetEl = elBelow;
            if (!elBelow || !elBelow.classList.contains('tile-container')) {
                // Check 8 points around the touch point
                const checkPoints = [
                    {x: touch.clientX - 40, y: touch.clientY},
                    {x: touch.clientX + 40, y: touch.clientY},
                    {x: touch.clientX, y: touch.clientY - 40},
                    {x: touch.clientX, y: touch.clientY + 40},
                    {x: touch.clientX - 30, y: touch.clientY - 30},
                    {x: touch.clientX + 30, y: touch.clientY - 30},
                    {x: touch.clientX - 30, y: touch.clientY + 30},
                    {x: touch.clientX + 30, y: touch.clientY + 30}
                ];
                
                for (let i = 0; i < checkPoints.length; i++) {
                    const checkEl = document.elementFromPoint(checkPoints[i].x, checkPoints[i].y);
                    if (checkEl && checkEl.classList.contains('tile-container')) {
                        targetEl = checkEl;
                        break;
                    }
                }
            }
            
            clone.style.display = 'block';

            // Clear drag-over
            document.querySelectorAll('.tile-container').forEach(function(el) {
                el.classList.remove('drag-over');
            });

            // Add drag-over to found container
            if (targetEl && targetEl.classList.contains('tile-container')) {
                const belowTile = self.tiles.find(function(t) {
                    return t.id === targetEl.id;
                });
                if (belowTile && belowTile.id !== tile.id && !belowTile.matched) {
                    targetEl.classList.add('drag-over');
                }
            }
        });

        element.addEventListener('touchend', function(e) {
            element.classList.remove('dragging');
            
            if (clone) {
                const touch = e.changedTouches[0];
                
                // Find element with larger detection radius
                clone.style.display = 'none';
                let elBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                
                // Check nearby points if not found
                if (!elBelow || !elBelow.classList.contains('tile-container')) {
                    const checkPoints = [
                        {x: touch.clientX - 40, y: touch.clientY},
                        {x: touch.clientX + 40, y: touch.clientY},
                        {x: touch.clientX, y: touch.clientY - 40},
                        {x: touch.clientX, y: touch.clientY + 40},
                        {x: touch.clientX - 30, y: touch.clientY - 30},
                        {x: touch.clientX + 30, y: touch.clientY - 30},
                        {x: touch.clientX - 30, y: touch.clientY + 30},
                        {x: touch.clientX + 30, y: touch.clientY + 30}
                    ];
                    
                    for (let i = 0; i < checkPoints.length; i++) {
                        const checkEl = document.elementFromPoint(checkPoints[i].x, checkPoints[i].y);
                        if (checkEl && checkEl.classList.contains('tile-container')) {
                            elBelow = checkEl;
                            break;
                        }
                    }
                }
                
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
        // CRITICAL: Don't allow matching with itself
        if (droppedTile.id === targetTile.id) {
            return; // Just ignore, don't trigger game over
        }
        
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
        AudioManager.playSuccessSound();

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
        AudioManager.stopBackgroundMusic();
        AudioManager.playErrorSound();

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
        AudioManager.stopBackgroundMusic();
        AudioManager.playVictorySound();
        
        // Calculate time taken
        const timeTaken = this.timeLimit - this.timeRemaining;
        document.getElementById('victory-time').textContent = 
            'Completed in ' + utils.formatTime(timeTaken) + '!';
        
        utils.showModal('victory-modal');
    },

    // Toggle mute
    toggleMute: function() {
        const isMuted = AudioManager.toggleMute();
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) {
            muteBtn.textContent = isMuted ? '🔇' : '🔊';
            if (isMuted) {
                muteBtn.classList.add('muted');
            } else {
                muteBtn.classList.remove('muted');
                // Restart music if in game
                if (document.getElementById('game-screen').classList.contains('active')) {
                    AudioManager.playBackgroundMusic();
                }
            }
        }
    }
};

// Fix mobile viewport height for visible footer buttons
function setMobileViewportHeight() {
    // Get the actual viewport height
    const vh = window.innerHeight * 0.01;
    // Set CSS variable
    document.documentElement.style.setProperty('--vh', vh + 'px');
}

// Set on load
setMobileViewportHeight();

// Update on resize and orientation change
window.addEventListener('resize', setMobileViewportHeight);
window.addEventListener('orientationchange', function() {
    setTimeout(setMobileViewportHeight, 100);
});

// Start game when loaded
document.addEventListener('DOMContentLoaded', function() {
    game.init();
    // Set viewport height again after DOM loaded
    setTimeout(setMobileViewportHeight, 100);
});

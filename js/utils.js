// Utility functions

const utils = {
    // Shuffle array
    shuffle: function(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    // Get random color
    getRandomColor: function() {
        const colors = ['red', 'blue', 'yellow', 'purple', 'orange', 'green', 'pink', 'cyan'];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    // Vibrate device
    vibrate: function(pattern) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    },

    // Play success sound
    playSuccessSound: function() {
        this.vibrate([100, 50, 100]);
    },

    // Play error sound
    playErrorSound: function() {
        this.vibrate([200, 100, 200, 100, 200]);
    },

    // Check if two tiles match
    tilesMatch: function(tile1, tile2) {
        const grid1 = tile1.grid;
        const grid2 = tile2.grid;

        // Must have same dimensions
        if (grid1.length !== grid2.length || grid1[0].length !== grid2[0].length) {
            return false;
        }

        // Check if tiles are complementary
        for (let row = 0; row < grid1.length; row++) {
            for (let col = 0; col < grid1[row].length; col++) {
                const color1 = grid1[row][col];
                const color2 = grid2[row][col];

                // Both grey = not a match
                if (color1 === 'grey' && color2 === 'grey') {
                    return false;
                }
                // Both colored = not a match
                if (color1 !== 'grey' && color2 !== 'grey') {
                    return false;
                }
            }
        }

        return true;
    },

    // Merge two matching tiles
    mergeTiles: function(tile1, tile2) {
        const mergedGrid = [];
        for (let row = 0; row < tile1.grid.length; row++) {
            mergedGrid[row] = [];
            for (let col = 0; col < tile1.grid[row].length; col++) {
                const color1 = tile1.grid[row][col];
                const color2 = tile2.grid[row][col];
                mergedGrid[row][col] = color1 === 'grey' ? color2 : color1;
            }
        }
        return mergedGrid;
    },

    // Show modal
    showModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },

    // Hide modal
    hideModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    // Hide all modals
    hideAllModals: function() {
        document.querySelectorAll('.modal').forEach(function(modal) {
            modal.classList.remove('active');
        });
    },

    // Format time (seconds to display)
    formatTime: function(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
};

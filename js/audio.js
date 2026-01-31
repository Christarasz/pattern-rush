// Audio Manager - Background music and sound effects

const AudioManager = {
    audioContext: null,
    backgroundMusic: null,
    isMusicPlaying: false,
    isMuted: false,

    // Initialize audio context
    init: function() {
        if (!this.audioContext || this.audioContext.state === 'closed') {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch(e) {
                console.log('Web Audio API not supported');
            }
        }
    },

    // Play background music (upbeat game music)
    playBackgroundMusic: function() {
        if (this.isMusicPlaying || this.isMuted) return;
        
        this.init();
        this.isMusicPlaying = true;
        
        const ctx = this.audioContext;
        
        // Cheerful melody - more varied and energetic
        const melodyNotes = [
            // Bar 1 - Upbeat start
            {freq: 659.25, time: 0, duration: 0.15},    // E5
            {freq: 659.25, time: 0.2, duration: 0.15},  // E5
            {freq: 783.99, time: 0.4, duration: 0.15},  // G5
            {freq: 1046.5, time: 0.6, duration: 0.3},   // C6
            
            // Bar 2 - Variation
            {freq: 987.77, time: 1.0, duration: 0.15},  // B5
            {freq: 880.00, time: 1.2, duration: 0.15},  // A5
            {freq: 783.99, time: 1.4, duration: 0.15},  // G5
            {freq: 659.25, time: 1.6, duration: 0.3},   // E5
            
            // Bar 3 - Jump up
            {freq: 783.99, time: 2.0, duration: 0.15},  // G5
            {freq: 1046.5, time: 2.2, duration: 0.15},  // C6
            {freq: 1174.7, time: 2.4, duration: 0.15},  // D6
            {freq: 1318.5, time: 2.6, duration: 0.3},   // E6
            
            // Bar 4 - Descending fun
            {freq: 1174.7, time: 3.0, duration: 0.15},  // D6
            {freq: 1046.5, time: 3.2, duration: 0.15},  // C6
            {freq: 987.77, time: 3.4, duration: 0.15},  // B5
            {freq: 880.00, time: 3.6, duration: 0.3},   // A5
            
            // Bar 5 - Happy bounce
            {freq: 659.25, time: 4.0, duration: 0.1},   // E5
            {freq: 783.99, time: 4.15, duration: 0.1},  // G5
            {freq: 659.25, time: 4.3, duration: 0.1},   // E5
            {freq: 783.99, time: 4.45, duration: 0.1},  // G5
            {freq: 1046.5, time: 4.6, duration: 0.3},   // C6
            
            // Bar 6 - Energetic run
            {freq: 1174.7, time: 5.0, duration: 0.1},   // D6
            {freq: 1046.5, time: 5.15, duration: 0.1},  // C6
            {freq: 987.77, time: 5.3, duration: 0.1},   // B5
            {freq: 880.00, time: 5.45, duration: 0.1},  // A5
            {freq: 783.99, time: 5.6, duration: 0.3},   // G5
            
            // Bar 7 - Build up
            {freq: 659.25, time: 6.0, duration: 0.15},  // E5
            {freq: 739.99, time: 6.2, duration: 0.15},  // F#5
            {freq: 880.00, time: 6.4, duration: 0.15},  // A5
            {freq: 1046.5, time: 6.6, duration: 0.3},   // C6
            
            // Bar 8 - Finish strong
            {freq: 1318.5, time: 7.0, duration: 0.2},   // E6
            {freq: 1174.7, time: 7.25, duration: 0.15}, // D6
            {freq: 1046.5, time: 7.45, duration: 0.15}, // C6
            {freq: 783.99, time: 7.65, duration: 0.3},  // G5
        ];
        
        // Bass line for depth
        const bassNotes = [
            {freq: 130.81, time: 0, duration: 0.4},     // C3
            {freq: 146.83, time: 0.5, duration: 0.4},   // D3
            {freq: 164.81, time: 1.0, duration: 0.4},   // E3
            {freq: 146.83, time: 1.5, duration: 0.4},   // D3
            {freq: 130.81, time: 2.0, duration: 0.4},   // C3
            {freq: 196.00, time: 2.5, duration: 0.4},   // G3
            {freq: 174.61, time: 3.0, duration: 0.4},   // F3
            {freq: 164.81, time: 3.5, duration: 0.4},   // E3
            {freq: 130.81, time: 4.0, duration: 0.4},   // C3
            {freq: 146.83, time: 4.5, duration: 0.4},   // D3
            {freq: 164.81, time: 5.0, duration: 0.4},   // E3
            {freq: 196.00, time: 5.5, duration: 0.4},   // G3
            {freq: 220.00, time: 6.0, duration: 0.4},   // A3
            {freq: 196.00, time: 6.5, duration: 0.4},   // G3
            {freq: 164.81, time: 7.0, duration: 0.4},   // E3
            {freq: 130.81, time: 7.5, duration: 0.4},   // C3
        ];
        
        const playMelody = () => {
            if (!this.isMusicPlaying) return;
            
            // Play melody (square wave for classic game sound)
            melodyNotes.forEach(note => {
                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                osc.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                osc.type = 'square';
                osc.frequency.value = note.freq;
                
                gainNode.gain.setValueAtTime(0, ctx.currentTime + note.time);
                gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + note.time + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.time + note.duration);
                
                osc.start(ctx.currentTime + note.time);
                osc.stop(ctx.currentTime + note.time + note.duration);
            });
            
            // Play bass (triangle wave for deeper sound)
            bassNotes.forEach(note => {
                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                osc.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                osc.type = 'triangle';
                osc.frequency.value = note.freq;
                
                gainNode.gain.setValueAtTime(0, ctx.currentTime + note.time);
                gainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + note.time + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.time + note.duration);
                
                osc.start(ctx.currentTime + note.time);
                osc.stop(ctx.currentTime + note.time + note.duration);
            });
            
            // Loop the music (8 seconds)
            setTimeout(playMelody, 8000);
        };
        
        playMelody();
    },

    // Stop background music
    stopBackgroundMusic: function() {
        this.isMusicPlaying = false;
        
        // Immediately stop all oscillators by closing audio context
        if (this.audioContext) {
            try {
                // Close the context to stop all sounds immediately
                this.audioContext.close();
                this.audioContext = null;
            } catch(e) {
                // Ignore errors
            }
        }
    },

    // Play success sound (correct match)
    playSuccessSound: function() {
        // Vibrate once - at the start
        utils.vibrate([100, 50, 100]);
        
        if (this.isMuted) {
            return;
        }
        
        this.init();
        const ctx = this.audioContext;
        
        // Happy ascending chime
        const notes = [
            {freq: 523.25, time: 0, duration: 0.1},     // C5
            {freq: 659.25, time: 0.08, duration: 0.1},  // E5
            {freq: 783.99, time: 0.16, duration: 0.15}, // G5
            {freq: 1046.5, time: 0.24, duration: 0.25}, // C6
        ];
        
        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.value = note.freq;
            
            gainNode.gain.setValueAtTime(0, ctx.currentTime + note.time);
            gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + note.time + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.time + note.duration);
            
            osc.start(ctx.currentTime + note.time);
            osc.stop(ctx.currentTime + note.time + note.duration);
        });
    },

    // Play error sound (wrong match / game over)
    playErrorSound: function() {
        // Vibrate once - no loops
        utils.vibrate([200, 100, 200]);
        
        if (this.isMuted) {
            return;
        }
        
        this.init();
        const ctx = this.audioContext;
        
        // Descending "game over" sound
        const notes = [
            {freq: 392.00, time: 0, duration: 0.15},    // G4
            {freq: 349.23, time: 0.1, duration: 0.15},  // F4
            {freq: 293.66, time: 0.2, duration: 0.15},  // D4
            {freq: 261.63, time: 0.3, duration: 0.4},   // C4 (longer)
        ];
        
        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.value = note.freq;
            
            gainNode.gain.setValueAtTime(0, ctx.currentTime + note.time);
            gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + note.time + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.time + note.duration);
            
            osc.start(ctx.currentTime + note.time);
            osc.stop(ctx.currentTime + note.time + note.duration);
        });
    },

    // Play victory sound
    playVictorySound: function() {
        if (this.isMuted) {
            utils.vibrate([100, 50, 100, 50, 100, 50, 200]);
            return;
        }
        
        this.init();
        const ctx = this.audioContext;
        
        // Triumphant fanfare
        const notes = [
            {freq: 523.25, time: 0, duration: 0.15},
            {freq: 659.25, time: 0.15, duration: 0.15},
            {freq: 783.99, time: 0.3, duration: 0.15},
            {freq: 1046.5, time: 0.45, duration: 0.2},
            {freq: 783.99, time: 0.65, duration: 0.1},
            {freq: 1046.5, time: 0.75, duration: 0.4},
        ];
        
        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.value = note.freq;
            
            gainNode.gain.setValueAtTime(0, ctx.currentTime + note.time);
            gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + note.time + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.time + note.duration);
            
            osc.start(ctx.currentTime + note.time);
            osc.stop(ctx.currentTime + note.time + note.duration);
        });
        
        utils.vibrate([100, 50, 100, 50, 100, 50, 200]);
    },

    // Toggle mute
    toggleMute: function() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBackgroundMusic();
        }
        return this.isMuted;
    }
};

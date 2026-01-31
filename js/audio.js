// Audio Manager - Background music and sound effects

const AudioManager = {
    audioContext: null,
    backgroundMusic: null,
    isMusicPlaying: false,
    isMuted: false,

    // Initialize audio context
    init: function() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    // Play background music (upbeat game music)
    playBackgroundMusic: function() {
        if (this.isMusicPlaying || this.isMuted) return;
        
        this.init();
        this.isMusicPlaying = true;
        
        const ctx = this.audioContext;
        
        // Create a simple upbeat melody
        const melodyNotes = [
            // Main theme - happy and energetic
            {freq: 523.25, time: 0, duration: 0.15},    // C5
            {freq: 659.25, time: 0.15, duration: 0.15}, // E5
            {freq: 783.99, time: 0.3, duration: 0.15},  // G5
            {freq: 1046.5, time: 0.45, duration: 0.3},  // C6
            {freq: 783.99, time: 0.75, duration: 0.15}, // G5
            {freq: 1046.5, time: 0.9, duration: 0.3},   // C6
            
            {freq: 587.33, time: 1.2, duration: 0.15},  // D5
            {freq: 739.99, time: 1.35, duration: 0.15}, // F#5
            {freq: 880.00, time: 1.5, duration: 0.15},  // A5
            {freq: 1174.7, time: 1.65, duration: 0.3},  // D6
            {freq: 880.00, time: 1.95, duration: 0.15}, // A5
            {freq: 1174.7, time: 2.1, duration: 0.3},   // D6
        ];
        
        const playMelody = () => {
            if (!this.isMusicPlaying) return;
            
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
            
            // Loop the music
            setTimeout(playMelody, 2400);
        };
        
        playMelody();
    },

    // Stop background music
    stopBackgroundMusic: function() {
        this.isMusicPlaying = false;
    },

    // Play success sound (correct match)
    playSuccessSound: function() {
        if (this.isMuted) {
            utils.vibrate([100, 50, 100]);
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
        
        utils.vibrate([100, 50, 100]);
    },

    // Play error sound (wrong match / game over)
    playErrorSound: function() {
        if (this.isMuted) {
            utils.vibrate([200, 100, 200, 100, 200]);
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
        
        utils.vibrate([200, 100, 200, 100, 200]);
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

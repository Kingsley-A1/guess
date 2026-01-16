/**
 * King Guesser - Premium Game Application
 * Mobile-First Progressive Web App
 * 
 * Features:
 * - Hot/Cold visual feedback
 * - Haptic feedback for mobile
 * - Premium confetti celebrations
 * - Level journey visualization
 * - PWA install prompt
 * - Offline support
 */

// ==========================================================================
// 1. GAME STATE & CONFIGURATION
// ==========================================================================

const GameConfig = {
  maxLevel: 50,
  levels: [
    // Beginner (1-10): 10 → 50,000
    { level: 1, maxNumber: 10, guessLimit: 5 },
    { level: 2, maxNumber: 50, guessLimit: 7 },
    { level: 3, maxNumber: 100, guessLimit: 10 },
    { level: 4, maxNumber: 250, guessLimit: 12 },
    { level: 5, maxNumber: 500, guessLimit: 14 },
    { level: 6, maxNumber: 1000, guessLimit: 16 },
    { level: 7, maxNumber: 2500, guessLimit: 18 },
    { level: 8, maxNumber: 5000, guessLimit: 20 },
    { level: 9, maxNumber: 10000, guessLimit: 22 },
    { level: 10, maxNumber: 50000, guessLimit: 25 },
    
    // Intermediate (11-20): 100K → 10M
    { level: 11, maxNumber: 100000, guessLimit: 28 },
    { level: 12, maxNumber: 250000, guessLimit: 30 },
    { level: 13, maxNumber: 500000, guessLimit: 32 },
    { level: 14, maxNumber: 1000000, guessLimit: 35 },
    { level: 15, maxNumber: 2000000, guessLimit: 38 },
    { level: 16, maxNumber: 3500000, guessLimit: 40 },
    { level: 17, maxNumber: 5000000, guessLimit: 42 },
    { level: 18, maxNumber: 7500000, guessLimit: 45 },
    { level: 19, maxNumber: 10000000, guessLimit: 48 },
    { level: 20, maxNumber: 15000000, guessLimit: 50 },
    
    // Advanced (21-35): 20M → 500M
    { level: 21, maxNumber: 20000000, guessLimit: 52 },
    { level: 22, maxNumber: 30000000, guessLimit: 54 },
    { level: 23, maxNumber: 50000000, guessLimit: 56 },
    { level: 24, maxNumber: 75000000, guessLimit: 58 },
    { level: 25, maxNumber: 100000000, guessLimit: 60 },
    { level: 26, maxNumber: 150000000, guessLimit: 62 },
    { level: 27, maxNumber: 200000000, guessLimit: 64 },
    { level: 28, maxNumber: 250000000, guessLimit: 66 },
    { level: 29, maxNumber: 300000000, guessLimit: 68 },
    { level: 30, maxNumber: 350000000, guessLimit: 70 },
    { level: 31, maxNumber: 400000000, guessLimit: 72 },
    { level: 32, maxNumber: 450000000, guessLimit: 74 },
    { level: 33, maxNumber: 500000000, guessLimit: 76 },
    { level: 34, maxNumber: 600000000, guessLimit: 78 },
    { level: 35, maxNumber: 750000000, guessLimit: 80 },
    
    // Master (36-50): 1B → 1T
    { level: 36, maxNumber: 1000000000, guessLimit: 82 },
    { level: 37, maxNumber: 2000000000, guessLimit: 84 },
    { level: 38, maxNumber: 5000000000, guessLimit: 86 },
    { level: 39, maxNumber: 10000000000, guessLimit: 88 },
    { level: 40, maxNumber: 20000000000, guessLimit: 90 },
    { level: 41, maxNumber: 50000000000, guessLimit: 92 },
    { level: 42, maxNumber: 75000000000, guessLimit: 94 },
    { level: 43, maxNumber: 100000000000, guessLimit: 96 },
    { level: 44, maxNumber: 150000000000, guessLimit: 98 },
    { level: 45, maxNumber: 200000000000, guessLimit: 100 },
    { level: 46, maxNumber: 300000000000, guessLimit: 102 },
    { level: 47, maxNumber: 500000000000, guessLimit: 104 },
    { level: 48, maxNumber: 750000000000, guessLimit: 106 },
    { level: 49, maxNumber: 900000000000, guessLimit: 108 },
    { level: 50, maxNumber: 1000000000000, guessLimit: 110 },
  ]
};

// Game State with validation and pause time tracking
const GameState = {
  currentLevel: 1,
  secretNumber: null,
  guessLimit: 5,
  maxNumber: 10,
  guessesTaken: 0,
  gameActive: false,
  isPaused: false,
  totalGuesses: 0,
  levelGuesses: [],
  minRange: 1,
  maxRange: 10,
  levelStartTime: null,
  pauseStartTime: null,
  totalPausedTime: 0,
  startLevel: 1,
  playerName: 'Player',
  isSubmitting: false, // Prevent double submissions
  lastGuessTime: 0     // Rate limiting
};

// ==========================================================================
// 2. DOM ELEMENTS
// ==========================================================================

const DOM = {
  // Header
  playerName: null,
  startLevelSelect: null,
  leaderboardBtn: null,
  settingsBtn: null,
  
  // Game
  levelBadge: null,
  levelInfo: null,
  progressFill: null,
  rangeVisualizer: null,
  rangeActive: null,
  rangeMin: null,
  rangeMax: null,
  guessInput: null,
  submitBtn: null,
  hintBtn: null,
  message: null,
  statsGrid: null,
  journeyTrack: null,
  
  // Controls
  startBtn: null,
  pauseBtn: null,
  restartBtn: null,
  
  // Modals
  leaderboardModal: null,
  settingsModal: null,
  
  // Celebration
  celebrationOverlay: null,
  confettiCanvas: null,
  
  // Bottom Nav
  bottomNav: null,
  
  // Install Prompt
  installPrompt: null
};

// ==========================================================================
// 3. UTILITY FUNCTIONS
// ==========================================================================

const Utils = {
  formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return num.toLocaleString();
  },
  
  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return text.replace(/[&<>"']/g, c => map[c]);
  },
  
  clamp(value, min, max) {
    const v = Number(value) || 0;
    return Math.min(Math.max(v, min), max);
  },
  
  randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    if (min > max) [min, max] = [max, min];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  
  lerp(start, end, t) {
    return start + (end - start) * Utils.clamp(t, 0, 1);
  },
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Sanitize player name - remove special chars, limit length
  sanitizeName(name) {
    if (typeof name !== 'string') return 'Player';
    const sanitized = name.trim()
      .replace(/[<>"'&\/\\]/g, '')
      .substring(0, 20);
    return sanitized || 'Player';
  },
  
  // Validate integer within range
  validateInt(value, min, max) {
    const num = parseInt(value, 10);
    if (isNaN(num)) return null;
    if (num < min || num > max) return null;
    return num;
  },
  
  // Safe JSON parse
  safeJsonParse(str, fallback = null) {
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  }
};

// ==========================================================================
// 4. STORAGE MANAGER
// ==========================================================================

const Storage = {
  keys: {
    scores: 'kingGuesser_scores',
    playerName: 'kingGuesser_playerName',
    settings: 'kingGuesser_settings',
    apiUrl: 'kingGuesser_apiUrl'
  },
  
  MAX_SCORES: 200,
  MAX_NAME_LENGTH: 20,
  
  getScores() {
    try {
      const data = localStorage.getItem(this.keys.scores);
      if (!data) return [];
      const scores = JSON.parse(data);
      if (!Array.isArray(scores)) return [];
      // Validate each score entry
      return scores.filter(s => this.isValidScoreEntry(s));
    } catch {
      return [];
    }
  },
  
  isValidScoreEntry(entry) {
    if (!entry || typeof entry !== 'object') return false;
    if (typeof entry.name !== 'string') return false;
    if (typeof entry.levelCompleted !== 'number' || entry.levelCompleted < 1 || entry.levelCompleted > 20) return false;
    if (typeof entry.guesses !== 'number' || entry.guesses < 1 || entry.guesses > 100) return false;
    if (entry.timeSpentSeconds !== undefined && (typeof entry.timeSpentSeconds !== 'number' || entry.timeSpentSeconds < 0)) return false;
    return true;
  },
  
  saveScore(entry) {
    try {
      // Validate entry before saving
      if (!this.isValidScoreEntry(entry)) {
        console.warn('Invalid score entry rejected:', entry);
        return false;
      }
      
      // Sanitize the entry
      const sanitizedEntry = {
        name: Utils.sanitizeName(entry.name),
        levelCompleted: Utils.clamp(Math.floor(entry.levelCompleted), 1, 20),
        guesses: Utils.clamp(Math.floor(entry.guesses), 1, 100),
        timeSpentSeconds: Math.max(0, Math.floor(entry.timeSpentSeconds || 0)),
        startLevel: Utils.clamp(Math.floor(entry.startLevel || 1), 1, 20),
        date: entry.date || new Date().toISOString()
      };
      
      const scores = this.getScores();
      scores.push(sanitizedEntry);
      
      // Keep only last MAX_SCORES
      if (scores.length > this.MAX_SCORES) {
        scores.splice(0, scores.length - this.MAX_SCORES);
      }
      
      localStorage.setItem(this.keys.scores, JSON.stringify(scores));
      return true;
    } catch (e) {
      console.error('Failed to save score:', e);
      return false;
    }
  },
  
  clearScores() {
    try {
      localStorage.removeItem(this.keys.scores);
      return true;
    } catch {
      return false;
    }
  },
  
  getPlayerName() {
    try {
      const name = localStorage.getItem(this.keys.playerName);
      return Utils.sanitizeName(name || 'Player');
    } catch {
      return 'Player';
    }
  },
  
  setPlayerName(name) {
    try {
      const sanitized = Utils.sanitizeName(name);
      localStorage.setItem(this.keys.playerName, sanitized);
      return sanitized;
    } catch {
      return 'Player';
    }
  },
  
  getSettings() {
    try {
      const data = localStorage.getItem(this.keys.settings);
      if (!data) return {};
      const settings = JSON.parse(data);
      return (settings && typeof settings === 'object') ? settings : {};
    } catch {
      return {};
    }
  },
  
  setSettings(settings) {
    localStorage.setItem(this.keys.settings, JSON.stringify(settings));
  },
  
  getSetting(key, defaultValue) {
    const settings = this.getSettings();
    return settings[key] !== undefined ? settings[key] : defaultValue;
  },
  
  setSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    this.setSettings(settings);
  }
};

// ==========================================================================
// 5. HAPTIC FEEDBACK
// ==========================================================================

const Haptics = {
  light() {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  medium() {
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  },
  
  heavy() {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  },
  
  success() {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50, 30, 100]);
    }
  },
  
  error() {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  },
  
  selection() {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  }
};

// ==========================================================================
// 6. AUDIO MANAGER
// ==========================================================================

const Audio = {
  context: null,
  enabled: true,
  volume: 0.9,
  
  init() {
    this.enabled = Storage.getSetting('soundEnabled', true);
    this.volume = Storage.getSetting('soundVolume', 0.9);
  },
  
  getContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.context;
  },
  
  resume() {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  },
  
  playClick() {
    if (!this.enabled) return;
    this.playTone(800, 0.05, 'sine', 0.3);
  },
  
  playSuccess() {
    if (!this.enabled) return;
    this.playCelebration(0.8);
  },
  
  playChampion() {
    if (!this.enabled) return;
    this.playCelebration(1.0);
  },
  
  playError() {
    if (!this.enabled) return;
    this.playTone(200, 0.2, 'sawtooth', 0.2);
  },
  
  playHint() {
    if (!this.enabled) return;
    this.playTone(600, 0.1, 'triangle', 0.3);
  },
  
  playTone(frequency, duration, type = 'sine', vol = 0.5) {
    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.value = frequency;
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(vol * this.volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      
      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch (e) {
      // Ignore audio errors
    }
  },
  
  playCelebration(intensity = 1.0) {
    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') return;
      
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.value = this.volume;
      master.connect(ctx.destination);
      
      // White noise bursts for applause
      for (let i = 0; i < 6; i++) {
        const bufferSize = ctx.sampleRate * 1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
          data[j] = (Math.random() * 2 - 1) * Math.pow(Math.random(), 3);
        }
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        
        const band = ctx.createBiquadFilter();
        band.type = 'bandpass';
        band.frequency.value = 700 + Math.random() * 1200;
        
        const g = ctx.createGain();
        const start = now + i * 0.02;
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime((0.06 + Math.random() * 0.06) * intensity, start + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, start + 0.6 + Math.random() * 0.4);
        
        source.connect(band);
        band.connect(g);
        g.connect(master);
        source.start(start);
        source.stop(start + 1.2);
      }
      
      // Tonal chord
      const toneFreqs = [880, 1100, 1320];
      toneFreqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f * (1 + (Math.random() - 0.5) * 0.02);
        
        const g = ctx.createGain();
        g.gain.value = 0.0001;
        osc.connect(g);
        g.connect(master);
        
        const tOn = now + 0.03 + idx * 0.02;
        const tOff = now + 0.6 + idx * 0.06;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.35 * intensity, tOn + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, tOff);
        
        osc.start(now);
        osc.stop(tOff + 0.05);
      });
    } catch (e) {
      // Ignore audio errors
    }
  },
  
  setEnabled(enabled) {
    this.enabled = enabled;
    Storage.setSetting('soundEnabled', enabled);
  },
  
  setVolume(vol) {
    this.volume = Utils.clamp(vol, 0, 1);
    Storage.setSetting('soundVolume', this.volume);
  }
};

// ==========================================================================
// 7. CONFETTI SYSTEM
// ==========================================================================

const Confetti = {
  canvas: null,
  ctx: null,
  particles: [],
  running: false,
  enabled: true,
  
  init() {
    this.canvas = document.getElementById('confetti-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
    this.enabled = Storage.getSetting('confettiEnabled', true);
  },
  
  resize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  },
  
  burst(count = 120) {
    if (!this.enabled || !this.canvas) return;
    
    const colors = [
      '#8b5cf6', '#a855f7', '#ec4899', '#f472b6',
      '#6366f1', '#818cf8', '#fbbf24', '#34d399'
    ];
    
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: -20 - Math.random() * 200,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocityX: (Math.random() - 0.5) * 8,
        velocityY: Math.random() * 6 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
        ttl: 4000 + Math.random() * 2000
      });
    }
    
    this.canvas.style.display = 'block';
    if (!this.running) {
      this.running = true;
      this.animate();
    }
  },
  
  animate() {
    if (!this.running || !this.ctx) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const delta = 16;
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.x += p.velocityX;
      p.y += p.velocityY;
      p.velocityY += 0.15; // gravity
      p.velocityX *= 0.99; // air resistance
      p.rotation += p.rotationSpeed;
      p.ttl -= delta;
      
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation * Math.PI / 180);
      this.ctx.fillStyle = p.color;
      
      if (p.shape === 'rect') {
        this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.5);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      this.ctx.restore();
      
      if (p.y > this.canvas.height + 50 || p.ttl <= 0) {
        this.particles.splice(i, 1);
      }
    }
    
    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.running = false;
      this.canvas.style.display = 'none';
    }
  },
  
  stop() {
    this.particles = [];
    this.running = false;
    if (this.canvas) {
      this.canvas.style.display = 'none';
    }
  },
  
  setEnabled(enabled) {
    this.enabled = enabled;
    Storage.setSetting('confettiEnabled', enabled);
  }
};

// ==========================================================================
// 8. PROXIMITY FEEDBACK (Hot/Cold)
// ==========================================================================

const ProximityFeedback = {
  getTemperature(guess, secret, maxNumber) {
    const distance = Math.abs(guess - secret);
    const range = maxNumber;
    const percentage = (distance / range) * 100;
    
    if (percentage <= 1) return 'burning';
    if (percentage <= 5) return 'hot';
    if (percentage <= 15) return 'warm';
    if (percentage <= 30) return 'cool';
    if (percentage <= 50) return 'cold';
    return 'freezing';
  },
  
  getMessage(temperature, direction) {
    const messages = {
      burning: { 
        text: "🔥 BURNING HOT! You're SO close!",
        class: 'message--hot'
      },
      hot: { 
        text: `🌡️ Very hot! Go ${direction}!`,
        class: 'message--hot'
      },
      warm: { 
        text: `☀️ Getting warmer... ${direction}!`,
        class: 'message--warm'
      },
      cool: { 
        text: `❄️ Cool... try going ${direction}`,
        class: 'message--cool'
      },
      cold: { 
        text: `🥶 Cold... ${direction}!`,
        class: 'message--cold'
      },
      freezing: { 
        text: `🧊 Freezing! Way too ${direction === 'lower' ? 'high' : 'low'}!`,
        class: 'message--freezing'
      }
    };
    return messages[temperature];
  },
  
  applyVisualFeedback(element, temperature) {
    // Remove all temperature classes
    element.classList.remove(
      'animate-hot', 'animate-warm', 'animate-cold', 'animate-freezing'
    );
    
    // Add appropriate animation
    switch (temperature) {
      case 'burning':
      case 'hot':
        element.classList.add('animate-hot');
        break;
      case 'warm':
        element.classList.add('animate-warm');
        break;
      case 'cool':
      case 'cold':
        element.classList.add('animate-cold');
        break;
      case 'freezing':
        element.classList.add('animate-freezing');
        break;
    }
  }
};

// ==========================================================================
// 9. GAME LOGIC
// ==========================================================================

const Game = {
  getDifficulty(level) {
    const config = GameConfig.levels.find(l => l.level === level);
    return config || GameConfig.levels[0];
  },
  
  start() {
    GameState.startLevel = parseInt(DOM.startLevelSelect?.value || 1);
    GameState.currentLevel = GameState.startLevel;
    GameState.totalGuesses = 0;
    GameState.levelGuesses = [];
    GameState.gameActive = true;
    GameState.isPaused = false;
    
    // Update UI
    if (DOM.startBtn) DOM.startBtn.style.display = 'none';
    if (DOM.pauseBtn) DOM.pauseBtn.style.display = 'inline-flex';
    if (DOM.restartBtn) DOM.restartBtn.style.display = 'none';
    
    // Resume audio context
    Audio.resume();
    Haptics.medium();
    
    this.updateProgress();
    this.updateStats();
    this.updateJourney();
    this.startLevel();
  },
  
  startLevel() {
    const difficulty = this.getDifficulty(GameState.currentLevel);
    GameState.maxNumber = difficulty.maxNumber;
    GameState.guessLimit = difficulty.guessLimit;
    GameState.secretNumber = Utils.randomInt(1, GameState.maxNumber);
    GameState.guessesTaken = 0;
    GameState.minRange = 1;
    GameState.maxRange = GameState.maxNumber;
    GameState.levelStartTime = performance.now();
    GameState.totalPausedTime = 0; // Reset pause time for new level
    GameState.pauseStartTime = null;
    GameState.isSubmitting = false;
    
    // Update UI
    this.updateLevelBadge();
    this.updateLevelInfo();
    this.updateRangeVisualizer();
    this.clearMessage();
    
    if (DOM.guessInput) {
      DOM.guessInput.value = '';
      DOM.guessInput.max = GameState.maxNumber;
      DOM.guessInput.min = 1;
      DOM.guessInput.focus();
    }
    
    if (DOM.hintBtn) DOM.hintBtn.style.display = 'inline-flex';
    
    this.updateProgress();
    this.updateJourney();
  },
  
  submitGuess() {
    // Prevent double submissions and check game state
    if (!GameState.gameActive || GameState.isPaused || GameState.isSubmitting) return;
    
    // Rate limiting - minimum 300ms between guesses
    const now = Date.now();
    if (now - GameState.lastGuessTime < 300) return;
    GameState.lastGuessTime = now;
    GameState.isSubmitting = true;
    
    try {
      const guessValue = DOM.guessInput?.value;
      const userGuess = Utils.validateInt(guessValue, 1, GameState.maxNumber);
      
      // Validate
      if (userGuess === null) {
        this.showMessage(
          `Please enter a number between 1 and ${Utils.formatNumber(GameState.maxNumber)}`,
          'error'
        );
        Haptics.error();
        Audio.playError();
        DOM.guessInput?.classList.add('animate-shake');
        setTimeout(() => DOM.guessInput?.classList.remove('animate-shake'), 600);
        return;
      }
      
      GameState.guessesTaken++;
      GameState.totalGuesses++;
      Haptics.light();
      Audio.playClick();
      
      if (userGuess === GameState.secretNumber) {
        this.handleWin();
      } else {
        this.handleWrongGuess(userGuess);
      }
      
      this.updateStats();
      if (DOM.guessInput) DOM.guessInput.value = '';
    } finally {
      // Always reset submission lock
      GameState.isSubmitting = false;
    }
  },
  
  handleWin() {
    GameState.levelGuesses.push(GameState.guessesTaken);
    // Calculate time spent, excluding paused time
    const rawTime = performance.now() - GameState.levelStartTime;
    const timeSpent = Math.max(0, Math.round((rawTime - GameState.totalPausedTime) / 1000));
    
    const isChampion = GameState.currentLevel >= GameConfig.maxLevel;
    
    // Save score
    this.saveScore(GameState.currentLevel, GameState.guessesTaken, timeSpent);
    
    // Show celebration
    Haptics.success();
    Audio.playSuccess();
    Confetti.burst(isChampion ? 300 : 120);
    
    // Show victory modal with stats
    VictoryModal.show({
      level: GameState.currentLevel,
      guesses: GameState.guessesTaken,
      guessLimit: GameState.guessLimit,
      time: timeSpent,
      playerName: GameState.playerName,
      isChampion: isChampion
    });
    
    // Progress to next level (will be triggered by modal continue button)
    GameState.currentLevel++;
    
    if (isChampion) {
      this.handleChampion();
    }
  },
  
  handleWrongGuess(userGuess) {
    const direction = userGuess > GameState.secretNumber ? 'lower' : 'higher';
    const temperature = ProximityFeedback.getTemperature(
      userGuess, 
      GameState.secretNumber, 
      GameState.maxNumber
    );
    
    // Update range
    if (userGuess > GameState.secretNumber) {
      GameState.maxRange = Math.min(GameState.maxRange, userGuess - 1);
    } else {
      GameState.minRange = Math.max(GameState.minRange, userGuess + 1);
    }
    
    this.updateRangeVisualizer();
    
    if (GameState.guessesTaken >= GameState.guessLimit) {
      // Out of guesses
      this.showMessage(
        `💔 Out of guesses! The number was ${Utils.formatNumber(GameState.secretNumber)}`,
        'error'
      );
      Haptics.error();
      Audio.playError();
      setTimeout(() => this.startLevel(), 3000);
    } else {
      // Show hot/cold feedback
      const feedback = ProximityFeedback.getMessage(temperature, direction);
      const guessesLeft = GameState.guessLimit - GameState.guessesTaken;
      this.showMessage(
        `${feedback.text} (${guessesLeft} guesses left)`,
        temperature
      );
      ProximityFeedback.applyVisualFeedback(DOM.guessInput, temperature);
    }
  },
  
  handleChampion() {
    GameState.gameActive = false;
    
    this.showMessage(
      '🏆 CHAMPION! You conquered all 20 levels!',
      'success'
    );
    
    Haptics.success();
    Audio.playChampion();
    Confetti.burst(300);
    
    if (DOM.hintBtn) DOM.hintBtn.style.display = 'none';
    if (DOM.pauseBtn) DOM.pauseBtn.style.display = 'none';
    if (DOM.restartBtn) DOM.restartBtn.style.display = 'inline-flex';
  },
  
  giveHint() {
    // Check all blocking conditions including pause state
    if (!GameState.gameActive || GameState.isPaused || GameState.guessesTaken >= GameState.guessLimit) return;
    
    // Rate limiting for hints too
    const now = Date.now();
    if (now - GameState.lastGuessTime < 300) return;
    GameState.lastGuessTime = now;
    
    GameState.guessesTaken++;
    GameState.totalGuesses++;
    
    // Binary search style hint
    const mid = Math.floor((GameState.minRange + GameState.maxRange) / 2);
    
    if (GameState.secretNumber <= mid) {
      GameState.maxRange = mid;
    } else {
      GameState.minRange = mid + 1;
    }
    
    Haptics.light();
    Audio.playHint();
    
    this.showMessage(
      `💡 The number is between ${Utils.formatNumber(GameState.minRange)} and ${Utils.formatNumber(GameState.maxRange)} (1 guess used)`,
      'info'
    );
    
    this.updateRangeVisualizer();
    this.updateStats();
    
    // Check if out of guesses after hint
    if (GameState.guessesTaken >= GameState.guessLimit) {
      Haptics.error();
      Audio.playError();
      this.showMessage(
        `💔 Out of guesses! The number was ${Utils.formatNumber(GameState.secretNumber)}`,
        'error'
      );
      setTimeout(() => this.startLevel(), 3000);
    }
  },
  
  togglePause() {
    if (!GameState.gameActive) return;
    
    GameState.isPaused = !GameState.isPaused;
    
    // Track pause time for accurate level timing
    if (GameState.isPaused) {
      GameState.pauseStartTime = performance.now();
    } else if (GameState.pauseStartTime) {
      GameState.totalPausedTime += performance.now() - GameState.pauseStartTime;
      GameState.pauseStartTime = null;
    }
    
    if (DOM.pauseBtn) {
      DOM.pauseBtn.textContent = GameState.isPaused ? '▶ Resume' : '⏸ Pause';
    }
    
    if (DOM.guessInput) {
      DOM.guessInput.disabled = GameState.isPaused;
    }
    
    // Disable hint button when paused
    if (DOM.hintBtn) {
      DOM.hintBtn.disabled = GameState.isPaused;
    }
    
    Haptics.light();
  },
  
  restart() {
    this.start();
  },
  
  // UI Update Methods
  updateLevelBadge() {
    if (DOM.levelBadge) {
      DOM.levelBadge.textContent = GameState.currentLevel;
      DOM.levelBadge.classList.add('animate-pop-in');
      setTimeout(() => DOM.levelBadge.classList.remove('animate-pop-in'), 500);
    }
  },
  
  updateLevelInfo() {
    if (DOM.levelInfo) {
      DOM.levelInfo.innerHTML = `
        <strong>Level ${GameState.currentLevel}</strong>
        <br>
        <span class="text-muted">Guess 1-${Utils.formatNumber(GameState.maxNumber)} • ${GameState.guessLimit} tries</span>
      `;
    }
  },
  
  updateProgress() {
    const totalLevels = GameConfig.maxLevel - GameState.startLevel + 1;
    const completed = Math.max(0, Math.min(GameState.currentLevel - GameState.startLevel, totalLevels));
    const progress = totalLevels === 0 ? 100 : (completed / totalLevels) * 100;
    
    if (DOM.progressFill) {
      DOM.progressFill.style.width = `${Math.round(progress)}%`;
    }
  },
  
  updateRangeVisualizer() {
    if (!DOM.rangeActive) return;
    
    const totalRange = GameState.maxNumber;
    const leftPercent = ((GameState.minRange - 1) / totalRange) * 100;
    const widthPercent = ((GameState.maxRange - GameState.minRange + 1) / totalRange) * 100;
    
    DOM.rangeActive.style.left = `${leftPercent}%`;
    DOM.rangeActive.style.width = `${widthPercent}%`;
    
    if (DOM.rangeMin) DOM.rangeMin.textContent = Utils.formatNumber(GameState.minRange);
    if (DOM.rangeMax) DOM.rangeMax.textContent = Utils.formatNumber(GameState.maxRange);
  },
  
  updateStats() {
    if (!DOM.statsGrid) return;
    
    const avg = GameState.levelGuesses.length > 0 
      ? (GameState.totalGuesses / GameState.levelGuesses.length).toFixed(1) 
      : 0;
    
    const guessesLeft = GameState.guessLimit - GameState.guessesTaken;
    
    DOM.statsGrid.innerHTML = `
      <div class="stat-item">
        <span class="stat-value">${guessesLeft}</span>
        <span class="stat-label">Remaining</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${GameState.levelGuesses.length}</span>
        <span class="stat-label">Levels</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${avg}</span>
        <span class="stat-label">Avg/Level</span>
      </div>
    `;
  },
  
  updateJourney() {
    if (!DOM.journeyTrack) return;
    
    let html = '';
    for (let i = 1; i <= GameConfig.maxLevel; i++) {
      let className = 'journey-node';
      if (i < GameState.currentLevel) {
        className += ' journey-node--completed';
      } else if (i === GameState.currentLevel) {
        className += ' journey-node--current';
      } else {
        className += ' journey-node--locked';
      }
      
      html += `<div class="${className}">${i < GameState.currentLevel ? '✓' : i}</div>`;
    }
    DOM.journeyTrack.innerHTML = html;
    
    // Scroll to current level
    const currentNode = DOM.journeyTrack.querySelector('.journey-node--current');
    if (currentNode) {
      currentNode.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  },
  
  showMessage(text, type = 'info') {
    if (!DOM.message) return;
    
    // Remove all message type classes
    DOM.message.className = 'message animate-fade-in-up';
    
    // Map temperatures to message types
    const typeMap = {
      'burning': 'message--hot',
      'hot': 'message--hot',
      'warm': 'message--warm',
      'cool': 'message--cool',
      'cold': 'message--cold',
      'freezing': 'message--freezing',
      'success': 'message--success',
      'error': 'message--error',
      'info': 'message--info',
      'warning': 'message--warning'
    };
    
    const className = typeMap[type] || 'message--info';
    DOM.message.classList.add(className);
    DOM.message.innerHTML = text;
  },
  
  clearMessage() {
    if (DOM.message) {
      DOM.message.className = 'message';
      DOM.message.innerHTML = '';
    }
  },
  
  saveScore(level, guesses, time) {
    const entry = {
      name: GameState.playerName,
      levelCompleted: level,
      guesses: guesses,
      timeSpentSeconds: time,
      startLevel: GameState.startLevel,
      date: new Date().toISOString()
    };
    
    Storage.saveScore(entry);
    Leaderboard.update();
    
    // Post to server if configured
    if (window.CF_LEADERBOARD_API) {
      Leaderboard.postToServer(entry);
    }
  }
};

// ==========================================================================
// 10. LEADERBOARD
// ==========================================================================

const Leaderboard = {
  currentSort: { field: 'guesses', order: 'asc' },
  perPage: 10,
  currentPage: 1,
  mode: 'local',
  externalScores: null,
  
  show() {
    if (DOM.leaderboardModal) {
      DOM.leaderboardModal.classList.add('is-open');
      this.update();
    }
  },
  
  hide() {
    if (DOM.leaderboardModal) {
      DOM.leaderboardModal.classList.remove('is-open');
    }
  },
  
  toggle() {
    if (DOM.leaderboardModal?.classList.contains('is-open')) {
      this.hide();
    } else {
      this.show();
    }
  },
  
  update() {
    const scores = this.mode === 'global' && this.externalScores 
      ? this.externalScores.slice() 
      : Storage.getScores().slice();
    
    // Sort
    const { field, order } = this.currentSort;
    scores.sort((a, b) => {
      let va = field === 'name' ? (a.name || '').toLowerCase() : (a[field] || 0);
      let vb = field === 'name' ? (b.name || '').toLowerCase() : (b[field] || 0);
      if (field === 'time') { va = a.timeSpentSeconds || 0; vb = b.timeSpentSeconds || 0; }
      if (va < vb) return order === 'asc' ? -1 : 1;
      if (va > vb) return order === 'asc' ? 1 : -1;
      return 0;
    });
    
    // Pagination
    const total = scores.length;
    const pages = Math.max(1, Math.ceil(total / this.perPage));
    if (this.currentPage > pages) this.currentPage = pages;
    
    const startIdx = (this.currentPage - 1) * this.perPage;
    const pageItems = scores.slice(startIdx, startIdx + this.perPage);
    
    this.render(pageItems, startIdx);
    this.updatePagination(pages);
  },
  
  render(items, offset) {
    const tbody = document.getElementById('leaderboard-table-body');
    if (!tbody) return;
    
    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No scores yet</td></tr>`;
      return;
    }
    
    const playerName = GameState.playerName;
    
    tbody.innerHTML = items.map((s, i) => {
      const isCurrentUser = s.name === playerName;
      return `
        <tr class="${isCurrentUser ? 'is-current-user' : ''}">
          <td class="rank">${offset + i + 1}</td>
          <td>${Utils.escapeHtml(s.name)}</td>
          <td>Level ${s.levelCompleted}</td>
          <td>${s.guesses}g</td>
          <td>${s.timeSpentSeconds || 0}s</td>
          <td>${new Date(s.date).toLocaleDateString()}</td>
        </tr>
      `;
    }).join('');
  },
  
  updatePagination(pages) {
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (pageInfo) pageInfo.textContent = `Page ${this.currentPage} / ${pages}`;
    if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = this.currentPage >= pages;
  },
  
  setPage(page) {
    this.currentPage = Math.max(1, page);
    this.update();
  },
  
  setSort(field) {
    if (this.currentSort.field === field) {
      this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort = { field, order: 'asc' };
    }
    this.currentPage = 1;
    this.update();
  },
  
  async fetchGlobal() {
    if (!window.CF_LEADERBOARD_API) return;
    
    try {
      const resp = await fetch(window.CF_LEADERBOARD_API + '/scores');
      if (!resp.ok) throw new Error('Failed to fetch');
      this.externalScores = await resp.json();
      this.mode = 'global';
      this.currentPage = 1;
      this.update();
    } catch (err) {
      console.error('Failed to fetch global leaderboard:', err);
    }
  },
  
  showLocal() {
    this.mode = 'local';
    this.currentPage = 1;
    this.update();
  },
  
  async postToServer(entry) {
    if (!window.CF_LEADERBOARD_API) return;
    
    try {
      await fetch(window.CF_LEADERBOARD_API + '/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (err) {
      console.error('Failed to post score:', err);
    }
  },
  
  reset() {
    if (!confirm('Reset all saved scores?')) return;
    Storage.clearScores();
    this.update();
    Haptics.medium();
  }
};

// ==========================================================================
// 11. SHARE MANAGER
// ==========================================================================

const ShareManager = {
  canvas: null,
  ctx: null,
  logoImage: null,
  
  init() {
    // Create hidden canvas for share image generation
    this.canvas = document.createElement('canvas');
    this.canvas.width = 600;
    this.canvas.height = 400;
    this.ctx = this.canvas.getContext('2d');
    
    // Preload logo
    this.logoImage = new Image();
    this.logoImage.src = 'images/logo.png';
  },
  
  calculateStars(guesses, guessLimit) {
    const efficiency = 1 - (guesses / guessLimit);
    if (efficiency >= 0.8) return 5;
    if (efficiency >= 0.6) return 4;
    if (efficiency >= 0.4) return 3;
    if (efficiency >= 0.2) return 2;
    return 1;
  },
  
  async generateShareImage(stats) {
    const { level, guesses, time, playerName, stars } = stats;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#1a0533');
    gradient.addColorStop(0.5, '#0d0015');
    gradient.addColorStop(1, '#1a0533');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    // Add subtle pattern overlay
    ctx.fillStyle = 'rgba(139, 92, 246, 0.05)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 100 + 50, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Logo (if loaded)
    if (this.logoImage.complete && this.logoImage.naturalWidth > 0) {
      const logoSize = 80;
      ctx.drawImage(this.logoImage, (w - logoSize) / 2, 20, logoSize, logoSize);
    }
    
    // Title
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 28px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KING GUESSER', w / 2, 130);
    
    // Level badge
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 60, 145, 120, 40, 10);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Outfit, sans-serif';
    ctx.fillText(`Level ${level}`, w / 2, 172);
    
    // Stars
    const starY = 210;
    const starSize = 30;
    const starGap = 35;
    const startX = w / 2 - ((stars - 1) * starGap) / 2;
    ctx.font = `${starSize}px sans-serif`;
    for (let i = 0; i < 5; i++) {
      ctx.fillText(i < stars ? '⭐' : '☆', startX + i * starGap - starSize / 2, starY);
    }
    
    // Stats row
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(30, 235, w - 60, 60, 10);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(`🎯 ${guesses} guesses`, w / 4, 270);
    ctx.fillText(`⏱️ ${time}s`, w / 2, 270);
    ctx.fillText(`🏆 ${Math.round((1 - guesses / 100) * 100)}%`, (w * 3) / 4, 270);
    
    // Player name
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '18px Inter, sans-serif';
    ctx.fillText(`Played by: ${Utils.sanitizeName(playerName)}`, w / 2, 330);
    
    // CTA
    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('Can you beat my score? 👑', w / 2, 370);
    
    return this.canvas.toDataURL('image/png');
  },
  
  async shareNative(stats) {
    const imageDataUrl = await this.generateShareImage(stats);
    const blob = await (await fetch(imageDataUrl)).blob();
    const file = new File([blob], 'king-guesser-score.png', { type: 'image/png' });
    
    const shareData = {
      title: 'King Guesser Score',
      text: `🎮 I just beat Level ${stats.level} in King Guesser with ${stats.guesses} guesses! Can you beat my score? 👑`,
      files: [file]
    };
    
    if (navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
    return false;
  },
  
  shareToWhatsApp(stats) {
    const text = encodeURIComponent(
      `🎮 King Guesser 👑\n\n` +
      `I just beat Level ${stats.level}!\n` +
      `⭐ ${stats.stars} stars\n` +
      `🎯 ${stats.guesses} guesses\n` +
      `⏱️ ${stats.time}s\n\n` +
      `Can you beat my score?\n` +
      `Play now: ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  },
  
  shareToTwitter(stats) {
    const text = encodeURIComponent(
      `🎮 I just beat Level ${stats.level} in King Guesser with ${stats.guesses} guesses! ⭐${stats.stars} Can you beat my score? 👑`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  },
  
  async copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      return true;
    } catch {
      return false;
    }
  },
  
  async downloadImage(stats) {
    const imageDataUrl = await this.generateShareImage(stats);
    const link = document.createElement('a');
    link.download = `king-guesser-level-${stats.level}.png`;
    link.href = imageDataUrl;
    link.click();
  }
};

// ==========================================================================
// 12. VICTORY MODAL
// ==========================================================================

const VictoryModal = {
  isOpen: false,
  currentStats: null,
  
  show(stats) {
    this.currentStats = stats;
    this.isOpen = true;
    
    const modal = document.getElementById('victory-modal');
    if (!modal) return;
    
    // Calculate stars
    const stars = ShareManager.calculateStars(stats.guesses, stats.guessLimit);
    stats.stars = stars;
    
    // Update modal content
    const levelEl = modal.querySelector('.victory-level');
    const starsEl = modal.querySelector('.victory-stars');
    const guessesEl = modal.querySelector('.victory-guesses');
    const timeEl = modal.querySelector('.victory-time');
    const accuracyEl = modal.querySelector('.victory-accuracy');
    const titleEl = modal.querySelector('.victory-title');
    
    if (levelEl) levelEl.textContent = stats.level;
    if (starsEl) starsEl.innerHTML = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
    if (guessesEl) guessesEl.textContent = stats.guesses;
    if (timeEl) timeEl.textContent = `${stats.time}s`;
    if (accuracyEl) {
      const accuracy = Math.round((1 - stats.guesses / stats.guessLimit) * 100);
      accuracyEl.textContent = `${Math.max(0, accuracy)}%`;
    }
    
    // Update title based on if champion
    if (titleEl) {
      titleEl.textContent = stats.isChampion ? '🏆 CHAMPION!' : '🎉 Level Complete!';
    }
    
    // Show modal with animation
    modal.classList.add('is-open');
    modal.classList.add('animate-zoom-in');
    
    Haptics.success();
  },
  
  hide() {
    this.isOpen = false;
    const modal = document.getElementById('victory-modal');
    if (modal) {
      modal.classList.remove('is-open');
      modal.classList.remove('animate-zoom-in');
    }
  },
  
  async shareNative() {
    if (this.currentStats) {
      const success = await ShareManager.shareNative(this.currentStats);
      if (!success) {
        // Fallback to WhatsApp
        ShareManager.shareToWhatsApp(this.currentStats);
      }
    }
  },
  
  shareWhatsApp() {
    if (this.currentStats) {
      ShareManager.shareToWhatsApp(this.currentStats);
    }
  },
  
  shareTwitter() {
    if (this.currentStats) {
      ShareManager.shareToTwitter(this.currentStats);
    }
  },
  
  async downloadImage() {
    if (this.currentStats) {
      await ShareManager.downloadImage(this.currentStats);
    }
  },
  
  continueGame() {
    this.hide();
    if (this.currentStats?.isChampion) {
      Game.restart();
    } else {
      Game.startLevel();
    }
  }
};

// ==========================================================================
// 13. PWA INSTALLER
// ==========================================================================

const PWAInstaller = {
  deferredPrompt: null,
  
  init() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });
    
    window.addEventListener('appinstalled', () => {
      this.hideInstallPrompt();
      this.deferredPrompt = null;
    });
  },
  
  showInstallPrompt() {
    if (DOM.installPrompt) {
      DOM.installPrompt.hidden = false;
      DOM.installPrompt.classList.add('animate-slide-in-up');
    }
  },
  
  hideInstallPrompt() {
    if (DOM.installPrompt) {
      DOM.installPrompt.hidden = true;
    }
  },
  
  async install() {
    if (!this.deferredPrompt) return;
    
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      Haptics.success();
    }
    
    this.deferredPrompt = null;
    this.hideInstallPrompt();
  },
  
  dismiss() {
    this.hideInstallPrompt();
  }
};

// ==========================================================================
// 12. SETTINGS
// ==========================================================================

const Settings = {
  show() {
    if (DOM.settingsModal) {
      DOM.settingsModal.classList.add('is-open');
    }
  },
  
  hide() {
    if (DOM.settingsModal) {
      DOM.settingsModal.classList.remove('is-open');
    }
  },
  
  toggle() {
    if (DOM.settingsModal?.classList.contains('is-open')) {
      this.hide();
    } else {
      this.show();
    }
  }
};

// ==========================================================================
// 13. EVENT LISTENERS
// ==========================================================================

function setupEventListeners() {
  // Game controls
  DOM.startBtn?.addEventListener('click', () => Game.start());
  DOM.pauseBtn?.addEventListener('click', () => Game.togglePause());
  DOM.restartBtn?.addEventListener('click', () => Game.restart());
  DOM.submitBtn?.addEventListener('click', () => Game.submitGuess());
  DOM.hintBtn?.addEventListener('click', () => Game.giveHint());
  
  // Guess input
  DOM.guessInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') Game.submitGuess();
  });
  
  // Player name
  DOM.playerName?.addEventListener('input', (e) => {
    const name = e.target.value.trim() || 'Player';
    GameState.playerName = name;
    Storage.setPlayerName(name);
  });
  
  // Leaderboard
  DOM.leaderboardBtn?.addEventListener('click', () => Leaderboard.toggle());
  
  // Settings
  DOM.settingsBtn?.addEventListener('click', () => Settings.toggle());
  
  // Modal close on backdrop click
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('is-open');
      }
    });
  });
  
  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay')?.classList.remove('is-open');
    });
  });
  
  // Install prompt
  document.getElementById('install-btn')?.addEventListener('click', () => PWAInstaller.install());
  document.getElementById('install-dismiss')?.addEventListener('click', () => PWAInstaller.dismiss());
  
  // Leaderboard controls
  document.getElementById('prev-page')?.addEventListener('click', () => Leaderboard.setPage(Leaderboard.currentPage - 1));
  document.getElementById('next-page')?.addEventListener('click', () => Leaderboard.setPage(Leaderboard.currentPage + 1));
  document.getElementById('tab-local')?.addEventListener('click', () => Leaderboard.showLocal());
  document.getElementById('tab-global')?.addEventListener('click', () => Leaderboard.fetchGlobal());
  document.getElementById('reset-scores-btn')?.addEventListener('click', () => Leaderboard.reset());
  
  // Settings toggles
  document.getElementById('sound-toggle')?.addEventListener('change', (e) => {
    Audio.setEnabled(e.target.checked);
    if (e.target.checked) Audio.playClick();
  });
  
  document.getElementById('confetti-toggle')?.addEventListener('change', (e) => {
    Confetti.setEnabled(e.target.checked);
  });
  
  document.getElementById('sound-volume')?.addEventListener('input', (e) => {
    Audio.setVolume(parseFloat(e.target.value));
  });
  
  // Bottom nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      Haptics.selection();
    });
  });
  
  // Victory modal share buttons
  document.getElementById('share-whatsapp')?.addEventListener('click', () => {
    VictoryModal.shareWhatsApp();
    Haptics.light();
  });
  
  document.getElementById('share-twitter')?.addEventListener('click', () => {
    VictoryModal.shareTwitter();
    Haptics.light();
  });
  
  document.getElementById('share-download')?.addEventListener('click', () => {
    VictoryModal.downloadImage();
    Haptics.medium();
  });
  
  document.getElementById('victory-continue')?.addEventListener('click', () => {
    VictoryModal.continueGame();
    Haptics.medium();
  });
}

// ==========================================================================
// 14. INITIALIZATION
// ==========================================================================

function initializeDOM() {
  DOM.playerName = document.getElementById('player-name');
  DOM.startLevelSelect = document.getElementById('start-level');
  DOM.leaderboardBtn = document.getElementById('leaderboard-btn');
  DOM.settingsBtn = document.getElementById('settings-btn');
  
  DOM.levelBadge = document.getElementById('level-badge');
  DOM.levelInfo = document.getElementById('level-info');
  DOM.progressFill = document.getElementById('progress-fill');
  DOM.rangeActive = document.getElementById('range-active');
  DOM.rangeMin = document.getElementById('range-min');
  DOM.rangeMax = document.getElementById('range-max');
  DOM.guessInput = document.getElementById('guess-input');
  DOM.submitBtn = document.getElementById('submit-btn');
  DOM.hintBtn = document.getElementById('hint-btn');
  DOM.message = document.getElementById('message');
  DOM.statsGrid = document.getElementById('stats-grid');
  DOM.journeyTrack = document.getElementById('journey-track');
  
  DOM.startBtn = document.getElementById('start-btn');
  DOM.pauseBtn = document.getElementById('pause-btn');
  DOM.restartBtn = document.getElementById('restart-btn');
  
  DOM.leaderboardModal = document.getElementById('leaderboard-modal');
  DOM.settingsModal = document.getElementById('settings-modal');
  
  DOM.celebrationOverlay = document.getElementById('celebration-overlay');
  DOM.confettiCanvas = document.getElementById('confetti-canvas');
  
  DOM.bottomNav = document.getElementById('bottom-nav');
  DOM.installPrompt = document.getElementById('install-prompt');
}

function initializeLevelSelect() {
  if (!DOM.startLevelSelect) return;
  
  DOM.startLevelSelect.innerHTML = '';
  for (let i = 1; i <= GameConfig.maxLevel; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.text = `Level ${i}`;
    DOM.startLevelSelect.appendChild(opt);
  }
}

function restoreSettings() {
  // Player name
  const savedName = Storage.getPlayerName();
  if (DOM.playerName) DOM.playerName.value = savedName;
  GameState.playerName = savedName;
  
  // Sound settings
  const soundToggle = document.getElementById('sound-toggle');
  const soundVolume = document.getElementById('sound-volume');
  if (soundToggle) soundToggle.checked = Storage.getSetting('soundEnabled', true);
  if (soundVolume) soundVolume.value = Storage.getSetting('soundVolume', 0.9);
  
  // Confetti settings
  const confettiToggle = document.getElementById('confetti-toggle');
  if (confettiToggle) confettiToggle.checked = Storage.getSetting('confettiEnabled', true);
  
  // API URL
  const savedApiUrl = localStorage.getItem(Storage.keys.apiUrl);
  if (savedApiUrl) {
    window.CF_LEADERBOARD_API = savedApiUrl;
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.log('Service Worker registration failed:', err);
      });
  }
}

function init() {
  console.log('🎮 King Guesser - Initializing...');
  
  initializeDOM();
  initializeLevelSelect();
  restoreSettings();
  setupEventListeners();
  
  Audio.init();
  Confetti.init();
  ShareManager.init();
  PWAInstaller.init();
  
  Game.updateJourney();
  Leaderboard.update();
  
  registerServiceWorker();
  
  console.log('🎮 King Guesser - Ready!');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Expose for global access (leaderboard API, etc.)
window.Game = Game;
window.Leaderboard = Leaderboard;
window.Settings = Settings;
window.PWAInstaller = PWAInstaller;
window.VictoryModal = VictoryModal;
window.ShareManager = ShareManager;

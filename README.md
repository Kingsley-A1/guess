# 👑 King Guesser - Master of Numbers

A **jaw-dropping, mobile-first Progressive Web App** featuring a progressive difficulty number guessing game with premium design, stunning animations, and crisp functionality.

![King Guesser Banner](images/og-image.png)

## ✨ Features

### 🎮 Gameplay

- **20 Progressive Levels** - From 1-10 to 1-100,000,000
- **Hot/Cold Feedback** - Visual temperature indicators show how close your guess is
- **Smart Hints** - Narrow down the range (costs 1 guess)
- **Level Journey Map** - Visual progress through all 20 levels
- **Personal Best Tracking** - Track your fastest times and fewest guesses

### 🎨 Premium Design

- **Glassmorphism UI** - Modern frosted glass aesthetic
- **Vibrant Gradients** - Deep purple to electric blue color scheme
- **Gold Accents** - Premium touches throughout
- **Premium Typography** - Outfit + Inter Google Fonts

### ✨ Animations

- **60+ Reusable Animations** - Entrance, exit, attention seekers, and more
- **Hot/Cold Visual Effects** - Glowing feedback based on proximity
- **Celebration Confetti** - Canvas-based particle system
- **Micro-interactions** - Button presses, transitions, pulses

### 📱 Mobile-First

- **Bottom Navigation** - Thumb-friendly action bar
- **Touch Optimized** - 48px minimum touch targets
- **Haptic Feedback** - Vibration on mobile devices
- **Safe Area Support** - Works on notched devices

### 🚀 PWA Capabilities

- **Installable** - Add to home screen on iOS/Android
- **Offline Support** - Service worker caching
- **Fast Loading** - Cache-first strategy
- **Background Sync** - Scores sync when online

## 🛠️ Tech Stack

- **HTML5** - Semantic, accessible markup
- **CSS3** - Custom properties, glassmorphism, animations
- **Vanilla JavaScript** - No dependencies, modular architecture
- **Service Worker** - Offline capability
- **Web Audio API** - Synthesized sound effects
- **Canvas API** - Confetti particle system

## 📁 File Structure

```
GAMES/
├── index.html          # Main PWA entry point
├── style.css           # Premium design system
├── animations.css      # 60+ reusable animations
├── app.js              # Modular game application
├── sw.js               # Service worker
├── manifest.json       # PWA manifest
├── icons/
│   ├── icon-512.png    # Main app icon
│   ├── icon-192.png    # PWA icon
│   ├── icon-maskable.png
│   └── apple-touch-icon.png
├── images/
│   └── og-image.png    # Social share image
├── cloudflare-worker.js # Optional global leaderboard
├── wrangler.toml       # Cloudflare config
└── README.md           # This file
```

## 🎯 How to Play

1. **Open the app** - Works in any modern browser
2. **Enter your name** - Your scores will be saved
3. **Choose a start level** - Begin from any unlocked level
4. **Click Start Game** - Begin your journey!
5. **Guess the number** - Enter a number and click Submit
6. **Watch the feedback** - Colors indicate hot (close) or cold (far)
7. **Use hints wisely** - They narrow the range but cost a guess
8. **Beat all 20 levels** - Become a champion!

## 🌡️ Hot/Cold System

| Temperature | Distance | Visual Effect    |
| ----------- | -------- | ---------------- |
| 🔥 Burning  | < 1%     | Intense red glow |
| 🌡️ Hot      | < 5%     | Red pulsing      |
| ☀️ Warm     | < 15%    | Orange glow      |
| ❄️ Cool     | < 30%    | Blue tint        |
| 🥶 Cold     | < 50%    | Cyan pulse       |
| 🧊 Freezing | > 50%    | Ice blue glow    |

## ⚙️ Settings

- **Sound Effects** - Toggle celebration sounds on/off
- **Volume Control** - Adjust audio level
- **Confetti** - Toggle confetti celebrations

## 📊 Leaderboard

- **Local Scores** - Saved in browser storage (up to 200 entries)
- **Global Scores** - Optional Cloudflare R2 backend
- **Sortable Columns** - Sort by player, level, guesses, time
- **Pagination** - Navigate through large score lists

## 🌐 Global Leaderboard Setup (Optional)

1. Create a Cloudflare account
2. Create an R2 bucket named `king-guesser-leaderboard-bucket`
3. Deploy the worker:
   ```bash
   npx wrangler deploy
   ```
4. Set `window.CF_LEADERBOARD_API` to your worker URL

## 🚀 Development

```bash
# Serve locally (any static server works)
npx serve .

# Or use Live Server in VS Code
# Or simply open index.html in a browser
```

## 📱 PWA Installation

### iOS

1. Open in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

### Android

1. Open in Chrome
2. Tap the install prompt or menu > Install app

## 🎨 Design System

### Colors

```css
--color-primary-500: #8b5cf6; /* Purple */
--color-accent-500: #ec4899; /* Pink */
--color-success-500: #10b981; /* Green */
--color-danger-500: #ef4444; /* Red */
--color-warning-500: #f59e0b; /* Amber */
```

### Glass Effect

```css
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.08);
```

## 📄 License

MIT License - Feel free to use and modify!

---

**Made with 💜 by Kingsley**

Enjoy King Guesser! 👑

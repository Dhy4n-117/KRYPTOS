# 🔐 KRYPTOS — Ultimate Cryptanalysis Suite

<div align="center">

![KRYPTOS Banner](https://img.shields.io/badge/KRYPTOS-Cryptanalysis_Suite-7b2ff7?style=for-the-badge&labelColor=0a0a0f)
![Version](https://img.shields.io/badge/version-2.0-00f0ff?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-00ff88?style=flat-square)
![JavaScript](https://img.shields.io/badge/Pure-JavaScript-f7df1e?style=flat-square&logo=javascript)

**A professional-grade, client-side cryptanalysis platform built with pure vanilla JavaScript.**

</div>

---

## ⚡ Features

### 🔐 Cipher Engine — 25+ Algorithms
| Category | Ciphers |
|----------|---------|
| **Classic** | Caesar, ROT13, Atbash, Vigenère, Playfair, Rail Fence, Columnar, Affine, Beaufort, Substitution |
| **Encoding** | Base64, Base32, Hex, Binary, Octal, Decimal, URL, HTML Entity, Unicode Escape, Morse Code |
| **Modern** | XOR, ROT47 |
| **Esoteric** | A1Z26, Reverse, Bacon, Polybius, Tap Code, Pigpen, NATO Phonetic |

### 📊 Cryptanalysis Suite
- **Frequency Analysis** — Interactive bar chart with entropy calculation
- **Auto-Detection** — Identifies 10+ encoding/cipher types with confidence scoring
- **Index of Coincidence** — Polyalphabetic vs monoalphabetic classification
- **Kasiski Examination** — Automated key length estimation for Vigenère ciphers
- **Text Statistics** — Character composition, entropy, and structure analysis
- **Hash Identification** — Recognizes MD5, SHA-1, SHA-256, SHA-384, SHA-512 fingerprints

### 💥 Universal Brute-Force Engine
- **Non-blocking async execution** with real-time progress tracking
- **Caesar**: Exhaustive 26-shift search
- **Affine**: Full 312-pair (a,b) keyspace attack
- **Vigenère / Beaufort / Columnar / XOR**: 50+ word dictionary attack
- **Rail Fence**: Rails 2–10 depth sweep
- **Substitution / Playfair**: Heuristic key alphabet generation
- **English plausibility scoring** with confidence-graded result cards
- **"Use This" workflow** — Load any result directly into the Cipher workbench

### 🔑 Hashing Module
- **Algorithms**: MD5, SHA-1, SHA-256, SHA-384, SHA-512, CRC-32
- **Hash Comparison** — Instant match/no-match verification
- **One-click copy** for each generated hash

### 🎨 Interface
- Dark cyberpunk aesthetic with glassmorphism
- Matrix rain background animation
- Ambient floating particles
- Smooth micro-animations and transitions
- Fully responsive design
- Toast notification system
- Persistent operation history with localStorage

---

## 🚀 Getting Started

### Prerequisites
Any modern web browser (Chrome, Firefox, Edge, Safari).  
No Node.js, npm, or build tools required.

### Run Locally

```bash
# Clone the repository
git clone https://github.com/Dhy4n-117/KRYPTOS.git
cd KRYPTOS

# Start a local server (choose one)
python -m http.server 8080          # Python
npx serve .                         # Node.js
# Or use VS Code Live Server extension
```

Open **http://localhost:8080** in your browser.

---

## 📁 Project Structure

```
KRYPTOS/
├── index.html        # Main application markup
├── styles.css        # Complete styling with CSS variables
├── app.js            # Application logic & event handling
├── ciphers.js        # CipherEngine — 25+ cipher implementations
├── analysis.js       # AnalysisEngine — cryptanalysis tools
├── hashing.js        # HashEngine — MD5, SHA, CRC-32
├── bruteforce.js     # BruteForceEngine — automated attacks
└── README.md         # This file
```

---

## 🛠 Architecture

- **Zero dependencies** — Pure vanilla HTML/CSS/JavaScript
- **Global script architecture** — `CipherEngine`, `AnalysisEngine`, `HashEngine`, `BruteForceEngine`
- **Client-side only** — All processing happens in the browser; no data leaves your machine
- **localStorage persistence** — Operation history survives page reloads
- **Non-blocking brute force** — `setTimeout`-based batching prevents UI freezing

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Process current cipher |

---

## 🔒 Security Note

KRYPTOS runs **entirely client-side**. No data is transmitted to any server. Your ciphertext, keys, and analysis results never leave your browser. This makes it inherently safe for analyzing sensitive or classified material.

---

## 📜 License

This project is open source under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Dhy4n-117">Dhy4n-117</a></sub>
</div>

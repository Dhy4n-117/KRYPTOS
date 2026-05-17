// ===== KRYPTOS — Universal Brute Force Engine =====
const BruteForceEngine = {
  DICTIONARY: ['THE','KEY','SECRET','CIPHER','CODE','ALPHA','BETA','GAMMA','DELTA','OMEGA','PASS','WORD','CRYPTO','HACK','FLAG','ADMIN','LOGIN','TEST','HELLO','WORLD','PYTHON','JAVA','LINUX','KERNEL','SIGMA','THETA','ZETA','KAPPA','LAMBDA','MATRIX','SHADOW','GHOST','BLADE','STORM','FIRE','ZERO','ONE','TWO','ACE','KING','QUEEN','JACK','DARK','LIGHT','MOON','SUN','STAR','NOVA','PULSE','ROGUE'],
  SUB_KEYS: ['ZYXWVUTSRQPONMLKJIHGFEDCBA','QWERTYUIOPASDFGHJKLZXCVBNM','AZBYCXDWEVFUGTHSIRJQKPLOMN','MNBVCXZLKJHGFDSAPOIUYTREWQ','PHQGIUMEAYLNOFDXJKRCVSTZWB'],
  AFFINE_A: [1,3,5,7,9,11,15,17,19,21,23,25],

  _delay() { return new Promise(r => setTimeout(r, 0)); },

  _isPrintable(text) {
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code < 32 || code > 126) {
        if (code !== 10 && code !== 13 && code !== 9) return false;
      }
    }
    return text.length > 0;
  },

  _hasEnglishWord(text) {
    const upper = text.toUpperCase();
    for (const word of AnalysisEngine.commonWords) {
      if (upper.includes(word)) return true;
    }
    return false;
  },

  _passesFilter(decrypted, score) {
    return score > -30 && this._hasEnglishWord(decrypted);
  },

  _getAlgoName(algoId) {
    for (const cat of Object.values(CipherEngine.algorithms)) {
      const found = cat.find(a => a.id === algoId);
      if (found) return found.name;
    }
    return algoId;
  },

  _getCategory(algoId) {
    for (const [cat, algos] of Object.entries(CipherEngine.algorithms)) {
      if (algos.find(a => a.id === algoId)) return cat;
    }
    return 'unknown';
  },

  async runAll(text, categoryFilter, progressCallback) {
    const results = [];
    const allTasks = [];

    // Build task list from all categories
    for (const [cat, algos] of Object.entries(CipherEngine.algorithms)) {
      if (!categoryFilter[cat]) continue;
      for (const algo of algos) {
        allTasks.push({ algoId: algo.id, algoName: algo.name, category: cat });
      }
    }

    const totalTasks = allTasks.length;
    let completed = 0;

    for (const task of allTasks) {
      const { algoId, algoName, category } = task;
      progressCallback(Math.round((completed / totalTasks) * 100), algoName);

      try {
        const taskResults = this._attackCipher(text, algoId, algoName, category);
        for (const r of taskResults) {
          if (this._passesFilter(r.decrypted, r.score)) {
            results.push(r);
          }
        }
      } catch (e) { /* skip broken ciphers */ }

      completed++;
      // Yield to UI every cipher
      await this._delay();
    }

    progressCallback(100, 'Complete');
    return results;
  },

  _attackCipher(text, algoId, algoName, category) {
    const results = [];

    switch (algoId) {
      // === CAESAR: all 26 shifts ===
      case 'caesar': {
        for (let shift = 0; shift < 26; shift++) {
          const dec = CipherEngine.caesar(text, shift, false);
          const score = AnalysisEngine.scoreEnglish(dec);
          results.push({ algoId, algoName, key: `shift ${shift}`, decrypted: dec, score, category });
        }
        break;
      }

      // === KEYLESS ciphers ===
      case 'rot13': case 'atbash': case 'rot47': case 'reverse': {
        const dec = CipherEngine.process(algoId, text, '', false);
        const score = AnalysisEngine.scoreEnglish(dec);
        results.push({ algoId, algoName, key: 'keyless', decrypted: dec, score, category });
        break;
      }

      // === KEYLESS esoteric (decode only) ===
      case 'bacon': case 'polybius': case 'tap': case 'pigpen': case 'nato': {
        try {
          const dec = CipherEngine.process(algoId, text, '', false);
          if (this._isPrintable(dec)) {
            const score = AnalysisEngine.scoreEnglish(dec);
            results.push({ algoId, algoName, key: 'keyless', decrypted: dec, score, category });
          }
        } catch (e) {}
        break;
      }

      // === ENCODING: single decode attempt ===
      case 'base64': case 'base32': case 'hex': case 'binary':
      case 'octal': case 'decimal': case 'url': case 'html':
      case 'unicode': case 'morse': case 'a1z26': {
        try {
          const dec = CipherEngine.process(algoId, text, '', false);
          if (this._isPrintable(dec)) {
            const score = AnalysisEngine.scoreEnglish(dec);
            results.push({ algoId, algoName, key: 'keyless', decrypted: dec, score, category });
          }
        } catch (e) {}
        break;
      }

      // === VIGENERE: dictionary attack, keep top 5 ===
      case 'vigenere': {
        const candidates = [];
        for (const key of this.DICTIONARY) {
          try {
            const dec = CipherEngine.process('vigenere', text, key, false);
            const score = AnalysisEngine.scoreEnglish(dec);
            candidates.push({ algoId, algoName, key: `key: ${key}`, decrypted: dec, score, category });
          } catch (e) {}
        }
        candidates.sort((a, b) => b.score - a.score);
        results.push(...candidates.slice(0, 5));
        break;
      }

      // === BEAUFORT: dictionary attack, keep top 5 ===
      case 'beaufort': {
        const candidates = [];
        for (const key of this.DICTIONARY) {
          try {
            const dec = CipherEngine.process('beaufort', text, key, false);
            const score = AnalysisEngine.scoreEnglish(dec);
            candidates.push({ algoId, algoName, key: `key: ${key}`, decrypted: dec, score, category });
          } catch (e) {}
        }
        candidates.sort((a, b) => b.score - a.score);
        results.push(...candidates.slice(0, 5));
        break;
      }

      // === COLUMNAR: dictionary attack, keep top 5 ===
      case 'columnar': {
        const candidates = [];
        for (const key of this.DICTIONARY) {
          try {
            const dec = CipherEngine.process('columnar', text, key, false);
            const score = AnalysisEngine.scoreEnglish(dec);
            candidates.push({ algoId, algoName, key: `key: ${key}`, decrypted: dec, score, category });
          } catch (e) {}
        }
        candidates.sort((a, b) => b.score - a.score);
        results.push(...candidates.slice(0, 5));
        break;
      }

      // === XOR: dictionary attack, keep top 5 ===
      case 'xor': {
        const candidates = [];
        for (const key of this.DICTIONARY) {
          try {
            const dec = CipherEngine.process('xor', text, key, false);
            if (this._isPrintable(dec)) {
              const score = AnalysisEngine.scoreEnglish(dec);
              candidates.push({ algoId, algoName, key: `key: ${key}`, decrypted: dec, score, category });
            }
          } catch (e) {}
        }
        candidates.sort((a, b) => b.score - a.score);
        results.push(...candidates.slice(0, 5));
        break;
      }

      // === AFFINE: brute-force all valid (a,b) pairs, keep top 5 ===
      case 'affine': {
        const candidates = [];
        for (const a of this.AFFINE_A) {
          for (let b = 0; b < 26; b++) {
            try {
              const dec = CipherEngine.process('affine', text, `${a},${b}`, false);
              const score = AnalysisEngine.scoreEnglish(dec);
              candidates.push({ algoId, algoName, key: `a=${a}, b=${b}`, decrypted: dec, score, category });
            } catch (e) {}
          }
        }
        candidates.sort((a, b) => b.score - a.score);
        results.push(...candidates.slice(0, 5));
        break;
      }

      // === RAIL FENCE: try rails 2-10, keep top 3 ===
      case 'railfence': {
        const candidates = [];
        for (let rails = 2; rails <= 10; rails++) {
          try {
            const dec = CipherEngine.process('railfence', text, String(rails), false);
            const score = AnalysisEngine.scoreEnglish(dec);
            candidates.push({ algoId, algoName, key: `${rails} rails`, decrypted: dec, score, category });
          } catch (e) {}
        }
        candidates.sort((a, b) => b.score - a.score);
        results.push(...candidates.slice(0, 3));
        break;
      }

      // === SUBSTITUTION: known key alphabets + generated, keep all scored ===
      case 'substitution': {
        const keys = [...this.SUB_KEYS];
        // Generate a key from reversed unique chars of input
        const unique = [...new Set(text.toUpperCase().replace(/[^A-Z]/g, ''))];
        if (unique.length > 0) {
          const remaining = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(c => !unique.includes(c));
          const generated = [...unique.reverse(), ...remaining].join('').substring(0, 26);
          if (generated.length === 26) keys.push(generated);
        }
        for (const key of keys) {
          try {
            const dec = CipherEngine.process('substitution', text, key, false);
            const score = AnalysisEngine.scoreEnglish(dec);
            results.push({ algoId, algoName, key: `key: ${key.substring(0, 10)}...`, decrypted: dec, score, category });
          } catch (e) {}
        }
        break;
      }

      // === PLAYFAIR: known keywords ===
      case 'playfair': {
        const keys = [...this.SUB_KEYS.map(k => k.substring(0, 10)), ...this.DICTIONARY.slice(0, 10)];
        const candidates = [];
        for (const key of keys) {
          try {
            const dec = CipherEngine.process('playfair', text, key, false);
            const score = AnalysisEngine.scoreEnglish(dec);
            candidates.push({ algoId, algoName, key: `key: ${key}`, decrypted: dec, score, category });
          } catch (e) {}
        }
        candidates.sort((a, b) => b.score - a.score);
        results.push(...candidates.slice(0, 5));
        break;
      }

      default: break;
    }

    return results;
  }
};

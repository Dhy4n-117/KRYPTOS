// ===== KRYPTOS — Analysis Engine =====
const AnalysisEngine = {
  englishFreq: {E:12.7,T:9.06,A:8.17,O:7.51,I:6.97,N:6.75,S:6.33,H:6.09,R:5.99,D:4.25,L:4.03,C:2.78,U:2.76,M:2.41,W:2.36,F:2.23,G:2.02,Y:1.97,P:1.93,B:1.49,V:0.98,K:0.77,J:0.15,X:0.15,Q:0.10,Z:0.07},
  commonWords: ['THE','AND','FOR','ARE','BUT','NOT','YOU','ALL','ANY','CAN','HER','WAS','ONE','OUR','OUT','HAS','HIS','HOW','MAN','NEW','NOW','OLD','SEE','WAY','WHO','BOY','DID','GET','HAS','HIM','LET','SAY','SHE','TOO','USE','THAT','WITH','HAVE','THIS','WILL','YOUR','FROM','THEY','BEEN','SAID','EACH','WHICH','THEIR','TIME','ABOUT','WOULD','MAKE','LIKE','JUST','OVER','SUCH','TAKE','YEAR','THEM','SOME','WANT','GIVE','MOST','ONLY','TELL','VERY','WHEN','COME','COULD','GOOD','MUCH','THEN','THAN','LOOK','KNOW'],

  frequencyAnalysis(text) {
    const counts = {};
    let total = 0;
    for (const c of text.toUpperCase()) {
      if (c >= 'A' && c <= 'Z') { counts[c] = (counts[c]||0) + 1; total++; }
    }
    const freq = {};
    for (const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      freq[c] = { count: counts[c]||0, percent: total ? ((counts[c]||0)/total*100).toFixed(2) : 0 };
    }
    const sorted = Object.entries(freq).sort((a,b) => b[1].count - a[1].count);
    const entropy = this.calculateEntropy(counts, total);
    return { freq, sorted, total, uniqueChars: Object.keys(counts).length, entropy };
  },

  calculateEntropy(counts, total) {
    if (!total) return 0;
    let entropy = 0;
    for (const c of Object.values(counts)) {
      const p = c / total;
      if (p > 0) entropy -= p * Math.log2(p);
    }
    return entropy.toFixed(4);
  },

  indexOfCoincidence(text) {
    const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
    const n = clean.length;
    if (n < 2) return { ic: 0, lang: 'Unknown', keyLengths: [] };
    const counts = {};
    for (const c of clean) counts[c] = (counts[c]||0) + 1;
    let sum = 0;
    for (const c of Object.values(counts)) sum += c * (c - 1);
    const ic = sum / (n * (n - 1));
    let lang = 'Unknown';
    if (ic > 0.06) lang = 'Likely English / monoalphabetic';
    else if (ic > 0.04) lang = 'Possibly polyalphabetic';
    else lang = 'Likely random / strong encryption';
    // Estimate key lengths via IC
    const keyLengths = [];
    for (let kl = 1; kl <= Math.min(20, Math.floor(n/3)); kl++) {
      const groups = Array.from({length:kl}, ()=>'');
      for (let i = 0; i < clean.length; i++) groups[i%kl] += clean[i];
      let avgIc = 0;
      for (const g of groups) {
        const gn = g.length; if (gn<2) continue;
        const gc = {}; for(const c of g) gc[c]=(gc[c]||0)+1;
        let gs = 0; for(const c of Object.values(gc)) gs+=c*(c-1);
        avgIc += gs/(gn*(gn-1));
      }
      avgIc /= kl;
      keyLengths.push({ length: kl, ic: avgIc.toFixed(6), likely: avgIc > 0.06 });
    }
    return { ic: ic.toFixed(6), lang, keyLengths };
  },

  kasiskiExamination(text) {
    const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
    if (clean.length < 6) return { trigrams: [], possibleKeyLengths: [] };
    const trigrams = {};
    for (let i = 0; i <= clean.length - 3; i++) {
      const tri = clean.substr(i, 3);
      if (!trigrams[tri]) trigrams[tri] = [];
      trigrams[tri].push(i);
    }
    const repeated = {};
    for (const [tri, positions] of Object.entries(trigrams)) {
      if (positions.length >= 2) {
        const diffs = [];
        for (let i = 1; i < positions.length; i++) diffs.push(positions[i] - positions[0]);
        repeated[tri] = { positions, diffs };
      }
    }
    // Find GCD of all diffs
    const gcd = (a,b) => b ? gcd(b,a%b) : a;
    const allDiffs = [];
    for (const {diffs} of Object.values(repeated)) allDiffs.push(...diffs);
    const factorCounts = {};
    for (const d of allDiffs) {
      for (let f = 2; f <= Math.min(d, 20); f++) {
        if (d % f === 0) factorCounts[f] = (factorCounts[f]||0) + 1;
      }
    }
    const possibleKeyLengths = Object.entries(factorCounts)
      .map(([len,count])=>({length:parseInt(len),count}))
      .sort((a,b)=>b.count-a.count)
      .slice(0, 8);
    const topTrigrams = Object.entries(repeated)
      .sort((a,b)=>b[1].positions.length-a[1].positions.length)
      .slice(0, 10)
      .map(([tri,data])=>({trigram:tri,...data}));
    return { trigrams: topTrigrams, possibleKeyLengths };
  },

  bruteForceCaesar(text) {
    const results = [];
    for (let shift = 0; shift < 26; shift++) {
      const decrypted = CipherEngine.caesar(text, shift, false);
      const score = this.scoreEnglish(decrypted);
      results.push({ shift, text: decrypted, score });
    }
    return results.sort((a,b) => b.score - a.score);
  },

  scoreEnglish(text) {
    const upper = text.toUpperCase();
    let score = 0;
    // Trigram scoring
    for (const word of this.commonWords) {
      if (upper.includes(word)) score += word.length * 3;
    }
    // Letter frequency scoring
    const counts = {};
    let total = 0;
    for (const c of upper) { if(c>='A'&&c<='Z'){counts[c]=(counts[c]||0)+1;total++;} }
    if (total > 0) {
      for (const [letter, expected] of Object.entries(this.englishFreq)) {
        const actual = ((counts[letter]||0)/total)*100;
        score -= Math.abs(actual - expected) * 0.3;
      }
    }
    return Math.round(score * 100) / 100;
  },

  autoDetect(text) {
    const results = [];
    const trimmed = text.trim();
    // Base64
    if (/^[A-Za-z0-9+/]+=*$/.test(trimmed) && trimmed.length >= 4 && trimmed.length % 4 <= 1) {
      try { const d=atob(trimmed); if(/^[\x20-\x7E\n\r\t]+$/.test(d)) results.push({type:'Base64',confidence:'high',decoded:d}); }catch(e){}
    }
    // Hex
    if (/^([0-9a-fA-F]{2}\s*)+$/.test(trimmed)) {
      try { const d=CipherEngine.fromHex(trimmed); if(/^[\x20-\x7E\n\r\t]+$/.test(d)) results.push({type:'Hexadecimal',confidence:'high',decoded:d}); }catch(e){}
    }
    // Binary
    if (/^([01]{8}\s*)+$/.test(trimmed)) {
      try { const d=CipherEngine.fromBinary(trimmed); results.push({type:'Binary',confidence:'high',decoded:d}); }catch(e){}
    }
    // Morse
    if (/^[.\-/ ]+$/.test(trimmed) && trimmed.includes('.')) {
      try { const d=CipherEngine.morseDecode(trimmed); if(d.length>0) results.push({type:'Morse Code',confidence:'high',decoded:d}); }catch(e){}
    }
    // URL encoded
    if (/%[0-9A-Fa-f]{2}/.test(trimmed)) {
      try { results.push({type:'URL Encoded',confidence:'high',decoded:decodeURIComponent(trimmed)}); }catch(e){}
    }
    // Unicode escape
    if (/\\u[0-9a-fA-F]{4}/.test(trimmed)) {
      try { results.push({type:'Unicode Escape',confidence:'high',decoded:CipherEngine.unicodeDecode(trimmed)}); }catch(e){}
    }
    // Decimal
    if (/^(\d{2,3}\s+)+\d{2,3}$/.test(trimmed)) {
      try { const d=CipherEngine.fromDecimal(trimmed); if(/^[\x20-\x7E]+$/.test(d)) results.push({type:'Decimal ASCII',confidence:'medium',decoded:d}); }catch(e){}
    }
    // A1Z26
    if (/^(\d{1,2}-)+\d{1,2}$/.test(trimmed)) {
      try { results.push({type:'A1Z26',confidence:'medium',decoded:CipherEngine.a1z26Decode(trimmed)}); }catch(e){}
    }
    // Caesar (try brute force)
    if (/^[A-Za-z\s.,!?]+$/.test(trimmed) && trimmed.length > 5) {
      const best = this.bruteForceCaesar(trimmed);
      if (best[0].score > 10 && best[0].shift !== 0) {
        results.push({type:`Caesar (shift ${best[0].shift})`,confidence:'medium',decoded:best[0].text});
      }
    }
    // ROT47
    if (/[!-~]/.test(trimmed)) {
      const d = CipherEngine.rot47(trimmed);
      const score = this.scoreEnglish(d);
      if (score > 15) results.push({type:'ROT47',confidence:'medium',decoded:d});
    }
    // Base32
    if (/^[A-Z2-7]+=*$/.test(trimmed.toUpperCase()) && trimmed.length >= 8) {
      try { const d=CipherEngine.base32Decode(trimmed); if(/^[\x20-\x7E]+$/.test(d)) results.push({type:'Base32',confidence:'medium',decoded:d}); }catch(e){}
    }
    if (results.length === 0) results.push({type:'Unknown',confidence:'low',decoded:'Could not auto-detect encoding. Try manual analysis.'});
    return results;
  },

  textStatistics(text) {
    const len = text.length;
    const words = text.trim().split(/\s+/).filter(w=>w);
    const lines = text.split('\n');
    const letters = text.replace(/[^a-zA-Z]/g,'').length;
    const digits = text.replace(/[^0-9]/g,'').length;
    const spaces = (text.match(/ /g)||[]).length;
    const special = len - letters - digits - spaces;
    const upper = text.replace(/[^A-Z]/g,'').length;
    const lower = text.replace(/[^a-z]/g,'').length;
    const unique = new Set(text).size;
    const counts = {};
    for (const c of text.toUpperCase()) if(c>='A'&&c<='Z') counts[c]=(counts[c]||0)+1;
    const entropy = this.calculateEntropy(counts, letters);
    return { len, words:words.length, lines:lines.length, letters, digits, spaces, special, upper, lower, unique, entropy };
  }
};

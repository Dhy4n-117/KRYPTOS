// ===== DECIPHER — Cipher Engine =====
const CipherEngine = {
  algorithms: {
    classic: [
      {id:'caesar',name:'Caesar',desc:'Shifts each letter by a fixed number.',security:'Low',type:'Substitution',keyLabel:'Shift Key'},
      {id:'rot13',name:'ROT13',desc:'Caesar cipher with shift of 13.',security:'None',type:'Substitution',keyLabel:'None'},
      {id:'atbash',name:'Atbash',desc:'Reverses the alphabet (A↔Z, B↔Y).',security:'None',type:'Substitution',keyLabel:'None'},
      {id:'vigenere',name:'Vigenère',desc:'Polyalphabetic cipher using a keyword.',security:'Medium',type:'Polyalphabetic',keyLabel:'Keyword'},
      {id:'playfair',name:'Playfair',desc:'Digraph cipher using a 5×5 key matrix.',security:'Medium',type:'Polygraphic',keyLabel:'Keyword'},
      {id:'railfence',name:'Rail Fence',desc:'Transposition cipher writing in zigzag.',security:'Low',type:'Transposition',keyLabel:'Rails'},
      {id:'columnar',name:'Columnar',desc:'Transposition cipher using column order.',security:'Low',type:'Transposition',keyLabel:'Keyword'},
      {id:'affine',name:'Affine',desc:'ax+b mod 26 mathematical cipher.',security:'Low',type:'Substitution',keyLabel:'a, b'},
      {id:'beaufort',name:'Beaufort',desc:'Reciprocal variant of Vigenère.',security:'Medium',type:'Polyalphabetic',keyLabel:'Keyword'},
      {id:'substitution',name:'Substitution',desc:'Map each letter to another via a key alphabet.',security:'Low',type:'Substitution',keyLabel:'Alphabet Key'},
    ],
    encoding: [
      {id:'base64',name:'Base64',desc:'Binary-to-text encoding scheme.',security:'None',type:'Encoding',keyLabel:'None'},
      {id:'base32',name:'Base32',desc:'Base32 encoding scheme.',security:'None',type:'Encoding',keyLabel:'None'},
      {id:'hex',name:'Hexadecimal',desc:'Converts text to hex representation.',security:'None',type:'Encoding',keyLabel:'None'},
      {id:'binary',name:'Binary',desc:'Converts text to binary (8-bit).',security:'None',type:'Encoding',keyLabel:'None'},
      {id:'octal',name:'Octal',desc:'Converts text to octal representation.',security:'None',type:'Encoding',keyLabel:'None'},
      {id:'decimal',name:'Decimal',desc:'Converts text to decimal ASCII codes.',security:'None',type:'Encoding',keyLabel:'None'},
      {id:'url',name:'URL Encode',desc:'Percent-encodes special characters.',security:'None',type:'Encoding',keyLabel:'None'},
      {id:'html',name:'HTML Entities',desc:'Converts to HTML character entities.',security:'None',type:'Encoding',keyLabel:'None'},
      {id:'unicode',name:'Unicode Escape',desc:'Converts to \\uXXXX format.',security:'None',type:'Encoding',keyLabel:'None'},
      {id:'morse',name:'Morse Code',desc:'Encodes text as dots and dashes.',security:'None',type:'Encoding',keyLabel:'None'},
    ],
    modern: [
      {id:'xor',name:'XOR',desc:'Bitwise XOR with a key.',security:'Low',type:'Stream',keyLabel:'Key'},
      {id:'rot47',name:'ROT47',desc:'Rotates ASCII printable characters by 47.',security:'None',type:'Substitution',keyLabel:'None'},
      {id:'a1z26',name:'A1Z26',desc:'Letters to numbers (A=1, Z=26).',security:'None',type:'Encoding',keyLabel:'None'},
      {id:'reverse',name:'Reverse',desc:'Reverses the text string.',security:'None',type:'Transposition',keyLabel:'None'},
    ],
    esoteric: [
      {id:'bacon',name:'Bacon\'s',desc:'Encodes letters as 5-bit A/B sequences.',security:'Low',type:'Steganographic',keyLabel:'None'},
      {id:'polybius',name:'Polybius Square',desc:'5×5 grid coordinates cipher.',security:'Low',type:'Fractionation',keyLabel:'None'},
      {id:'tap',name:'Tap Code',desc:'Polybius variant used by prisoners.',security:'None',type:'Encoding',keyLabel:'None'},
      {id:'pigpen',name:'Pigpen Text',desc:'Text representation of the Pigpen cipher.',security:'None',type:'Substitution',keyLabel:'None'},
      {id:'nato',name:'NATO Phonetic',desc:'NATO phonetic alphabet encoding.',security:'None',type:'Encoding',keyLabel:'None'},
    ]
  },

  // ===== CIPHER IMPLEMENTATIONS =====
  process(algoId, text, key, encrypt) {
    if (!text) return '';
    try {
      switch(algoId) {
        case 'caesar': return this.caesar(text, parseInt(key)||3, encrypt);
        case 'rot13': return this.caesar(text, 13, true);
        case 'atbash': return this.atbash(text);
        case 'vigenere': return this.vigenere(text, key||'KEY', encrypt);
        case 'playfair': return this.playfair(text, key||'KEYWORD', encrypt);
        case 'railfence': return this.railfence(text, parseInt(key)||3, encrypt);
        case 'columnar': return this.columnarTransposition(text, key||'KEY', encrypt);
        case 'affine': return this.affine(text, key||'5,8', encrypt);
        case 'beaufort': return this.beaufort(text, key||'KEY');
        case 'substitution': return this.substitutionCipher(text, key||'ZYXWVUTSRQPONMLKJIHGFEDCBA', encrypt);
        case 'base64': return encrypt ? btoa(unescape(encodeURIComponent(text))) : decodeURIComponent(escape(atob(text)));
        case 'base32': return encrypt ? this.base32Encode(text) : this.base32Decode(text);
        case 'hex': return encrypt ? this.toHex(text) : this.fromHex(text);
        case 'binary': return encrypt ? this.toBinary(text) : this.fromBinary(text);
        case 'octal': return encrypt ? this.toOctal(text) : this.fromOctal(text);
        case 'decimal': return encrypt ? this.toDecimal(text) : this.fromDecimal(text);
        case 'url': return encrypt ? encodeURIComponent(text) : decodeURIComponent(text);
        case 'html': return encrypt ? this.htmlEncode(text) : this.htmlDecode(text);
        case 'unicode': return encrypt ? this.unicodeEncode(text) : this.unicodeDecode(text);
        case 'morse': return encrypt ? this.morseEncode(text) : this.morseDecode(text);
        case 'xor': return this.xorCipher(text, key||'KEY');
        case 'rot47': return this.rot47(text);
        case 'a1z26': return encrypt ? this.a1z26Encode(text) : this.a1z26Decode(text);
        case 'reverse': return text.split('').reverse().join('');
        case 'bacon': return encrypt ? this.baconEncode(text) : this.baconDecode(text);
        case 'polybius': return encrypt ? this.polybiusEncode(text) : this.polybiusDecode(text);
        case 'tap': return encrypt ? this.tapEncode(text) : this.tapDecode(text);
        case 'pigpen': return encrypt ? this.pigpenEncode(text) : this.pigpenDecode(text);
        case 'nato': return encrypt ? this.natoEncode(text) : this.natoDecode(text);
        default: return 'Unknown algorithm';
      }
    } catch(e) { return 'Error: ' + e.message; }
  },

  caesar(text, shift, encrypt) {
    const s = encrypt ? shift : (26 - shift);
    return text.replace(/[a-zA-Z]/g, c => {
      const base = c < 'a' ? 65 : 97;
      return String.fromCharCode((c.charCodeAt(0) - base + s) % 26 + base);
    });
  },

  atbash(text) {
    return text.replace(/[a-zA-Z]/g, c => {
      const base = c < 'a' ? 65 : 97;
      return String.fromCharCode(base + 25 - (c.charCodeAt(0) - base));
    });
  },

  vigenere(text, key, encrypt) {
    key = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!key) return text;
    let ki = 0;
    return text.replace(/[a-zA-Z]/g, c => {
      const base = c < 'a' ? 65 : 97;
      const shift = key.charCodeAt(ki % key.length) - 65;
      ki++;
      const s = encrypt ? shift : (26 - shift);
      return String.fromCharCode((c.charCodeAt(0) - base + s) % 26 + base);
    });
  },

  beaufort(text, key) {
    key = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!key) return text;
    let ki = 0;
    return text.replace(/[a-zA-Z]/g, c => {
      const base = c < 'a' ? 65 : 97;
      const shift = key.charCodeAt(ki % key.length) - 65;
      ki++;
      return String.fromCharCode((shift - (c.charCodeAt(0) - base) + 26) % 26 + base);
    });
  },

  affine(text, key, encrypt) {
    const parts = key.split(',').map(Number);
    let a = parts[0] || 5, b = parts[1] || 8;
    const modInverse = (a, m) => { for (let i = 1; i < m; i++) if ((a * i) % m === 1) return i; return 1; };
    if (encrypt) {
      return text.replace(/[a-zA-Z]/g, c => {
        const base = c < 'a' ? 65 : 97;
        return String.fromCharCode((a * (c.charCodeAt(0) - base) + b) % 26 + base);
      });
    } else {
      const ai = modInverse(a, 26);
      return text.replace(/[a-zA-Z]/g, c => {
        const base = c < 'a' ? 65 : 97;
        return String.fromCharCode((ai * (c.charCodeAt(0) - base - b + 260)) % 26 + base);
      });
    }
  },

  playfair(text, key, encrypt) {
    key = key.toUpperCase().replace(/J/g,'I').replace(/[^A-Z]/g,'');
    const seen = new Set(); const matrix = [];
    for (const c of key + 'ABCDEFGHIKLMNOPQRSTUVWXYZ') { if (!seen.has(c)){seen.add(c);matrix.push(c);} }
    const pos = c => { const i = matrix.indexOf(c); return [Math.floor(i/5), i%5]; };
    const at = (r,c) => matrix[r*5+c];
    let clean = text.toUpperCase().replace(/J/g,'I').replace(/[^A-Z]/g,'');
    let pairs = [];
    for (let i = 0; i < clean.length; i += 2) {
      const a = clean[i]; const b = (i+1<clean.length && clean[i+1]!==a) ? clean[i+1] : 'X';
      if (b === 'X' && i+1 < clean.length && clean[i+1] === a) i--;
      pairs.push([a, b]);
    }
    const dir = encrypt ? 1 : 4;
    return pairs.map(([a,b]) => {
      const [ra,ca] = pos(a), [rb,cb] = pos(b);
      if (ra === rb) return at(ra,(ca+dir)%5) + at(rb,(cb+dir)%5);
      if (ca === cb) return at((ra+dir)%5,ca) + at((rb+dir)%5,cb);
      return at(ra,cb) + at(rb,ca);
    }).join(' ');
  },

  railfence(text, rails, encrypt) {
    if (rails < 2) return text;
    if (encrypt) {
      const fence = Array.from({length:rails}, ()=>[]);
      let rail=0, dir=1;
      for (const c of text) { fence[rail].push(c); rail+=dir; if(rail===0||rail===rails-1)dir*=-1; }
      return fence.flat().join('');
    } else {
      const len = text.length;
      const pattern = []; let rail=0, dir=1;
      for (let i=0;i<len;i++){pattern.push(rail);rail+=dir;if(rail===0||rail===rails-1)dir*=-1;}
      const sorted = pattern.map((r,i)=>({r,i})).sort((a,b)=>a.r-b.r||a.i-b.i);
      const result = new Array(len);
      sorted.forEach((s,i)=>{result[s.i]=text[i];});
      return result.join('');
    }
  },

  columnarTransposition(text, key, encrypt) {
    key = key.toUpperCase().replace(/[^A-Z]/g,'');
    if (!key) return text;
    const order = [...key].map((c,i)=>({c,i})).sort((a,b)=>a.c.localeCompare(b.c)).map(x=>x.i);
    if (encrypt) {
      const cols = key.length;
      const padded = text + 'X'.repeat((cols - text.length%cols)%cols);
      const rows = padded.length / cols;
      let result = '';
      for (const col of order) for (let r=0;r<rows;r++) result += padded[r*cols+col];
      return result;
    } else {
      const cols = key.length;
      const rows = Math.ceil(text.length / cols);
      const grid = Array.from({length:rows},()=>new Array(cols).fill(''));
      let idx = 0;
      for (const col of order) for (let r=0;r<rows;r++) if(idx<text.length) grid[r][col]=text[idx++];
      return grid.flat().join('').replace(/X+$/,'');
    }
  },

  substitutionCipher(text, key, encrypt) {
    key = key.toUpperCase().replace(/[^A-Z]/g,'');
    if (key.length !== 26) return 'Error: Key must be 26 unique letters';
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const from = encrypt ? alpha : key;
    const to = encrypt ? key : alpha;
    return text.replace(/[a-zA-Z]/g, c => {
      const upper = c.toUpperCase();
      const idx = from.indexOf(upper);
      const mapped = idx >= 0 ? to[idx] : c;
      return c < 'a' ? mapped : mapped.toLowerCase();
    });
  },

  toHex(t){return [...t].map(c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join(' ');},
  fromHex(t){return t.trim().split(/\s+/).map(h=>String.fromCharCode(parseInt(h,16))).join('');},
  toBinary(t){return [...t].map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ');},
  fromBinary(t){return t.trim().split(/\s+/).map(b=>String.fromCharCode(parseInt(b,2))).join('');},
  toOctal(t){return [...t].map(c=>c.charCodeAt(0).toString(8).padStart(3,'0')).join(' ');},
  fromOctal(t){return t.trim().split(/\s+/).map(o=>String.fromCharCode(parseInt(o,8))).join('');},
  toDecimal(t){return [...t].map(c=>c.charCodeAt(0)).join(' ');},
  fromDecimal(t){return t.trim().split(/\s+/).map(d=>String.fromCharCode(parseInt(d))).join('');},

  htmlEncode(t){const d=document.createElement('div');d.textContent=t;return d.innerHTML;},
  htmlDecode(t){const d=document.createElement('div');d.innerHTML=t;return d.textContent;},
  unicodeEncode(t){return [...t].map(c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0')).join('');},
  unicodeDecode(t){return t.replace(/\\u([0-9a-fA-F]{4})/g,(_,h)=>String.fromCharCode(parseInt(h,16)));},

  base32Encode(t) {
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '', result = '';
    for (const c of t) bits += c.charCodeAt(0).toString(2).padStart(8, '0');
    while (bits.length % 5) bits += '0';
    for (let i = 0; i < bits.length; i += 5) result += alpha[parseInt(bits.substr(i, 5), 2)];
    while (result.length % 8) result += '=';
    return result;
  },
  base32Decode(t) {
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '', result = '';
    for (const c of t.replace(/=+$/, '')) { const v = alpha.indexOf(c.toUpperCase()); if (v >= 0) bits += v.toString(2).padStart(5, '0'); }
    for (let i = 0; i + 8 <= bits.length; i += 8) result += String.fromCharCode(parseInt(bits.substr(i, 8), 2));
    return result;
  },

  morseMap: {'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'},
  morseEncode(t) {
    return t.toUpperCase().split('').map(c => c===' '?'/' : this.morseMap[c]||c).join(' ');
  },
  morseDecode(t) {
    const rev = {}; for (const [k,v] of Object.entries(this.morseMap)) rev[v] = k;
    return t.split(' ').map(w => w==='/'||w===''?' ' : rev[w]||w).join('').replace(/  +/g,' ');
  },

  xorCipher(t, key) {
    return [...t].map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('');
  },

  rot47(t) {
    return t.replace(/[!-~]/g, c => String.fromCharCode(33 + (c.charCodeAt(0) - 33 + 47) % 94));
  },

  a1z26Encode(t) {
    return t.toUpperCase().split('').map(c => {
      const n = c.charCodeAt(0) - 64;
      return n >= 1 && n <= 26 ? n : c;
    }).join('-');
  },
  a1z26Decode(t) {
    return t.split('-').map(p => { const n = parseInt(p); return n >= 1 && n <= 26 ? String.fromCharCode(n + 64) : p; }).join('');
  },

  baconAlpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((_,i) => i.toString(2).padStart(5,'0').replace(/0/g,'A').replace(/1/g,'B')),
  baconEncode(t) {
    return t.toUpperCase().replace(/[^A-Z]/g,'').split('').map(c => this.baconAlpha[c.charCodeAt(0)-65]).join(' ');
  },
  baconDecode(t) {
    const chunks = t.toUpperCase().replace(/[^AB]/g,'').match(/.{5}/g) || [];
    return chunks.map(ch => String.fromCharCode(parseInt(ch.replace(/A/g,'0').replace(/B/g,'1'),2) + 65)).join('');
  },

  polybiusGrid: 'ABCDEFGHIKLMNOPQRSTUVWXYZ',
  polybiusEncode(t) {
    return t.toUpperCase().replace(/J/g,'I').replace(/[^A-Z]/g,'').split('').map(c => {
      const i = this.polybiusGrid.indexOf(c);
      return i>=0 ? (Math.floor(i/5)+1)+''+(i%5+1) : c;
    }).join(' ');
  },
  polybiusDecode(t) {
    const pairs = t.trim().split(/\s+/);
    return pairs.map(p => { if(p.length===2){const r=parseInt(p[0])-1,c=parseInt(p[1])-1;return this.polybiusGrid[r*5+c]||'';} return p; }).join('');
  },

  tapEncode(t) {
    return t.toUpperCase().replace(/K/g,'C').replace(/[^A-Z]/g,'').split('').map(c => {
      let idx = c.charCodeAt(0) - 65; if (idx > 10) idx--;
      return (Math.floor(idx/5)+1) + ',' + (idx%5+1);
    }).join(' ');
  },
  tapDecode(t) {
    return t.trim().split(/\s+/).map(p => {
      const [r,c] = p.split(',').map(Number);
      if (r&&c) { let idx = (r-1)*5+(c-1); if(idx>=10) idx++; return String.fromCharCode(idx+65); }
      return '';
    }).join('');
  },

  pigpenEncode(t) {
    const map = {'A':'⌐','B':'|_|','C':'⌐|','D':'⌐.','E':'|_.|','F':'⌐.|','G':'<','H':'v','I':'>','J':'⌐*','K':'|_|*','L':'⌐|*','M':'⌐.*','N':'|_.|*','O':'⌐.|*','P':'<*','Q':'v*','R':'>*','S':'/\\','T':'\\/','U':'>_<','V':'/\\.','W':'\\/.','X':'>_<.'};
    return t.toUpperCase().replace(/[^A-Z]/g,'').split('').map(c => map[c]||c).join(' ');
  },
  pigpenDecode(t) {
    const map = {'⌐':'A','|_|':'B','⌐|':'C','⌐.':'D','|_.|':'E','⌐.|':'F','<':'G','v':'H','>':'I','⌐*':'J','|_|*':'K','⌐|*':'L','⌐.*':'M','|_.|*':'N','⌐.|*':'O','<*':'P','v*':'Q','>*':'R','/\\':'S','\\/':'T','>_<':'U','/\\.':'V','\\/.':'W','>_<.':'X'};
    return t.split(' ').map(s => map[s]||s).join('');
  },

  natoMap: {A:'Alpha',B:'Bravo',C:'Charlie',D:'Delta',E:'Echo',F:'Foxtrot',G:'Golf',H:'Hotel',I:'India',J:'Juliet',K:'Kilo',L:'Lima',M:'Mike',N:'November',O:'Oscar',P:'Papa',Q:'Quebec',R:'Romeo',S:'Sierra',T:'Tango',U:'Uniform',V:'Victor',W:'Whiskey',X:'X-ray',Y:'Yankee',Z:'Zulu','0':'Zero','1':'One','2':'Two','3':'Three','4':'Four','5':'Five','6':'Six','7':'Seven','8':'Eight','9':'Niner'},
  natoEncode(t) {
    return t.toUpperCase().split('').map(c => this.natoMap[c] || (c===' '?'/':c)).join(' ');
  },
  natoDecode(t) {
    const rev = {}; for (const [k,v] of Object.entries(this.natoMap)) rev[v.toUpperCase()] = k;
    return t.split(/\s+/).map(w => w==='/'?' ' : rev[w.toUpperCase()]||w).join('');
  },
};

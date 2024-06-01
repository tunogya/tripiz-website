const crypto = require('crypto');

const SIZE = 64;
const HALF_SIZE = SIZE / 2;

const PREFIX = "";

const SYMBOL_SCHEMES = {
  1: ['.', 'X', '/', '\\', '.'],
  2: ['.', '+', '-', '|', '.'],
  3: ['.', '/', '\\', '.', '.'],
  4: ['.', '\\', '|', '-', '/'],
  5: ['.', 'O', '|', '-', '.'],
  6: ['.', '\\', '\\', '.', '.'],
  7: ['.', '#', '|', '-', '+'],
  8: ['.', 'O', 'O', '.', '.'],
  9: ['.', '#', '.', '.', '.'],
  10: ['.', '#', 'O', '.', '.']
};

function abs(n) {
  return n >= 0 ? n : -n;
}

function getScheme(a) {
  const index = a % 83;
  if (index < 20) return 1;
  if (index < 35) return 2;
  if (index < 48) return 3;
  if (index < 59) return 4;
  if (index < 68) return 5;
  if (index < 73) return 6;
  if (index < 77) return 7;
  if (index < 80) return 8;
  if (index < 82) return 9;
  return 10;
}

function draw(seed) {
  const a = BigInt('0x' + crypto.createHash('sha256').update(seed.toString()).digest('hex'));
  let output = PREFIX;
  
  const schemeIndex = getScheme(Number(a));
  const symbols = SYMBOL_SCHEMES[schemeIndex];
  const mod = symbols.length;
  
  for (let i = 0; i < SIZE; i++) {
    let y = 2 * (i - HALF_SIZE) + 1;
    if (a % 3n === 1n) {
      y = -y;
    } else if (a % 3n === 2n) {
      y = abs(y);
    }
    y = y * Number(a);
    
    for (let j = 0; j < SIZE; j++) {
      let x = 2 * (j - HALF_SIZE) + 1;
      if (a % 2n === 1n) {
        x = abs(x);
      }
      x = x * Number(a);
      
      const v = Math.abs(x * y / Number(2n**32n)) % mod;
      output += symbols[v];
    }
    output += '\n'; // Adding newline character in URL encoding
  }
  
  return output;
}

const seed = "0x123456722372823232932732882983273237283627832n"; // Replace with any seed value
const result = draw(seed);
console.log(result);
import { NextRequest } from "next/server";
import * as crypto from "crypto";
import opentype from "opentype.js";

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

function abs(n: number) {
  return n >= 0 ? n : -n;
}

function getScheme(a: number) {
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

function draw(seed?: string, hash?: string) {
  let a;
  if (hash) {
    const regex = /^0x[0-9a-fA-F]+$/;
    if (regex.test(hash)) {
      a = BigInt(hash)
    } else {
      return ""
    }
  } else if (seed) {
    a = BigInt('0x' + crypto.createHash('sha256').update(seed.toString()).digest('hex'));
  } else {
    return ""
  }

  let output = PREFIX;

  const schemeIndex = getScheme(Number(a));
  const symbols = SYMBOL_SCHEMES[schemeIndex];
  const mod = symbols.length;

  for (let i = 0; i < SIZE; i++) {
    let y = 2 * (i - HALF_SIZE) + 1;
    // @ts-ignore
    if (a % 3n === 1n) {
      y = -y;
      // @ts-ignore
    } else if (a % 3n === 2n) {
      y = abs(y);
    }
    y = y * Number(a);

    for (let j = 0; j < SIZE; j++) {
      let x = 2 * (j - HALF_SIZE) + 1;
      // @ts-ignore
      if (a % 2n === 1n) {
        x = abs(x);
      }
      x = x * Number(a);
      // @ts-ignore
      const v = Math.abs(x * y / Number(2n**32n)) % mod;
      output += symbols[v];
    }
    output += '\n';
  }

  return output;
}

const GET = async (req: NextRequest) => {
  const seed = req.nextUrl.searchParams.get("seed") || undefined;
  const hash = req.nextUrl.searchParams.get("hash") || undefined;

  if (!seed && !hash) {
    return new Response("Need hash or seed", {
      status: 400,
    })
  }

  const result = draw(seed, hash);

  const fontUrl = './public/fonts/autoglyphs-font/autoglyphs-400.ttf';
  const font = await opentype.load(fontUrl);

  let svgContent = `<svg width="1024" height="1024"
     xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink">
<rect x="0" y="0" width="1024" height="1024" style="fill:white" />`;

  const lines = result.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const y = 128 + 12 * i;

    let x = 128;
    for (const char of line) {
      const glyph = font.charToGlyph(char);
      const pathData = glyph.getPath(x, y, 12).toPathData(3);
      svgContent += `<path d="${pathData}" fill="black" />`;
      x += (glyph.advanceWidth || 0) * (12 / font.unitsPerEm);
    }
  }

  svgContent += `</svg>`;

  return new Response(svgContent, {
    headers: {
      "Content-Type": "image/svg+xml",
    }
  });
}

export {
  GET
}
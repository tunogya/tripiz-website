import { NextRequest } from "next/server";
import * as crypto from "crypto";
import opentype from "opentype.js";
import path from 'path';

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

const COLOR_SCHEMES = {
  1: "#FFFFFF",
  2: "#AFB1F8",
  3: "#AAEDBA",
  4: "#D17493",
  5: "#ECA0D1",
  6: "#F1A47D",
  7: "#EFA1AA",
  8: "#FAE56A",
  9: "#94BBF4",
  10: "#D4F47D"
}

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

function draw(a: bigint) {
  const schemeIndex = getScheme(Number(a));
  let output = PREFIX;
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

  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'autoglyphs-font', 'autoglyphs-900.ttf');
  const font = await opentype.load(fontPath);

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

  const schemeIndex = getScheme(Number(a));
  const backgroundColor = COLOR_SCHEMES[schemeIndex];

  const result = draw(a);

  let svgContent = `<svg width="1024" height="1024" viewBox="0 0 1024 1024"
     xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink">
<rect x="0" y="0" width="1024" height="1024" style="fill:${backgroundColor}" />`;

  const lines = result.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const y = 128 + 12 * i;

    let x = 128;
    for (const char of line) {
      const glyph = font.charToGlyph(char);
      const pathData = glyph.getPath(x, y, 12).toPathData(1);
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
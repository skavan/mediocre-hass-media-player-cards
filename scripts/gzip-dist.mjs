#!/usr/bin/env node

import { createReadStream, createWriteStream, existsSync, statSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream/promises";
import { createGzip, constants as zlibConstants } from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const inputPath = resolve(
  projectRoot,
  process.argv[2] ?? "dist/mediocre-hass-media-player-cards.js"
);
const outputPath = resolve(projectRoot, process.argv[3] ?? `${inputPath}.gz`);

if (!existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

await pipeline(
  createReadStream(inputPath),
  createGzip({ level: zlibConstants.Z_BEST_COMPRESSION }),
  createWriteStream(outputPath)
);

const inputSize = statSync(inputPath).size;
const outputSize = statSync(outputPath).size;

console.log(`Gzipped ${inputPath}`);
console.log(`Wrote ${outputPath}`);
console.log(`Size: ${inputSize} bytes -> ${outputSize} bytes`);

// Script to generate sentence embeddings using transformers.js (runs locally, no API key needed)
// Run with: node scripts/generate_embeddings.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from '@huggingface/transformers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sentences = [
  "I love coffee",
  "I like espresso",
  "Coffee is my favorite drink",
  "I hate coffee",
  "The weather is nice today",
  "Python is a programming language"
];

async function getEmbeddings() {
  console.log('Loading sentence-transformers model (first run downloads ~30MB)...');

  // Create feature extraction pipeline
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  console.log('Model loaded! Generating embeddings for sentences:');
  sentences.forEach((s, i) => console.log(`  ${i + 1}. "${s}"`));

  const result = {};

  for (const sentence of sentences) {
    console.log(`  Processing: "${sentence}"...`);

    // Get embeddings with mean pooling and normalization
    const output = await extractor(sentence, { pooling: 'mean', normalize: true });

    // Convert to regular array
    const embedding = Array.from(output.data);
    result[sentence] = embedding;
  }

  console.log(`\nGenerated ${Object.keys(result).length} embeddings`);
  console.log(`Embedding dimension: ${result[sentences[0]].length}`);

  // Save to JSON file
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'embeddings.json');

  // Create directory if it doesn't exist
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\nSaved embeddings to ${outputPath}`);

  // Print similarity matrix
  console.log('\n=== Cosine Similarity Matrix ===');
  const cosine = (a, b) => {
    const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
    const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
    return dot / (magA * magB);
  };

  console.log('\nKey comparisons:');
  const keys = Object.keys(result);
  const comparisons = [
    [0, 1], // love coffee vs like espresso
    [0, 2], // love coffee vs favorite drink
    [0, 3], // love coffee vs hate coffee
    [0, 4], // love coffee vs weather
    [0, 5], // love coffee vs python
  ];

  for (const [i, j] of comparisons) {
    const sim = cosine(result[keys[i]], result[keys[j]]);
    console.log(`  "${keys[i]}" <-> "${keys[j]}": ${sim.toFixed(4)}`);
  }
}

getEmbeddings().catch(console.error);

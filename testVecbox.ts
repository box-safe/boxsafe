import { autoEmbed } from 'vecbox';

const result = await autoEmbed({text: 'Hello world'});
console.log('Provider:', result.provider);
console.log('Dimensions:', result.dimensions);

if ('embedding' in result) {
  console.log('Embedding length:', result.embedding.length);
} else {
  console.log('Batch embeddings:', result.embeddings.length);
}

console.log(result.embedding);
// console.log(result.embedding);
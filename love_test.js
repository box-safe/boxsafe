// love_test.js
if (process.platform === 'linux') {
  console.log('I Love you');
} else if (process.platform === 'win32') {
  console.log('I Hate you');
} else {
  // Optional: handle other operating systems if needed
  console.log('OS not recognized for this love test.');
}
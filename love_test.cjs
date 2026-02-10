const os = require('os');

const platform = os.platform(); // 'darwin', 'linux', 'win32', etc.

if (platform === 'linux') {
  console.log('I Love you');
} else if (platform === 'win32') {
  console.log('I Hate you');
} else {
  // Handle other OS platforms if needed, or a default message
  console.log(`Hmm, I don't know this OS: ${platform}`);
}

// To run this file:
// 1. Save it as love_test.js
// 2. Open your terminal/command prompt
// 3. Navigate to the directory where you saved the file
// 4. Run: node love_test.js

// commit: second test with the agent done
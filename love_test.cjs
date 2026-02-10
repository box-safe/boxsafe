// love_test.js
const os = require('os');

const platform = os.platform();

if (platform === 'linux') {
  console.log('I Love you');
} else if (platform === 'win32') { // 'win32' is the platform string for Windows
  console.log('I Hate you');
} else {
  // Optional: Handle other platforms if needed
  console.log(`OS detected: ${platform}. No strong feelings yet.`);
}

// commit: second test with the agent done
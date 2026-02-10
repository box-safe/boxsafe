const os = require('os');

const platform = os.platform();

if (platform === 'linux') {
  console.log('I Love you');
} else if (platform === 'win32') {
  console.log('I Hate you');
} else {
  console.log(`Hmm, you are using ${platform}. I have no strong feelings about that.`);
}
// Commit message: second test with the agent done
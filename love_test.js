const platform = process.platform;

if (platform === 'linux') {
  console.log('I Love you');
} else if (platform === 'win32') {
  console.log('I Hate you');
} else {
  console.log(`Operating system detected: ${platform}. This script only knows how to love Linux and hate Windows.`);
}
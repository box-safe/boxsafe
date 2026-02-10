const platform = process.platform;

if (platform === 'linux') {
  console.log('I Love you');
} else if (platform === 'win32') {
  console.log('I Hate you');
} else {
  // Handle other operating systems if necessary, or do nothing.
  // The prompt specifically asked only for Linux and Windows.
  console.log(`Unexpected OS: ${platform}`); 
}
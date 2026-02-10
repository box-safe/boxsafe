if (process.platform === 'linux') {
  console.log('I Love you');
} else if (process.platform === 'win32') {
  console.log('I Hate you');
} else {
  // You might want to add a message for other operating systems like macOS
  // For this problem, we only care about Linux and Windows.
  console.log('OS not recognized as Linux or Windows: ' + process.platform);
}
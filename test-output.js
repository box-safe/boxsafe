if (process.platform === 'linux') {
  console.log('I Love you');
} else if (process.platform === 'win32') {
  console.log('I Hate you');
} else {
  console.log('Unknown OS, but my feelings are neutral.');
}
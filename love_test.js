if (process.platform === 'linux') {
  console.log('I Love you');
} else if (process.platform === 'win32') {
  console.log('I Hate you');
} else {
  console.log('I am neutral about your OS');
}
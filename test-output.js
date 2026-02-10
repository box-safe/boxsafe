const os = process.platform;

if (os === 'linux') {
  console.log('I Love you');
} else if (os === 'win32') {
  console.log('I Hate you');
} else {
  // Handles other operating systems not explicitly mentioned
  console.log(`Hmm, running on ${os}. My feelings are neutral.`);
}
// This Node.js script will exit with code 1 if executed,
// due to the unhandled exception.
console.error("An error occurred that will terminate the process.");
throw new Error("A critical operation failed and the process cannot continue.");
// This script simulates a process exiting with a non-zero code,
// specifically the common exit code 127, which often indicates
// a command not found or a missing interpreter in shell environments.

const exitCode = 127;

console.error(`Process is exiting intentionally with code: ${exitCode}`);
process.exit(exitCode);
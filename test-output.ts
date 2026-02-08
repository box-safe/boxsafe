export interface ProcessExitDetails {
  exitCode: number;
  reason?: string;
  details?: string;
}

/**
 * Provides a common interpretation for standard Unix-like process exit codes.
 * @param details The exit details including the exit code.
 * @returns A human-readable string explaining the exit code.
 */
export function interpretProcessExitCode(details: ProcessExitDetails): string {
  switch (details.exitCode) {
    case 0:
      return "Success: The command executed successfully.";
    case 1:
      return "General Error: A generic error code, often used for miscellaneous issues.";
    case 2:
      return "Misuse of Shell Builtins: Command-line usage errors (e.g., incorrect arguments).";
    case 126:
      return "Permission Denied: The command found but cannot be executed (e.g., permissions problem, not an executable).";
    case 127:
      return "Command Not Found: The command specified was not found or could not be located in the system's PATH environment variable.";
    case 128:
      return "Invalid Exit Argument: The `exit` command was used with an invalid argument.";
    default:
      if (details.exitCode > 128 && details.exitCode <= 255) {
        // Exit codes above 128 often indicate termination by a signal.
        // Exit code = 128 + Signal Number
        const signalNumber = details.exitCode - 128;
        return `Terminated by Signal: Process was terminated by signal ${signalNumber}.`;
      }
      return `Unknown Error: Process exited with code ${details.exitCode}. No specific meaning defined.`;
  }
}

// Example of how to use this function (not part of the function itself):
// const problemDetails: ProcessExitDetails = { exitCode: 127, reason: "Process exited with code 127" };
// console.log(interpretProcessExitCode(problemDetails));
// // Expected output: "Command Not Found: The command specified was not found or could not be located in the system's PATH environment variable."
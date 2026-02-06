// Basic ANSI escape codes for terminal colors
export enum ANSI {
  Reset = "\x1b[0m",
  Bold = "\x1b[1m",
  Dim = "\x1b[2m",

  // Foreground colors
  Black = "\x1b[30m",
  Red = "\x1b[31m",
  Green = "\x1b[32m",
  Yellow = "\x1b[33m",
  Blue = "\x1b[34m",
  Magenta = "\x1b[35m",
  Cyan = "\x1b[36m",
  White = "\x1b[37m",

  // Bright foreground colors
  Gray = "\x1b[90m",
  RedBright = "\x1b[91m",
  GreenBright = "\x1b[92m",
  YellowBright = "\x1b[93m",
  BlueBright = "\x1b[94m",
  MagentaBright = "\x1b[95m",
  CyanBright = "\x1b[96m",
  WhiteBright = "\x1b[97m",

  // Background colors
  BgRed = "\x1b[41m",
}

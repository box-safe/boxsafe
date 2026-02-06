import { spawn } from "child_process"
import path from "path"
import fs from "fs/promises"
import type { CommandRun } from "@/types"

const dirLog = path.join(process.cwd(), "memo", "satateslogs")
const pathLog = path.join(dirLog, "logs.txt")

const run = (command: CommandRun): void => {
  const [cmd, args] = typeof command === "string"
    ? [command, []]
    : command

  const child = spawn(cmd, args, { shell: true })

  const write = async (data: string) => {
    await fs.mkdir(dirLog, { recursive: true })
    await fs.appendFile(pathLog, data, "utf8")
  }

  child.stdout?.on("data", data => {
    write(data.toString())
  })

  child.stderr?.on("data", data => {
    write(data.toString())
  })

  child.on("exit", (code, signal) => { // signal codes = SIGTERM, SIGKILL, SIGINT
    write(`\nexitCode=${code} signal=${signal}\n`)
  })
}

// export default run


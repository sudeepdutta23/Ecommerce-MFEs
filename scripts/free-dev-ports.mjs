#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { readlinkSync } from 'node:fs'
import { platform } from 'node:os'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const force = process.env.FREE_DEV_PORTS_FORCE === '1' || process.argv.includes('--force')

const portsByName = {
  home: 3004,
  products: 3001,
  cart: 3002,
  checkout: 3003,
  shell: 3100,
  auth: 3005,
}

const selectedNames = process.argv
  .slice(2)
  .filter((arg) => !arg.startsWith('--'))

const names = selectedNames.length === 0 || selectedNames.includes('all')
  ? Object.keys(portsByName)
  : selectedNames

let blocked = false

for (const name of names) {
  const port = portsByName[name]
  if (!port) {
    console.error(`[ports] Unknown app "${name}". Expected one of: all, ${Object.keys(portsByName).join(', ')}`)
    process.exitCode = 1
    continue
  }

  const pids = getListeningPids(port)
  if (pids.length === 0) continue

  for (const pid of pids) {
    if (pid === process.pid) continue

    const command = getCommand(pid)
    const cwd = getCwd(pid)
    const isWorkspaceProcess = command.includes(repoRoot) || cwd.startsWith(repoRoot)

    if (!isWorkspaceProcess && !force) {
      blocked = true
      console.error(
        `[ports] Port ${port} (${name}) is already used by PID ${pid}: ${command || 'unknown command'}`,
      )
      console.error('[ports] It does not look like this workspace owns that process.')
      console.error('[ports] Stop it manually, or run with FREE_DEV_PORTS_FORCE=1 if you want this script to kill it.')
      continue
    }

    await stopProcess(pid, port, name)
  }
}

if (blocked) {
  process.exitCode = 1
}

function getListeningPids(port) {
  const viaLsof = run('lsof', [`-tiTCP:${port}`, '-sTCP:LISTEN'])
  if (viaLsof.ok) {
    return uniquePids(viaLsof.stdout)
  }

  if (platform() !== 'win32') {
    const viaSs = run('ss', ['-ltnp'])
    if (viaSs.ok) {
      const pids = []
      for (const line of viaSs.stdout.split('\n')) {
        if (!line.includes(`:${port} `)) continue
        const matches = line.matchAll(/pid=(\d+)/g)
        for (const match of matches) pids.push(Number(match[1]))
      }
      return [...new Set(pids)].filter((pid) => Number.isInteger(pid) && pid > 0)
    }
  }

  return []
}

function getCommand(pid) {
  const result = run('ps', ['-p', String(pid), '-o', 'command='])
  return result.ok ? result.stdout.trim() : ''
}

function getCwd(pid) {
  try {
    return readlinkSync(`/proc/${pid}/cwd`)
  } catch {
    return ''
  }
}

async function stopProcess(pid, port, name) {
  console.log(`[ports] Stopping PID ${pid} on port ${port} (${name})`)

  try {
    process.kill(pid, 'SIGTERM')
  } catch {
    return
  }

  await sleep(800)
  if (!isRunning(pid)) return

  try {
    process.kill(pid, 'SIGKILL')
  } catch {
    return
  }

  await sleep(200)
}

function isRunning(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function run(command, args) {
  try {
    return {
      ok: true,
      stdout: execFileSync(command, args, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }),
    }
  } catch {
    return { ok: false, stdout: '' }
  }
}

function uniquePids(output) {
  return [...new Set(
    output
      .split(/\s+/)
      .map((pid) => Number(pid))
      .filter((pid) => Number.isInteger(pid) && pid > 0),
  )]
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

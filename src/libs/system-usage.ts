export function viewSystemUsage(): Record<string, unknown> {
  return {
    timestamp: Date.now(),
    cpu: process.cpuUsage(),
    memory: process.memoryUsage(),
    resource: process.resourceUsage(),
  }
}

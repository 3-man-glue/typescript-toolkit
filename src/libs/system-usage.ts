export function viewSystemUsage() {
  return {
    timestamp: Date.now(),
    cpu: process.cpuUsage(),
    memory: process.memoryUsage(),
    resource: process.resourceUsage(),
  }
}

export function viewSystemUsage(): Object {
  return {
    timestamp: Date.now(),
    cpu: process.cpuUsage(),
    memory: process.memoryUsage(),
    resource: process.resourceUsage(),
  }
}

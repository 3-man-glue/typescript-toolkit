export interface ScheduleHandler {
  handle(): Promise<void>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ScheduleHandlerConstructor = new (...args: any[]) => ScheduleHandler

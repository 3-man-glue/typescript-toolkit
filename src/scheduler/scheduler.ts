import { Logger } from '@utils/logger'
import cron, { ScheduledTask } from 'node-cron'
import { ScheduleHandlerConstructor } from '@scheduler/interfaces'
import { Container } from 'typedi'

type LoaderFunction = () => Promise<void>

interface Task {
  expression: string
  HandlerConstructor: ScheduleHandlerConstructor
}

export class Scheduler {
  private readonly logger: Logger

  private static scheduler: Scheduler

  private tasks: Map<string, Task> = new Map()

  private activeTasks: Map<string, ScheduledTask> = new Map()

  private loader: LoaderFunction = () => Promise.resolve()

  private constructor(logger: Logger) {
    this.logger = logger
  }

  static create(logger: Logger): Scheduler {
    if (this.scheduler) {
      return this.scheduler
    }
    this.scheduler = new Scheduler(logger)

    return this.scheduler
  }

  public setLoaderFunction(fn: LoaderFunction): this {
    this.loader = fn

    return this
  }

  public registerTask(expressionName: string, HandlerConstructor: ScheduleHandlerConstructor): this {
    const expression = process.env[`SCHEDULER_${expressionName}`]

    if (!expression) {
      this.logger.error(`Schedule expression not exist: ${expressionName}`)
      throw new Error(`Schedule expression not exist: ${expressionName}`)
    }

    if (!cron.validate(expression)) {
      this.logger.error(`Schedule expression is invalid: ${expression}`)
      throw new Error(`Schedule expression is invalid: ${expression}`)
    }

    this.tasks.set(expressionName, {
      expression,
      HandlerConstructor,
    })

    return this
  }

  public removeTask(expressionName: string): this {
    const task = this.activeTasks.get(expressionName)

    if (!task) {
      throw new Error('Remove task not exist')
    }

    task.stop()
    this.activeTasks.delete(expressionName)

    return this
  }

  public async start(): Promise<void> {
    try {
      await this.loader()
      this.bootstrap()
    } catch (error) {
      this.raiseException(error)
    }
  }

  private bootstrap(): void {
    this.tasks.forEach((task: Task, expressionName: string) => {
      const scheduleHandler = Container.has(task.HandlerConstructor)
        ? Container.get(task.HandlerConstructor)
        : new task.HandlerConstructor()

      const activeTask = cron.schedule(task.expression, scheduleHandler.handle)
      activeTask.start()

      this.activeTasks.set(expressionName, activeTask)
    })

    this.tasks.clear()
  }

  public stop(): void {
    this.activeTasks.forEach((activeTask: ScheduledTask) => {
      activeTask.stop()
    })

    this.activeTasks.clear()
  }

  private raiseException(e: Error): void {
    this.logger.error(`Unable to bootstrap scheduler: ${e}`, { exception: e })
  }
}

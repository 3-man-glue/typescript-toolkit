import { Logger } from '../../utils/logger'
export interface ScheduleHandler {
    handle(): Promise<void>;
}
export declare type ScheduleHandlerConstructor = new (...args: any[]) => ScheduleHandler;

declare type LoaderFunction = () => Promise<void>;
export declare class Scheduler {
    private readonly logger;

    static create(logger: Logger): Scheduler;

    setLoaderFunction(fn: LoaderFunction): this;

    registerTask(expressionName: string, HandlerConstructor: ScheduleHandlerConstructor): this;

    removeTask(expressionName: string): this;

    start(): Promise<void>;

    stop(): void;
}

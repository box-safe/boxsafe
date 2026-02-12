export enum LogLevel {
    DEBUG = 1,
    INFO,
    WARN,
    ERROR,
}

export interface LogEntry {
    level: LogLevel;
    message: string;
    module: string;
    timestamp: Date;
}

export class Logger {
    private static instance: Logger; // it the class itself 
    private currentLevel: LogLevel; // current log level
    private moduleName: string; // module name

    // ANSI color codes - simplificado para melhor legibilidade
    private static readonly COLORS = {
        RESET: '\x1b[0m',
        DEBUG: '\x1b[36m', // Cyan
        INFO: '\x1b[32m',  // Green  
        WARN: '\x1b[33m',  // Yellow
        ERROR: '\x1b[31m', // Red
    };

    private static readonly LEVEL_NAMES = {
        [LogLevel.DEBUG]: 'DEBUG',
        [LogLevel.INFO]: 'INFO',
        [LogLevel.WARN]: 'WARN',
        [LogLevel.ERROR]: 'ERROR',
    };

    constructor(moduleName: string = 'Core', level: LogLevel = LogLevel.INFO) {
        this.moduleName = moduleName;
        this.currentLevel = level;
    }

    static getInstance(moduleName?: string, level?: LogLevel): Logger {  // create singleton instance
        if (!Logger.instance) {
            Logger.instance = new Logger(moduleName || 'Core', level);
        }
        return Logger.instance;
    }

    setLevel(level: LogLevel): void {
        this.currentLevel = level;
    }

    getLevel(): LogLevel {
        return this.currentLevel;
    }

    private formatMessage(level: LogLevel, message: string): string {
        const levelName = Logger.LEVEL_NAMES[level];
        const color = Logger.COLORS[levelName as keyof typeof Logger.COLORS];
        const reset = Logger.COLORS.RESET;

        return `${color}[${levelName}(${this.moduleName})]${reset} ${message}\n\n`;
    }

    private log(level: LogLevel, message: string): void {
        if (level < this.currentLevel) {
            return;
        }

        const formattedMessage = this.formatMessage(level, message);
        process.stdout.write(formattedMessage);
    }

    debug(message: string): void {
        this.log(LogLevel.DEBUG, message);
    }

    info(message: string): void {
        this.log(LogLevel.INFO, message);
    }

    warn(message: string): void {
        this.log(LogLevel.WARN, message);
    }

    error(message: string): void {
        this.log(LogLevel.ERROR, message);
    }

    // Static methods for quick access
    static debug(message: string, moduleName?: string): void {
        const logger = new Logger(moduleName || 'Core');
        logger.debug(message);
    }

    static info(message: string, moduleName?: string): void {
        const logger = new Logger(moduleName || 'Core');
        logger.info(message);
    }

    static warn(message: string, moduleName?: string): void {
        const logger = new Logger(moduleName || 'Core');
        logger.warn(message);
    }

    static error(message: string, moduleName?: string): void {
        const logger = new Logger(moduleName || 'Core');
        logger.error(message);
    }

    // Method to create a logger instance for a specific module
    static createModuleLogger(moduleName: string, level?: LogLevel): Logger {
        return new Logger(moduleName, level);
    }
}

// Export a default logger instance
export const logger = Logger.getInstance(); 
/*
just one instance for anything
*/ 

// Export convenience functions
export const log = {
    debug: (message: string, moduleName?: string) => Logger.debug(message, moduleName),
    info: (message: string, moduleName?: string) => Logger.info(message, moduleName),
    warn: (message: string, moduleName?: string) => Logger.warn(message, moduleName),
    error: (message: string, moduleName?: string) => Logger.error(message, moduleName),
};

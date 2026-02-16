export enum LogLevel {
    DEBUG,
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
    public contLogger: number;
    private static instance: Logger;
    private currentLevel: LogLevel;
    private moduleName: string;

    // ANSI color codes - simplified for better readability
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

    constructor(moduleName: string = 'root', level?: LogLevel) {
        this.moduleName = moduleName;
        this.contLogger = 0;
        // Check for DEBUG environment variable
        if (level === undefined) {
            this.currentLevel = process.env.DEBUG === 'true' ? LogLevel.DEBUG : LogLevel.INFO;
        } else {
            this.currentLevel = level;
        }
    }

    static getInstance(moduleName?: string, level?: LogLevel): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger(moduleName || 'root', level);
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
        if (this.contLogger === 0 ) {
            return `\n\n${color}[${levelName}(${this.moduleName})]${reset} ${message}`;    
        }
        return `\n${color}[${levelName}(${this.moduleName})]${reset} ${message}`;   
        
    }

    private log(level: LogLevel, message: string): void {
        if (level < this.currentLevel) {
            return;
        }
        
        const formattedMessage = this.formatMessage(level, message);
        process.stdout.write(formattedMessage);
    }

    debug(message: string): void {
        this.contLogger++;
        this.log(LogLevel.DEBUG, message);
    }

    info(message: string): void {
        this.contLogger++;
        this.log(LogLevel.INFO, message);
    }

    warn(message: string): void {
        this.contLogger++;
        this.log(LogLevel.WARN, message);
    }

    error(message: string): void {
        this.contLogger++;
        this.log(LogLevel.ERROR, message);
    }

    // Static methods for quick access
    static debug(message: string, moduleName?: string): void {
        const logger = new Logger(moduleName || 'root');
        logger.debug(message);
    }

    static info(message: string, moduleName?: string): void {
        const logger = new Logger(moduleName || 'root');
        logger.info(message);
    }

    static warn(message: string, moduleName?: string): void {
        const logger = new Logger(moduleName || 'root');
        logger.warn(message);
    }

    static error(message: string, moduleName?: string): void {
        const logger = new Logger(moduleName || 'root');
        logger.error(message);
    }

    // Method to create a logger instance for a specific module
    static createModuleLogger(moduleName: string, level?: LogLevel): Logger {
        return new Logger(`embedbox:${moduleName}`, level);
    }
}

// Export a default logger instance
export const logger = Logger.getInstance();

// Export convenience functions
export const log = {
    debug: (message: string, moduleName?: string) => Logger.debug(message, moduleName),
    info: (message: string, moduleName?: string) => Logger.info(message, moduleName),
    warn: (message: string, moduleName?: string) => Logger.warn(message, moduleName),
    error: (message: string, moduleName?: string) => Logger.error(message, moduleName),
};

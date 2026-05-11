import chalk from 'chalk';

const debugEnabled = process.env.LOG_LEVEL === 'debug' || process.env.NODE_ENV !== 'production';

const logger = {
    info: (message, ...args) => console.log(`${chalk.blue('[INFO]')} ${message}`, ...args),
    success: (message, ...args) => console.log(`${chalk.green('[SUCCESS]')} ${message}`, ...args),
    warn: (message, ...args) => console.log(`${chalk.yellow('[WARN]')} ${message}`, ...args),
    error: (message, stack) => {
        console.log(`${chalk.red('[ERROR]')} ${message}`);
        if (stack) console.error(stack);
    },
    db: (message) => console.log(`${chalk.magenta('[DATABASE]')} ${message}`),
    cmd: (message) => console.log(`${chalk.cyan('[COMMANDS]')} ${message}`),
    event: (message) => console.log(`${chalk.hex('#FFA500')('[EVENTS]')} ${message}`),
    debug: (message, ...args) => {
        if (debugEnabled) {
            console.log(`${chalk.gray('[DEBUG]')} ${message}`, ...args);
        }
    }
};

export default logger;

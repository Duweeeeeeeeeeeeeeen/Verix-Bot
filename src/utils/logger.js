import chalk from 'chalk';

const logger = {
    info: (message) => console.log(`${chalk.blue('[INFO]')} ${message}`),
    success: (message) => console.log(`${chalk.green('[SUCCESS]')} ${message}`),
    warn: (message) => console.log(`${chalk.yellow('[WARN]')} ${message}`),
    error: (message, stack) => {
        console.log(`${chalk.red('[ERROR]')} ${message}`);
        if (stack) console.error(stack);
    },
    db: (message) => console.log(`${chalk.magenta('[DATABASE]')} ${message}`),
    cmd: (message) => console.log(`${chalk.cyan('[COMMANDS]')} ${message}`),
    event: (message) => console.log(`${chalk.hex('#FFA500')('[EVENTS]')} ${message}`)
};

export default logger;

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFolders = await fs.readdir(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        const commandFiles = (await fs.readdir(folderPath)).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const fileUri = `file://${filePath.replace(/\\/g, '/')}`;
            const command = (await import(fileUri)).default;

            if (command.data && command.execute) {
                client.commands.set(command.data.name, command);
                logger.cmd(`Loaded command: ${command.data.name}`);
            } else {
                logger.warn(`The command at ${filePath} is missing required properties.`);
            }
        }
    }
};

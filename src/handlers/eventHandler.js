import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async (client) => {
    const eventsPath = path.join(__dirname, '../events');
    const eventFolders = await fs.readdir(eventsPath);

    for (const folder of eventFolders) {
        const folderPath = path.join(eventsPath, folder);
        const eventFiles = (await fs.readdir(folderPath)).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(folderPath, file);
            // In ESM, we need to convert path to a file URI for dynamic import on Windows
            const fileUri = `file://${filePath.replace(/\\/g, '/')}`;
            const event = (await import(fileUri)).default;

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
            
            logger.event(`Loaded event: ${event.name}`);
        }
    }
};

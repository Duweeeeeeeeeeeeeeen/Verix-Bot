import fs from 'fs';
const path = 'it.json';
const content = fs.readFileSync(path, 'utf8');
let updated = content;
if (!content.includes('"common.roles"')) {
    updated = content.replace('"common.no_results": "Nessun risultato trovato",', '"common.no_results": "Nessun risultato trovato",\n  "common.roles": "ruoli",');
}
fs.writeFileSync(path, updated, 'utf8');
console.log('Updated it.json for common.roles');

import fs from 'fs';
const path = 'it.json';
const content = fs.readFileSync(path, 'utf8');
const updated = content.replace('"reactionroles.default_role_label": "Nuovo Ruolo"', '"reactionroles.default_role_label": "Nuovo Ruolo",\n  "reactionroles.default_panel_name": "Pannello Reaction Roles",\n  "reactionroles.example_role": "Ruolo Esempio"');
fs.writeFileSync(path, updated, 'utf8');
console.log('Updated it.json');

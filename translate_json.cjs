const fs = require('fs');
const translate = require('translate-google');
const path = require('path');

const localesDir = path.join(__dirname, 'dashboard', 'client', 'src', 'locales');
const enFile = path.join(localesDir, 'en.json');
const esFile = path.join(localesDir, 'es.json');
const frFile = path.join(localesDir, 'fr.json');

const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
const esData = JSON.parse(fs.readFileSync(esFile, 'utf8'));
const frData = JSON.parse(fs.readFileSync(frFile, 'utf8'));

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function translateFile(targetData, targetFile, langCode) {
    console.log(`Starting translation for ${langCode}...`);
    const keysToTranslate = [];

    // Find keys that need translation (where target is same as en, meaning untranslated)
    for (const key in enData) {
        if (targetData[key] === enData[key] && isNaN(enData[key])) {
            keysToTranslate.push(key);
        }
    }

    console.log(`Found ${keysToTranslate.length} keys to translate for ${langCode}`);

    const batchSize = 30; // Translate in small batches to avoid rate limits
    for (let i = 0; i < keysToTranslate.length; i += batchSize) {
        const batchKeys = keysToTranslate.slice(i, i + batchSize);
        const objToTranslate = {};
        
        batchKeys.forEach(key => {
            // Revert placeholders so they don't get translated (e.g. {user} -> __USER__)
            let text = enData[key];
            text = text.replace(/\{(\w+)\}/g, '<span class="$1"></span>'); // Fake HTML to preserve
            objToTranslate[key] = text;
        });

        try {
            console.log(`Translating batch ${i} to ${i + batchKeys.length} for ${langCode}...`);
            const translatedObj = await translate(objToTranslate, { to: langCode });
            
            // Save results
            for (const key in translatedObj) {
                let transText = translatedObj[key];
                // Revert fake HTML back to {placeholder}
                transText = transText.replace(/<span class="(\w+)"><\/span>/g, '{$1}');
                // Some translation APIs add spaces in HTML
                transText = transText.replace(/<span class="(\w+)"> <\/span>/g, '{$1}');
                transText = transText.replace(/<span class = "(\w+)"> <\/span>/g, '{$1}');
                targetData[key] = transText;
            }

            // Save incrementally
            fs.writeFileSync(targetFile, JSON.stringify(targetData, null, 2), 'utf8');
            
            // Wait 2 seconds to avoid rate limiting
            await delay(2000);
        } catch (err) {
            console.error(`Error translating batch for ${langCode}:`, err);
            // Wait longer on error and retry
            await delay(5000);
            i -= batchSize; // retry this batch
        }
    }
    console.log(`Translation for ${langCode} completed!`);
}

async function run() {
    await translateFile(esData, esFile, 'es');
    await translateFile(frData, frFile, 'fr');
    console.log("All translations finished!");
}

run();

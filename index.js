const fs = require('fs');

const path = 'scripts';

fs.readdir(path, async function (err, files) {
    if (err) return;

    const scripts = files.map(async file => await require(`./${path}/${file}`));

    for (const file of files) {
        try {
            console.log(`Running script ${file}...`);
            const script = await require(`./${path}/${file}`)()
        } catch (e) {
            console.log(`Error with ${file}`);
        }
    }
});
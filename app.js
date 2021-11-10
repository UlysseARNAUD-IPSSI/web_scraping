const {terminal} = require('terminal-kit');
const fs = require('fs');
const {dirname} = require('path');

global.headless = true;

terminal.clear();

terminal.cyan('Choisissez un site :\n');

const path = `${process.cwd()}/projet`;

const items = [...fs.readdirSync(path), 'exit'];

terminal.gridMenu(items, (error, response) => {
    const {selectedIndex, selectedText, x, y} = response;

    if ('exit' === selectedText) {
        terminal("\r\nBye !\n\r\n");
        process.exit();
        return;
    }

    global.projectPath = `${dirname(require.main.filename)}/projet/${selectedText}`;

    require(`./projet/${selectedText}`);
});
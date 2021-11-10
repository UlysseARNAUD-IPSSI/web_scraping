const {terminal} = require('terminal-kit');
const fs = require('fs');
const {dirname} = require('path');

global.headless = true;

terminal.clear();

terminal.cyan('Choisissez un site :\n');

const path = `${process.cwd()}/projet`;

const items = fs.readdirSync(path);

terminal.gridMenu(items, (error, response) => {
    const {selectedIndex, selectedText, x, y} = response;
    // terminal('\n').eraseLineAfter.green("#%s selected: %s (%s,%s)\n", selectedIndex, selectedText, x, y);
    // process.exit();

    global.projectPath = `${dirname(require.main.filename)}/projet/${selectedText}`;

    require(`./projet/${selectedText}`);
});
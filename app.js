require('./bootstrap');
const {terminal,fs,dirname} = global;


(() => {
    global.headless = true;

    mainMenu();
})();

function mainMenu() {
    terminal.clear();

    terminal.cyan('Menu principal\n');
    terminal.cyan('Que souhaitez-vous faire ?\n');

    const items = ['scraping', 'traitement', 'quitter'];

    terminal.gridMenu(items, (error, response) => {

        if (error) return;

        const {selectedIndex, selectedText, x, y} = response;

        if ('quitter' === selectedText) {
            terminal("\r\nBye !\n\r\n");
            process.exit();
            return;
        }

        if ('scraping' === selectedText) return scraping();

        if ('traitement' === selectedText) return traitement();

        process.exit();
    });
}


function scraping ()  {
    terminal.clear();

    terminal.cyan('Choisissez un site :\n');

    const path = `${process.cwd()}/projet`;

    const items = [...fs.readdirSync(path), 'retour', 'quitter'];

    terminal.gridMenu(items, (error, response) => {
        const {selectedIndex, selectedText, x, y} = response;

        if ('quitter' === selectedText) {
            terminal("\r\nBye !\n\r\n");
            process.exit();
            return;
        }

        if ('retour' === selectedText) return mainMenu();

        global.projectPath = `${dirname(require.main.filename)}/projet/${selectedText}`;

        terminal.clear();

        require(`./projet/${selectedText}`);

        process.exit();
    });
}


function traitement ()  {
    terminal.clear();

    terminal.cyan('Choisissez un script :\n');

    const path = `${process.cwd()}/scripts`;

    const items = [...fs.readdirSync(path).filter(e=>-1 < e.indexOf('.js')).map(e=>e.replace('.js', '')), 'retour', 'quitter'];

    terminal.gridMenu(items, (error, response) => {
        let {selectedIndex, selectedText, x, y} = response;

        if ('quitter' === selectedText) {
            terminal("\r\nBye !\n\r\n");
            process.exit();
            return;
        }

        if ('retour' === selectedText) return mainMenu();

        global.scriptPath = `${dirname(require.main.filename)}/scripts/${selectedText}.js`;

        terminal.clear();

        require(`./scripts/${selectedText}`);

        process.exit();
    });
}
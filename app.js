require('./bootstrap');
const {terminal, fs, dirname} = global;

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

        if ('scraping' === selectedText) return _genericMenu({
            path: `${dirname(require.main.filename)}/projet`,
            message: 'Choisissez un projet',
            directories: true
        });

        if ('traitement' === selectedText) return _genericMenu({
            path: `${dirname(require.main.filename)}/scripts`,
            message: 'Choisissez un script'
        });

        process.exit();
    });
}

function _genericMenu(
    {
        path = `${dirname(require.main.filename)}`,
        message = "Choisissez une entrée",
        directories = false,
        back = true
    }) {
    terminal.clear();
    terminal.cyan(`${message} :\n\r`);

    let items = fs.readdirSync(path);

    if (!directories) items = items.filter(e => -1 < e.indexOf('.js')).map(e => e.replace('.js', ''))
    if (back) items.push('retour');
    items.push('quitter');

    terminal.gridMenu(items, (error, response) => {
        const {selectedIndex, selectedText, x, y} = response;

        if ('quitter' === selectedText) {
            terminal("\r\nBye !\n\r\n");
            process.exit();
            return;
        }
        if ('retour' === selectedText) return mainMenu();

        terminal.clear();
        // TODO : Tester le bloc else (cas des projets)
        if (!directories) require(`${path}/${selectedText}`);
        else require(`${path}/${selectedText}/index`);
        terminal.clear();
        process.exit();
    });
}
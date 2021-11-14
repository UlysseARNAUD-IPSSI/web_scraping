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

    const items = ['exercices', 'scraping', 'traitement', 'quitter'];

    terminal.gridMenu(items, (error, response) => {
        if (error) return;
        const {selectedIndex, selectedText, x, y} = response;

        if ('quitter' === selectedText) {
            terminal("\r\nBye !\n\r\n");
            process.exit();
            return;
        }

        const choices = {
            exercices: {
                path: `${dirname(require.main.filename)}/exercices`,
                message: 'Choisissez un exercice',
                directories: true
            },
            scraping: {
                path: `${dirname(require.main.filename)}/projet`,
                message: 'Choisissez un projet',
                directories: true
            },
            traitement: {
                path: `${dirname(require.main.filename)}/scripts`,
                message: 'Choisissez un script'
            }
        };

        const choice = choices[selectedText] ?? {};
        if (!!choice) return _genericMenu(choice);

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

        global.projectPath = `${path}/${selectedText}`;

        require(projectPath);

        terminal.clear();
        process.exit();
    });
}
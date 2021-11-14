global.DateHelper = {
    now() {
        return (new Date).toLocaleString(Intl.DateTimeFormat().resolvedOptions().locale).replace(', ', ' ');
    }
}
global.fs = require('fs');
global.terminal = require('terminal-kit').terminal;
global.dirname = require('path').dirname;
global.relative = require('path').relative;
global.Logger = function (path) {
    const logsPath = `${relative(__dirname,path)}\\logs`;
    if (!fs.existsSync(logsPath)) fs.mkdirSync(logsPath, {recursive: true});

    const files = [
        ['name', 'color'],
        ['info', null],
        ['error', 'red'],
        ['debug', 'blue'],
        ['success', 'green'],
    ];

    for (const [fileName, color] of files.splice(1)) {
        const file = fs.createWriteStream(`.\\${logsPath}\\${fileName}.txt`);
        file.on('error', err => {
            if (err) console.error(err);
        });
        this[fileName] = message => _generic.bind(file)(color, message);
    }

    function _generic(color, message) {
        const date = DateHelper.now();
        const content = `[${date}] ${message}\n`;
        if (!!color) terminal[color](content);
        else terminal(content);
        this.write(content);
        // variable.end();
        return true;
    }
}
global.puppeteer = (puppeteer => {
    puppeteer.use(require('puppeteer-extra-plugin-stealth')());
    return puppeteer;
})(require('puppeteer-extra'));
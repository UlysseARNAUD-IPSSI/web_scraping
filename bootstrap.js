global.DateHelper = {
    now() {
        return (new Date).toLocaleString(Intl.DateTimeFormat().resolvedOptions().locale).replace(', ', ' ');
    }
}

global.fs = require('fs');

global.terminal = require('terminal-kit').terminal;

global.dirname = require('path').dirname;

global.Logger = function (path) {
    const logsPath = `${path}\\logs`;

    if (!fs.existsSync(logsPath)) fs.mkdirSync(logsPath, {recursive: true});

    const options = {flags: 'w', encoding: 'utf-8',mode: 0o666};
    const onError = err => {
        if (err) throw err;
    };

    // fs.writeFile(`${logsPath}\\info.txt`, '', onError);
    const _infoStream = fs.createWriteStream(`${logsPath}\\info.txt`, options);
    // fs.writeFile(`${logsPath}\\error.txt`, '', onError);
    const _errorStream = fs.createWriteStream(`${logsPath}\\error.txt`, options);
    // fs.writeFile(`${logsPath}\\debug.txt`, '', onError);
    const _debugStream = fs.createWriteStream(`${logsPath}\\debug.txt`, options);

    _infoStream.on('error', function(e) { console.error(e); });
    _errorStream.on('error', function(e) { console.error(e); });
    _debugStream.on('error', function(e) { console.error(e); });

    this.info = message => _generic(null, _infoStream, message);
    this.error = message => _generic('red', _errorStream, message);
    this.debug = message => _generic('blue', _debugStream, message);

    // this.close = () => [this._infoStream, this._errorStream, this._debugStream].forEach(file => file.end()),true;

    function _generic(command, variable, message) {
        const date = DateHelper.now();
        const content = `[${date}] ${message}\n`;
        if (!!command) terminal[command](content);
        else terminal(content);
        variable.write(content);
        // variable.end();
    }
}

global.puppeteer = (puppeteer => {
    puppeteer.use(require('puppeteer-extra-plugin-stealth')());
    return puppeteer;
})(require('puppeteer-extra'));
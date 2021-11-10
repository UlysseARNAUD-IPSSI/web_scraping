const fs = require('fs');
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const {dirname} = require('path');
const {terminal} = require('terminal-kit');

const logsPath = `${dirname(require.main.filename)}/logs/`;

if (!fs.existsSync(logsPath)) {
    fs.mkdirSync(logsPath, {recursive: true});
}

const infoStream = fs.createWriteStream(`${logsPath}/info.txt`);
const errorStream = fs.createWriteStream(`${logsPath}/error.txt`);
const debugStream = fs.createWriteStream(`${logsPath}/debug.txt`);

global.Logger = {
    _generic(command, variable, message) {
        const date = now();
        const content = `${date} : ${message}\n`;

        if (!!command) terminal[command](content);
        else terminal(content);

        variable.write(content);
    },
    info(message) {
        return this._generic(null, infoStream, message);
    },
    error(message) {
        return this._generic('red', errorStream, message);
    },
    debug(message) {
        return this._generic('blue', debugStream, message);
    },
}

puppeteer.use(StealthPlugin());

terminal.clear();


let browser;

let isLaunching = false;
let runningTasks = [];

global.run = async function run(name, url, callable) {

    runningTasks.push(name);

    if (!isLaunching) {
        Logger.debug('Launching browser');
        browser = await puppeteer.launch({
            headless: -1 < process.argv.indexOf('--headless'),
            args: ['--disable-web-security'],
        });
        isLaunching = true;
    }

    const limit = 5;
    let page, cursorLimit = 0;

    while (true) {
        if (cursorLimit >= limit) {
            Logger.error(`Cannot open page "${url}"`);
            break;
        }
        try {
            Logger.debug('Opening new page');
            page = await browser.newPage();
            Logger.debug(`Going to "${url}"`);
            await page.goto(url);
            break;
        } catch (e) {
            cursorLimit++;
            Logger.error(e);
            if (!!page) if (!!page.close) page.close();
        }
    }

    let data;

    try {
        page.original_$eval = page.$eval;
        page.original_$$eval = page.$$eval;

        page.$eval = $eval.bind(page);
        page.$$eval = $$eval.bind(page);

        data = await callable(page);
    } catch (e) {
        Logger.error(e);
    }


    /*const timeouts = [500, 3000, 10000, 30000, 60000];
    cursorLimit = 0;
    while(true) {
        if (cursorLimit >= limit) {
            const message = `Error while opening "${url}".`;
            Logger.error(message);
            break;
        }

        const timeout = timeouts[cursorLimit];

        try {
            await page.waitForNavigation({timeout, waitUntil: 'load'});
            data = await callable();
            break;
        } catch (e) {
            cursorLimit++;
            Logger.error(e);
        }
    }*/

    Logger.debug('Closing page');
    await page.close();

    runningTasks.splice(runningTasks.indexOf(name), 1);

    setTimeout(async () => {
        if (1 > runningTasks.length) {
            await browser.close();
        }
    }, 2000);

    const path = `${dirname(require.main.filename)}/result/${name}`;

    writeJSON(path, url, {data});

    return 0;
};

global.$eval = async function $eval(selector, callback, waitingMessage, argumentsWaitForSelector = [], argumentsEval = []) {
    return _genericEval(this, '$eval', selector, callback, waitingMessage, argumentsWaitForSelector, argumentsEval)
}

global.$$eval = async function $$eval(selector, callback, waitingMessage, argumentsWaitForSelector = [], argumentsEval = []) {
    return _genericEval(this, '$$eval', selector, callback, waitingMessage, argumentsWaitForSelector, argumentsEval)
}

async function _genericEval(page, name, selector, callback, waitingMessage, argumentsWaitForSelector = [], argumentsEval = []) {
    Logger.info(waitingMessage ?? `Waiting for element "${selector}"`);
    let element = undefined;
    try {
        await page.waitForSelector(selector, ...argumentsWaitForSelector);
        element = await page[`original_${name}`](selector, callback, ...argumentsEval);
    } catch (e) {
        Logger.error(e);
    }
    return element;
}

function writeJSON(path, url, content) {
    const date = now();

    path = `${path}.json`;
    const pathdir = dirname(path);

    if (!fs.existsSync(pathdir)) {
        fs.mkdirSync(pathdir, {recursive: true});
    }

    fs.writeFileSync(path, JSON.stringify({url, date, ...content}));

    return 0;
}

function now() {
    return (new Date).toLocaleString(Intl.DateTimeFormat().resolvedOptions().locale).replace(', ', ' ');
}
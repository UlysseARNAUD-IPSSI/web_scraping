const fs = require('fs');
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const {dirname} = require('path');

puppeteer.use(StealthPlugin());


let browser;

let isLaunching = false;
let runningTasks = [];

global.run = async function run(name, url, callable) {

    runningTasks.push(name);

    if (!isLaunching) {
        console.log('Launching browser...');
        browser = await puppeteer.launch({
            headless: false,
            args: ['--disable-web-security'],
        });
        isLaunching = true;
    }

    console.log('Opening new page...');
    const page = await browser.newPage();

    callable = callable.bind(page);

    _genericEval = _genericEval.bind(page);
    global.$eval = $eval;
    global.$$eval = $$eval;

    await page.goto(url);

    let data;

    try {
        await page.waitForNavigation({timeout: 500});
        data = await callable();
    }
    catch(e) {
        console.error(`Error on "${url}"`);
    }

    runningTasks.splice(runningTasks.indexOf(name), 1);

    console.log('Closing page...');
    await page.close();

    setTimeout(async () => {
        if (1 > runningTasks.length) {
            await browser.close();
        }
    }, 2000);

    const date = (new Date).toLocaleString(browser.language).replace(', ',' ');

    const path = `${dirname(require.main.filename)}/result`;

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {recursive: true});
    }

    fs.writeFileSync(`${path}/${name}.json`, JSON.stringify({url, date, data}));

    return 0;
};

async function $eval(selector, callback, waitingMessage, argumentsWaitForSelector = [], argumentsEval = [], onError = error => false) {
    return _genericEval('$eval', selector, callback, waitingMessage, argumentsWaitForSelector, argumentsEval, onError)
}

async function $$eval(selector, callback, waitingMessage, argumentsWaitForSelector = [], argumentsEval = [], onError = error => false) {
    return _genericEval('$$eval', selector, callback, waitingMessage, argumentsWaitForSelector, argumentsEval, onError)
}

async function _genericEval(name, selector, callback, waitingMessage, argumentsWaitForSelector = [], argumentsEval = [], onError = error => false) {
    console.log(waitingMessage ?? `Waiting for element ${selector}`);
    let element = undefined;
    try {
        await this.waitForSelector(selector, ...argumentsWaitForSelector);
        element = await this[name](selector, callback, ...argumentsEval);
    } catch (e) {
        onError(e);
        // console.error(`No element at selector "${selector}"`);
    }
    return element;
}

global.run = run;
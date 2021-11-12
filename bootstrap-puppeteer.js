require('./bootstrap');

const {fs,puppeteer,dirname} = global;

let browser;

let isLaunching = false;
let runningTasks = [];

global.headless = global.headless ?? -1 < process.argv.indexOf('--headless');

const logger = new Logger(dirname(require.main.filename));

global.run = async function run(name, url, callable) {

    runningTasks.push(name);

    if (!isLaunching) {
        logger.debug('Launching browser');
        browser = await puppeteer.launch({
            headless: global.headless,
            args: ['--disable-web-security'],
        });
        isLaunching = true;
    }

    const limit = 5;
    let page, cursorLimit = 0;

    while (true) {
        if (cursorLimit >= limit) {
            logger.error(`Cannot open page "${url}"`);
            break;
        }
        try {
            logger.debug('Opening new page');
            page = await browser.newPage();
            logger.debug(`Going to "${url}"`);
            await page.goto(url);
            break;
        } catch (e) {
            cursorLimit++;
            logger.error(e);
            if (!!page) if (!!page.close) page.close();
        }
    }

    page.original_$eval = page.$eval;
    page.original_$$eval = page.$$eval;
    page.$eval = $eval.bind(page);
    page.$$eval = $$eval.bind(page);

    let data;

    try {
        data = await callable(page);
    } catch (e) {
        logger.error(e);
    }

    if (!global.headless ?? false) {
        const timeouts = [500, 3000, 10000, 30000, 60000];
        cursorLimit = 0;
        while (true) {
            if (cursorLimit >= limit) {
                const message = `Error while opening "${url}".`;
                logger.error(message);
                break;
            }

            try {
                await page.waitForNavigation({timeout: timeouts[cursorLimit], waitUntil: 'load'});
                data = await callable();
                break;
            } catch (e) {
                cursorLimit++;
                logger.error(e);
            }
        }
    }

    logger.debug('Closing page');
    await page.close();

    runningTasks.splice(runningTasks.indexOf(name), 1);

    setTimeout(async () => {
        if (1 > runningTasks.length) await browser.close();
    }, 2000);

    writeJSON(`${global.projectPath}/result/${name}`, url, {data});

    return 0;
};

global.$eval = async function $eval(selector, callback, waitingMessage, argumentsWaitForSelector = [], argumentsEval = []) {
    return _genericEval(this, '$eval', selector, callback, waitingMessage, argumentsWaitForSelector, argumentsEval)
}

global.$$eval = async function $$eval(selector, callback, waitingMessage, argumentsWaitForSelector = [], argumentsEval = []) {
    return _genericEval(this, '$$eval', selector, callback, waitingMessage, argumentsWaitForSelector, argumentsEval)
}

async function _genericEval(page, name, selector, callback, waitingMessage, argumentsWaitForSelector = [], argumentsEval = []) {
    logger.info(waitingMessage ?? `Waiting for element "${selector}"`);
    let element = undefined;
    try {
        await page.waitForSelector(selector, ...argumentsWaitForSelector);
        element = await page[`original_${name}`](selector, callback, ...argumentsEval);
    } catch (e) {
        logger.error(e);
    }
    return element;
}

function writeJSON(path, url, content) {
    const pathdir = dirname((path = `${path}.json`));
    if (!fs.existsSync(pathdir)) fs.mkdirSync(pathdir, {recursive: true});
    fs.writeFileSync(path, JSON.stringify({url, date: now(), ...content}));
    return 0;
}
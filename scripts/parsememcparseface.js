
const puppeteer = require("puppeteer");
const fs = require("fs");

module.exports = async function () {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    const url = 'https://pythonprogramming.net/parsememcparseface/';
    await page.goto(url);

    console.log('Waiting for header...');
    await page.waitForSelector('.body > table > tbody > tr');
    const header = await page.$eval('.body > table > tbody > tr', element => {
        return Array.from(element.querySelectorAll('th')).map(cell => cell.innerText.trim());
    });

    console.log('Waiting for rows...');
    await page.waitForSelector('.body > table > tbody > tr:not(:first-child)');
    const rows = await page.$$eval('.body > table > tbody > tr:not(:first-child)', elements => {
        return Array.from(elements).map(element => Array.from(element.querySelectorAll('td')).map(cell => cell.innerText.trim()));
    });

    console.log('Waiting for image...');
    await page.waitForSelector('.body > .card > .card-content > .responsive-img');
    const image = await page.$eval('.body > .card > .card-content > .responsive-img', element => {
        return element.getAttribute('src');
    });


    await browser.close();


    console.log('Writing file with results...');
    const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

    const datas = {
        date,
        url,
        data: {
            table: {
                header, rows
            },
            image
        }
    }

    const path = `result`;

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {recursive: true});
    }

    fs.writeFileSync(`${path}/parsememcparseface.json`, JSON.stringify(datas));

    return 0;
};
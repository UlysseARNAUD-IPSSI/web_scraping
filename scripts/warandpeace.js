const puppeteer = require("puppeteer");
const fs = require("fs");

module.exports = async function () {
    console.log('Launching browser...')
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    const url = 'http://www.pythonscraping.com/pages/warandpeace.html';
    await page.goto(url);

    console.log('Waiting for green words...');
    await page.waitForSelector('.green');
    const green = await page.$$eval('.green', elements => {
        return Array.from(elements).map(element => element.innerHTML.trim());
    });
    console.log('Waiting for red words...');
    await page.waitForSelector('.red');
    const red = await page.$$eval('.red', elements => {
        return Array.from(elements).map(element => element.innerHTML.trim());
    });
    console.log('Waiting for red & green words...');
    await page.waitForSelector('.red,.green');
    const both = await page.$$eval('.red,.green', elements => {
        return Array.from(elements).map(element => element.innerHTML.trim());
    });

    /*
    Récupérer ts les mots en vert (ensuite en rouge) ? Le 1er, Les 5 premiers ? Indice => 1è mot en vert : Anna

    Récupérer ts les mots qui sont soit en rouge soit en vert ? Le 1er, Les 5 premiers ?

    Récupérer ts les mots qui correspondent à "the prince" en miniscule et coloré en vert ?
     */


    await browser.close();

    console.log('Writing file with results...');
    const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

    const datas = {
        date,
        url,
        data: {
            green,
            red,
            both
        }
    }

    const path = `result`;

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {recursive: true});
    }

    fs.writeFileSync(`${path}/warandpeace.json`, JSON.stringify(datas));

    return 0;
};
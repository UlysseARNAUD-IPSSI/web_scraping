require('../bootstrap');

(async function() {
    await run(
        'parsememcparseface',
        'https://pythonprogramming.net/parsememcparseface/',
        async page => {
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

            return {
                table: {header, rows},
                image
            };
        }
    );

    await run(
        'warandpeace',
        'http://www.pythonscraping.com/pages/warandpeace.html',
        async page => {

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

            return {green, red, both};
        }
    );
})()
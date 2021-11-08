require('../../bootstrap');

(async function() {
    await run(
        'parsememcparseface',
        'https://pythonprogramming.net/parsememcparseface/',
        async page => {

            const header = await $eval('.body > table > tbody > tr', element => {
                return Array.from(element.querySelectorAll('th')).map(cell => cell.innerText.trim());
            }, 'Waiting for header...');

            const rows = await $eval('.body > table > tbody > tr:not(:first-child)', elements => {
                return Array.from(elements).map(element => Array.from(element.querySelectorAll('td')).map(cell => cell.innerText.trim()));
            }, 'Waiting for rows...');

            const image = await $eval('.body > .card > .card-content > .responsive-img', element => {
                return element.getAttribute('src');
            }, 'Waiting for image...');

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

            const green = await $$eval('.green', elements => {
                return Array.from(elements).map(element => element.innerHTML.trim());
            },'Waiting for green words...');

            const red = await $$eval('.red', elements => {
                return Array.from(elements).map(element => element.innerHTML.trim());
            }, 'Waiting for red words...');

            const both = await page.$$eval('.red,.green', elements => {
                return Array.from(elements).map(element => element.innerHTML.trim());
            }, 'Waiting for red & green words...');

            return {green, red, both};
        }
    );
})()
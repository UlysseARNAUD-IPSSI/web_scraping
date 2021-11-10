require('../../bootstrap');

global.datas = {years: []};

(async function () {
    await run(
        'database',
        'http://www.planecrashinfo.com/database.htm',
        async page => {

            const years = await page.$eval('table:nth-of-type(2)', element => {
                return Array.from(element.querySelectorAll('td a')).map(cell => [cell.innerText.trim(), cell.href.trim()]);
            }, 'Waiting for table...');

            datas.years = years;

            Logger.info(years.map(e=>e[0]));

            return {
                years
            };
        }
    );

    for (const [year, url] of global.datas.years) {
        await run(`database/${year}`, url, async page => {

                const table = await page.$eval('table', element => {
                    const rows = Array.from(element.querySelectorAll('tr'));
                    const header = ['url', ...Array.from(rows.shift().querySelectorAll('td')).map(cell => cell.innerText.trim())];
                    const body = rows.map(row => Array.from(row.querySelectorAll('td')).map(cell => cell.innerText.trim()));
                    return {header, body};
                }, `Waiting for year ${year}...`);

                return {table};
            }
        );
    }

})();
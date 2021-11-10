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

            return {years};
        }
    );

    for (const [year, url] of global.datas.years) {
        await run(`database/${year}`, url, async page => {

                const table = await page.$eval('table', element => {
                    const rows = Array.from(element.querySelectorAll('tr'));
                    const header = ['url', ...Array.from(rows.shift().querySelectorAll('td')).map(cell => cell.innerText.trim())];
                    const body = rows.map(row => [row.querySelector('a').href.trim(), ...Array.from(row.querySelectorAll('td')).map(cell => cell.innerText.trim())]);
                    return {header, body};
                }, `Waiting for year ${year}...`);

                for (const row in table.body) {
                    let entry = {};

                    for (const index in table.header) {
                        entry[table.header[index]] = table.body[row][index];
                    }

                    const {url} = entry;

                    const id = url.substring(url.lastIndexOf('/') + 1).replace(/\.[^/.]+$/, "");

                    await run(`records/${year}/${id}`, url, async page => {

                        const header = await page.$$eval('tr>td:first-child', elements => {
                            return elements.map(element => element.innerText.replace(':', '').trim());
                        });

                        const body = await page.$$eval('tr>td:last-child', elements => {
                            return elements.map(element => element.innerText.trim());
                        });

                        return {header, body};

                    });
                }

                return {...table};
            }
        );
    }

})();
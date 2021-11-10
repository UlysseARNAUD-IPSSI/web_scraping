require('../../bootstrap');

global.datas = {years: [['name', 'url']]};

(async function () {
    await run(
        'database',
        'http://www.planecrashinfo.com/database.htm',
        async page => {
            const header = await page.$$eval('table:nth-of-type(3) tr', elements => elements.map(element => Array.from(element.children).map((element, index) => [element.innerText.trim().replace(':', ''), element.innerText.trim()][index])));
            const years = await page.$eval('table:nth-of-type(2)', element => Array.from(element.querySelectorAll('td a')).map(cell => [cell.innerText.trim(), cell.href.trim()]), 'Waiting for table...');
            datas.years = years;
            return {header, years};
        });

    for (const [year, url] of global.datas.years)
        await run(`database/${year}`, url, async page => {
            const table = await page.$eval('table', element => {
                const rows = Array.from(element.querySelectorAll('tr'));
                const header = ['url', ...Array.from(rows.shift().querySelectorAll('td')).map(cell => cell.innerText.trim())];
                const body = rows.map(row => [row.querySelector('a').href.trim(), ...Array.from(row.querySelectorAll('td')).map(cell => cell.innerText.trim())]);
                return {header, body};
            }, `Waiting for year ${year}...`);

            for (const row in table.body) {
                let entry = {};
                for (const index in table.header) entry[table.header[index]] = table.body[row][index];
                const {url} = entry;
                const id = url.substring(url.lastIndexOf('/') + 1).replace(/\.[^/.]+$/, "");
                await run(`records/${year}/${id}`, url, async page => {
                    const header = await page.$$eval('tr>td:first-child', elements => elements.map(element => element.innerText.replace(':', '').trim()));
                    const body = await page.$$eval('tr>td:last-child', elements => elements.map(element => element.innerText.trim()));
                    return {header, body};
                });
            }

            return {...table};
        });
})();
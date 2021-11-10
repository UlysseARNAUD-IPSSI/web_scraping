(module.exports = () => {
    require('../../bootstrap');
    global.datas = {years: [['name', 'url']]};
    (async function () {
        await run(
            'database',
            'https://aviation-safety.net/database/',
            async page => {
                const years = await page.$$eval('.preface + p + p > a', elements => elements.map(cell => [cell.innerText.trim(), cell.href.trim()]), 'Waiting for table...');
                datas.years = years;
                return {years};
            }
        );

        for (const [year, url] of global.datas.years) {
            await run(`database/${year}`, url, async page => {

                const table = await page.$eval('table', element => {
                    const rows = Array.from(element.querySelectorAll('tr'));
                    const header = ['url', ...Array.from(rows.shift().querySelectorAll('td')).map(cell => cell.innerText.trim())];
                    const body = rows.map(row => [row.querySelector('a').href.trim(), ...Array.from(row.querySelectorAll('td')).map(cell => cell.innerText.trim() ?? -1 < cell.children.length)]);
                    return {header, body};
                }, `Waiting for year ${year}...`);

                for (const row in table.body) {
                    let entry = {};
                    for (const index in table.header) entry[table.header[index]] = table.body[row][index];
                    const {url} = entry;
                    const id = url.substring(url.lastIndexOf('?id=') + 4);

                    await run(`records/${year}/${id}`, url, async page => {
                        const header = await page.$$eval('tr>td:first-child', elements => elements.map(element => element.innerText.replace(':', '').trim()));
                        const body = await page.$$eval('tr>td:last-child', elements => elements.map(element => element.innerText.trim()));
                        const narrative = await page.$eval('.caption + br + span', element => element.innerText.trim());
                        return {
                            header: [...header, 'Narrative'],
                            body: [...body, narrative]
                        };
                    });
                }

                return {...table};
            });
        }
    })();
})();
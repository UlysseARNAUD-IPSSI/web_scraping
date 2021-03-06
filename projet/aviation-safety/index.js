(module.exports = () => {
    require('../../bootstrap-puppeteer');
    global.pages = [];
    global.datas = {years: [['name', 'url']]};
    (async function () {
        await run('database', 'https://aviation-safety.net/database/', async page => {
            const years = await page.$$eval('.preface + p + p > a', elements => elements.map(cell => [cell.innerText.trim(), cell.href.trim()]), 'Waiting for table...');
            datas.years = years;
            return {years};
        });

        for (let [year, url] of global.datas.years.slice(23)) await runYear(year, 1, url);
    })();
})();

async function runYear(year, cursorPage, url) {
    await run(`database/${year}/${cursorPage}`, url, async page => {

        const table = await page.$eval('table', element => {
            const rows = Array.from(element.querySelectorAll('tr'));
            const header = ['url', ...Array.from(rows.shift().querySelectorAll('th,td')).map(cell => cell.innerText.trim())];
            const body = rows.map(row => [row.querySelector('a').href.trim(), ...Array.from(row.querySelectorAll('td')).map(cell => cell.innerText.trim() ?? -1 < cell.children.length)]);
            return {header, body};
        }, `Waiting for year ${year}${1 < cursorPage ? ` page ${cursorPage}` : ''}...`);

        for (const row in table.body) {
            let entry = {};
            for (const index in table.header) entry[table.header[index]] = table.body[row][index];
            const {url} = entry, id = url.substring(url.lastIndexOf('?id=') + 4);

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

        try {
            const nextLink = await page.$eval('.pagenumbers .current + a', element => element.href.trim(),
                'Waiting for next page link', [{timeout: 1000, waitUntil: 'load'}], [{timeout: 1000}]);
            if (nextLink) await runYear(year, cursorPage + 1, nextLink);
        } catch (e) {
            Logger.error(e);
        }

        return {...table};
    });
}
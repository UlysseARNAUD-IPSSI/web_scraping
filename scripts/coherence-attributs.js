(module.exports = () => {
    require('../bootstrap');
    const {Logger, fs} = global;

    const root = dirname(require.main.filename);

    const logger = new Logger(`${root}/scripts`);

    const result = { database: {}, records: {}};
    let numberError = 0;

    logger.info('Retrieving results of database');

    const path = `${process.cwd()}/projet`;
    const projects = fs.readdirSync(path);

    for (const project of projects) {

        logger.info(`"${project}" selected`);

        result.database[project] = {};
        result.records[project] = {};

        const projectPath = `${path}/${project}/result`;
        const databasePath = `${projectPath}/database`;
        const recordsPath = `${projectPath}/records`;

        if (!fs.existsSync(projectPath)) return;

        const database = fs.readdirSync(databasePath);

        for (const year of database) {
            logger.debug(`Loading year ${year.replace('.json', '')}`);
            try {
                // Avec aviation-safety...
                // planecrashinfo n'aime pas la ligne suivante, d'où le try catch.
                const yearPath = `${databasePath}/${year}`;
                const entries = fs.readdirSync(yearPath);
                for (const entry of entries) {
                    const {data} = JSON.parse(fs.readFileSync(`${yearPath}/${entry}`));
                    if (!data) {
                        numberError++;
                        continue;
                    }
                    const header = data.header ?? false;
                    if (!header) {
                        numberError++;
                        continue;
                    }
                    for (const attribute of header) {
                        if (!attribute) continue;
                        result.database[project][attribute] = (result.database[project][attribute] ?? 0) + 1;
                    }
                }
            } catch (e) {
                // Avec planecrashinfo...
                const yearPath = `${databasePath}/${year}`;
                const {data} = JSON.parse(fs.readFileSync(yearPath));
                if (!data) {
                    numberError++;
                    continue;
                }
                const header = data.header ?? false;
                if (!header) {
                    numberError++;
                    continue;
                }
                for (const attribute of header) {
                    if (!attribute) continue;
                    result.database[project][attribute] = (result.database[project][attribute] ?? 0) + 1 ?? 1;
                }
            }
        }

        logger.info('Retrieving results of records');

        const records = fs.readdirSync(recordsPath);
        for (const year of records) {
            logger.debug(`Loading year ${year}`);
            const yearPath = `${recordsPath}/${year}`;
            const entries = fs.readdirSync(yearPath);
            for (const entry of entries) {
                const {data} = JSON.parse(fs.readFileSync(`${yearPath}/${entry}`));
                if (!data) {
                    numberError++;
                    continue;
                }
                const header = data.header ?? false;
                if (!header) {
                    numberError++;
                    continue;
                }
                for (const attribute of header) {
                    if (!attribute) continue;
                    result.records[project][attribute] = (result.records[project][attribute] ?? 0) + 1;
                }
            }
        }


        const resultPath = `${root}/scripts/result`;

        if (!fs.existsSync(resultPath)) fs.mkdirSync(resultPath, {recursive: true});

        fs.writeFileSync(`${resultPath}/coherence-attributs.json`,
            JSON.stringify({date: DateHelper.now(), data: result}), 'utf8', err => {
                if (err) return logger.error(err);
            }, {encoding: "utf8", flag: "a+", mode: 0o666});

    }

    logger.success('Script fini');

})();

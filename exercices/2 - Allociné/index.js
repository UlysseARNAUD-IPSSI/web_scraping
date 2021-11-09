require('../../bootstrap');

(async function() {
    await run(
        'allocine-alaune',
        'https://www.allocine.fr/',
        async () => {

            const popup = await $eval('#didomi-popup', element => {
                element.remove();
                element.ownerDocument.body.classList.remove('didomi-popup-open');
            }, 'Waiting for cookie popup...');

            const sliders = await $$eval('.roller-slider', elements => {
                const datas = [];

                const [incoming,featured] = elements

                for (const item of incoming.children) {
                    const id = _id(item);
                    const name = _name(item);
                    const director = _director(item);
                    datas.push({id,name,director});
                }

                function _id(element) {
                    return (new RegExp('film-([0-9]+)/?$', 'g')).exec(element.querySelector('.layer-link').href)[1];
                }

                function _name(element) {
                    return element.querySelector('.meta-title').innerText.trim();
                }

                function _director(element) {
                    return  (new RegExp('De (.+)', 'g')).exec(element.querySelector('.meta-description').innerText)[1];
                }

                return datas;
            },'Waiting for sliders...');

            console.log({sliders});

            return {
            };
        }
    );

})()
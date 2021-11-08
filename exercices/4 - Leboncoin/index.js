require('../../bootstrap');

(async function () {
    await run(
        'allocine-alaune',
        'https://www.leboncoin.fr/',
        async page => {


            let exit = false;
            while (!exit) {
                await $eval('.geetest_radar_tip', async element => {
                        /*const {x:from_x,y:from_y} = element.querySelector('.geetest_wait').getBoundingClientRect();
                        const {x:to_x,y:to_y,width,height} = element.getBoundingClientRect();
                        await this.mouse.move(from_x + 12, from_y + height/2 + 12);
                        await this.mouse.down();
                        setTimeout(async () => await this.mouse.move(to_x + width/3, to_y + height/2 + 12), 600);
                        setTimeout(async () => await this.mouse.move(to_x + (2*width)/3, to_y + height/2 + 12), 750);
                        setTimeout(async () => await this.mouse.move(to_x + width, to_y + height/2 + 12), 1125);
                        setTimeout( async () => await this.mouse.up(), 1250);*/
                        exit = true
                    },
                    'Waiting for google recaptcha...',
                    [{timeout: 1000}],
                    [],
                    error => {
                        exit = false
                    });
            }


            await $eval('#didomi-popup', element => {
                element.remove();
                element.ownerDocument.body.classList.remove('didomi-popup-open');
            }, 'Waiting for cookie popup...');

            await $eval('#home-portal', element => {
                element.remove();
            }, 'Waiting for popup...');

            await $eval('span[data-text="Rechercher"]', element => {
                element.click();
            }, 'Waiting for search button in navbar...');

            return {};
        }
    );

})()
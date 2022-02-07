// npm init -y
// npm install minimist
// npm install puppeteer -g

// node automation.js --url=https://www.hackerrank.com/auth/login --config=config.json

let minimist = require("minimist");
let fs = require("fs");
let puppeteer = require("puppeteer");

let args = minimist(process.argv);

let rawdata = fs.readFileSync(args.config);
let mod = JSON.parse(rawdata);

run();

function run() {
    (async() => {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        })
        let pages = await browser.pages();
        await pages[0].goto(args.url);

        let page = pages[0];

        await page.click("div.cookie-container > div.cookie-btn-wrapper");

        for (let i = 0; i < 3; i++) {
            await page.keyboard.press('Tab', {
                delay: 10
            });
        }

        await page.keyboard.type(mod.username);

        await page.keyboard.press('Tab', {
            delay: 10
        });

        await page.keyboard.type(mod.password);

        for (let i = 0; i < 3; i++) {
            await page.keyboard.press('Tab', {
                delay: 100
            });
        }

        await page.keyboard.press('Enter');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        await page.click('a.nav-link.contests');

        await page.waitFor(2500);
        await page.waitForSelector('a.text-link.filter-item');
        await page.click('a.text-link.filter-item');

        await page.waitFor(3500);

        // Finding the page addresses - 
        await page.waitForSelector('a.backbone[data-attr1="Page"]');

        let pageUrl = await page.$$eval('a.backbone[data-attr1="Page"]', data => {
            let pages = [];

            for (let i = 0; i < data.length; i++) {
                let page = data[i].getAttribute("href");
                pages.push([page]);
            }

            return pages;
        });

        // pageUrl has info about how many pages to do next;
        // next clicks = pageUrl.length - 1;

        for (let i = 0; i < pageUrl.length; i++) {

            await page.waitForSelector('a.backbone.block-center');
            // await page.click('a.backbone.block-center');

            // .$$eval -> Runs QuerySelectorAll();
            // .$eval -> Runs QuerySelector();
            let curls = await page.$$eval('a.backbone.block-center', function(data) {
                let urls = [];

                for (let i = 0; i < data.length; i++) {
                    let url = data[i].getAttribute("href");
                    urls.push(url);
                }

                return urls;
            });

            for (let i = 0; i < curls.length; i++) {

                let page2 = await browser.newPage();

                let url = "https://www.hackerrank.com" + curls[i];
                await page2.goto(url);

                await page2.waitFor(2000);

                await page2.waitForSelector('#content > div > section > header > div > div.tabs-cta-wrapper > ul > li:nth-child(4)');
                await page2.click('#content > div > section > header > div > div.tabs-cta-wrapper > ul > li:nth-child(4)');

                await page2.waitFor(3500);

                /*
                // Since sometimes it shows only on first page
                // And other times on all the pages;
                if (i == 0) {
                    await page2.waitForSelector('button#cancelBtn');
                    await page2.click('button#cancelBtn');
                }
                */

                // Adding the moderator;
                await page2.waitFor(1500);
                await page2.waitForSelector('#moderator');
                await page2.click('#moderator');

                /*
                Loop for adding multiple moderators in config file;
                for (let k = 0; k < mod.moderators.length; k++) {
                    await page2.keyboard.type(mod.moderators[k].handle);
                    await page2.waitFor(1500);
                    await page2.waitForSelector('button.btn.moderator-save');
                    await page2.click('button.btn.moderator-save');
                }
                */

                await page2.keyboard.type("Adding moderator");

                await page2.waitFor(1500);
                await page2.waitForSelector('button.btn.moderator-save');
                await page2.click('button.btn.moderator-save');

                await page2.waitFor(1500);
                await page2.close();
            }

            if (i != pageUrl.length - 1) {
                await page.waitForSelector('a.backbone[data-attr1="Right"]');
                await page.click('a.backbone[data-attr1="Right"]');
                await page.waitFor(3500);
            }

        }

        await browser.close();

    })()
}

// For all those who have slow systems and are getting TimeOut error during automation project.
// add this snippet after creating a new page
// await page.setDefaultNavigationTimeout(0); 
// This will give your pc unlimited amount of time to load the page
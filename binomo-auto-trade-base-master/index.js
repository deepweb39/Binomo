const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const nodeSchedule = require('node-schedule');

const fs = require('fs');
const moment = require('moment');
const chalk = require('chalk');
const delay = require('delay');
const readlineSync = require('readline-sync');


(async () => {

    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--disable-accelerated-2d-canvas',
        '--no-zygote',
        '--no-first-run',
        '--disable-dev-shm-usage',
        '--window-size=1920x1080'
    ];


    const browser = await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true,
        userDataDir: './tmp',
        slowMo: 0,
        devtools: false,
        args
    });


    const pages = await browser.pages();
    const page = pages[0];
    await page.setDefaultNavigationTimeout(0);
    await page.goto('https://binomo-web.com/trading', {
        waitUntil: 'networkidle0',
        timeout: 120000,
    });

    let loginRequired = false;

    if ((await page.$('#qa_auth_LoginBtn > button')) !== null) {
        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow('Kamu harus login terlebih dahulu'));
        loginRequired = true
    } else {
        loginRequired = false
    }

    if (loginRequired) {
        const isLogin = readlineSync.question('Tekan enter jika sudah login [ENTER]');
        console.log('')

        if ((await page.$('#avatar > vui-badge > vui-avatar > img')) !== null) {
            await page.evaluate(() => document.querySelector("#avatar > vui-badge > vui-avatar > img").click());
        } else {
            await page.evaluate(() => document.querySelector("#avatar > vui-badge > vui-avatar > span").click());
        }

        await page.waitForSelector('#qa_header_MiniProfileDropdown > div.popover_body__3GBGJ > div > div.personal-information.bg-dark.ng-star-inserted > div.wrap > div > p.name');
        let loginName = await page.$('#qa_header_MiniProfileDropdown > div.popover_body__3GBGJ > div > div.personal-information.bg-dark.ng-star-inserted > div.wrap > div > p.name');
        let loginNameValue = await page.evaluate(el => el.textContent, loginName);
        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Berhasil login dengan akun : ${loginNameValue}`));
    } else {
        if ((await page.$('#avatar > vui-badge > vui-avatar > img')) !== null) {
            await page.evaluate(() => document.querySelector("#avatar > vui-badge > vui-avatar > img").click());
        } else {
            await page.evaluate(() => document.querySelector("#avatar > vui-badge > vui-avatar > span").click());
        }
        await page.waitForSelector('#qa_header_MiniProfileDropdown > div.popover_body__3GBGJ > div > div.personal-information.bg-dark > div.wrap > div > p.name');
        let loginName = await page.$('#qa_header_MiniProfileDropdown > div.popover_body__3GBGJ > div > div.personal-information.bg-dark > div.wrap > div > p.name');
        let loginNameValue = await page.evaluate(el => el.textContent, loginName);
        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Berhasil login dengan akun : ${loginNameValue}`));
    }



    await page.goto('https://binomo-web.com/trading', {
        waitUntil: 'networkidle0',
        timeout: 120000,
    });

    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green('Trading menggunakan akun Demo'));

    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green('Start Trading...'));
    console.log('');
    await delay(2000);


    const timeList = await fs.readFileSync('./time.txt', 'utf-8');
    const timeArray = timeList.split('\n');
    for (let index = 0; index < timeArray.length; index++) {
        const element = timeArray[index];

        if (element) {
            const hours = element.split(':')[0];
            const minute = element.split(':')[1].split(' ')[0];
            const type = element.split(':')[1].split(' ')[1];
            nodeSchedule.scheduleJob({ hour: minute == '00' ? hours - 1 : hours, minute: minute == '00' ? '59' : minute - 1 }, async () => {


                if (type == 'B') {
                    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Buy at ${minute == '00' ? hours - 1 : hours}:${minute == '00' ? '59' : minute - 1} ...`));
                    await page.evaluate(() => document.querySelector("#qa_trading_dealUpButton > button").click());
                    await delay(59000);
                    console.log('Next open')
                    console.log('')
                    await delay(2000);
                } else if (type == 'S') {
                    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Sell at ${minute == '00' ? hours - 1 : hours}:${minute == '00' ? '59' : minute - 1} ...`));
                    await page.evaluate(() => document.querySelector("#qa_trading_dealDownButton > button").click());
                    await delay(59000);
                    console.log('Next open')
                    console.log('');
                    await delay(2000);
                }


            });

        }

    }



})();
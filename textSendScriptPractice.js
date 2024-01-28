const puppeteer = require('puppeteer');
const config = require('./config');
const fs = require('fs');

const start = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: './user_data',
    });
    const page = await browser.newPage();
    const userAgent =
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
    await page.setUserAgent(userAgent);
    await page.goto('http://web.whatsapp.com');
    await page.waitForSelector('._2QgSC', { timeout: 60000 });

    console.log('logged in');

    const contactList = getContact(config.contact);
    const contacts = contactList.split(/\r?\n/);

    for (const contact of contacts) {
        const precontent = getContent(config.content);
        const content = encodeURIComponent(precontent);

        await page.goto(`https://web.whatsapp.com/send?phone=${contact}&text=${content}`);

        await page.on('dialog', async (dialog) => {
            await dialog.accept();
        });

        try {
            await page.waitForSelector('._3Uu1_', { timeout: 600000 });
        } catch (error) {
            console.log('Invalid phone number ' + contact);
            continue;
        }

        await page.focus('._3Uu1_ [contenteditable="true"]');
        await page.type('._3Uu1_ [contenteditable="true"]', content);
        await page.keyboard.press(String.fromCharCode(13));

        console.log('Success send message to ' + contact);
    }

    console.log('done');
    await page.waitForTimeout(1000);
    await browser.close();
};

start();

const getContact = (path) => {
    const contact = fs.readFileSync(path, { encoding: 'utf-8' });
    return contact;
};

const getContent = (path) => {
    const content = fs.readFileSync(path, { encoding: 'utf-8' });
    return content;
};

const puppeteer = require('puppeteer');
const config = require('./config');
const fs = require('fs');

const start = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
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

        console.log('Before waiting for selector');
        const buttonSelector = '._3OtEr .bo8jc6qi';
        await page.waitForSelector(buttonSelector);
        console.log('After waiting for selector');
        await page.waitForTimeout(1000);
        await page.click(buttonSelector);
        console.log('after clicking');

        const dropdownSelector = 'div.bugiwsl0:nth-child(2) > li:nth-child(1) > div:nth-child(1) > span:nth-child(2)';
        try {
            await page.waitForSelector(dropdownSelector);
            await page.click(dropdownSelector);
        } catch (err) {
            console.error(err);
        }

        await page.waitForTimeout(1000);

        // const [fileChooser] = await Promise.all([
        //     page.waitForFileChooser(),
        //     page.click('#customUploadButton')
        // ])

        // //code sample for ElementHandle.uploadFile
        // const UploadElement = await page.$('input[type="file"]');
        // await uploadElement.uploadFile('C:\\Users\\bhuvn\\Downloads\\vek-labs-e8ofKlNHdsg-unsplash.jpg');

        await page.waitForSelector('input[type=file]');
        const inputUploadHandle = await page.$('input[type=file]');

        await inputUploadHandle.uploadFile('C:\\Users\\bhuvn\\Downloads\\vek-labs-e8ofKlNHdsg-unsplash.jpg');
        // await page.click('#upload');
        // await delay(20000);
        // await page.waitForSelector('.upload-success'); 

        // const fileInputSelector = 'input[type="file"]';
        // await page.waitForSelector(fileInputSelector);
        // const filePath = 'C:\\Users\\bhuvn\\Downloads\\vek-labs-e8ofKlNHdsg-unsplash.jpg'; // Replace with the actual path


        // await page.$eval(fileInputSelector, (input, filePath) => {
        //     input.setAttribute('value', filePath);
        // }, filePath);


        const fileUploadDelay = 3000; 
        await page.waitForTimeout(fileUploadDelay);

        const sendButtonSelector = '.g0rxnol2 [aria-label="Send"]';
        await page.waitForSelector(sendButtonSelector);
        await page.click(sendButtonSelector);

        const sendButtonClickDelay = 10000; 
        await page.waitForTimeout(sendButtonClickDelay);
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

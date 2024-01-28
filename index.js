const puppeteer = require('puppeteer');
const config = require('./config');
const fs = require('fs');

const filePath = 'C:\\Users\\bhuvn\\Downloads\\ink_1(1).mov';

const start = async () => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: false,
        userDataDir: './user_data',
    });

    const userAgent =
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';

    const contactList = getContact(config.contact);
    const contacts = contactList.split(/\r?\n/);

    for (const contact of contacts) {
        const page = await browser.newPage();
        await page.setUserAgent(userAgent);

        try {
            await page.goto('http://web.whatsapp.com');
            await page.waitForSelector('._2QgSC', { timeout: 60000 });

            console.log('Succesfully Logged in to the user whatsappweb account');

            const precontent = getContent(config.content);
            const content = encodeURIComponent(precontent);

            await page.goto(`https://web.whatsapp.com/send?phone=${contact}&text=${content}`);
            await page.on('dialog', async (dialog) => {
                await dialog.accept();
            });

            console.log('Waiting for chat selector');
            const buttonSelector = '._3OtEr .bo8jc6qi';
            await page.waitForSelector(buttonSelector);
            console.log('Chat selector selected');
            await page.waitForTimeout(1000);
            await page.click(buttonSelector);
            console.log('Attachment Button clicked');

            const dropdownSelector = 'div.bugiwsl0:nth-child(2) > li:nth-child(1) > div:nth-child(1) > span:nth-child(2)';
            try {
                await page.waitForSelector(dropdownSelector);
                await page.click(dropdownSelector);
            } catch (err) {
                console.error(err);
            }

            await page.waitForTimeout(1000);

            await page.waitForSelector('input[type=file]');
            const inputUploadHandle = await page.$('input[type=file]');

            await inputUploadHandle.uploadFile(filePath);

            await page.evaluate(() => {
                const fileInput = document.querySelector('input[type="file"]');
                fileInput.value = '';
            });

            console.log('File uploaded')

            const fileUploadDelay = 3000; 
            await page.waitForTimeout(fileUploadDelay);

            const sendButtonSelector = '.g0rxnol2 [aria-label="Send"]';
            await page.waitForSelector(sendButtonSelector);
            await page.click(sendButtonSelector);

            const sendButtonClickDelay = 10000;
            await page.waitForTimeout(sendButtonClickDelay);

            console.log(`File Successfully Sent to ${contact} with content: ${content}`);
        } catch (err) {
            console.error('Error in processing contact:', contact, err);
        } finally {
            await page.waitForTimeout(1000);
            await page.close();
        }
    }

    console.log('Sent Message to all in the contactlist');
    console.log('Closing browser Now');
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

const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const puppeteer = require('puppeteer');
const spawn = require("child_process").spawn;

const validateInput = require('../../validation/search');

module.exports.scrape = async (req, res) => {
    //Check validation
    const { errors, isValid } = validateInput(req.params);
    if (!isValid) { return res.status(400).json(errors); }

    const query = req.params.query.toString();

    // Webscrape data
    const scraped = await scrapeGoogle(query);
    console.log('sending data to client');
    return res.send({ success: true, msg: 'webscraping done, please see ocr.txt in project folder', googleSearchLinks: scraped });

}



const scrapeGoogle = async (query) => {
    const url = `https://www.google.com/search?q=${query}`;
    let links = [];
    try {
        let httpResponse = await axios.get(url);
        let $ = cheerio.load(httpResponse.data);
        let linkObjects = $('a'); // get all hyperlinks


        for (let i = 0; i < linkObjects.length; i++) {
            const element = linkObjects[i];
            const ref = $(element).attr('href').toString();

            if (ref.includes('url?q=https://')) {
                var link = ref.substring(ref.indexOf("=") + 1, ref.indexOf("&"));
                links.push(link);
            }
        }

        await takeScreenShot(url);
        await extractText();
    } catch (e) {
        console.log('error in axios' + e);
    }

    return links;
}


const takeScreenShot = async (url) => {
    console.log('Capturing Screenshot - ' + url);

    // Launch browser
    const browser = await puppeteer.launch();

    // Create viewpage
    const page = await browser.newPage();

    // Find dimensions
    const dimensions = await page.evaluate(() => {
        return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
        };
    });

    // Set viewport of page i.e. how much to capture, zoom in page
    await page.setViewport({
        width: dimensions.width,
        height: dimensions.height * 4,
        deviceScaleFactor: 2,
    });

    // Go to url and capture screenshot
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: __dirname + '/ss.png' });

    // close the browser
    await browser.close();
    console.log('Screenshot taken');
    return;
}

const extractText = () => {
    return new Promise((resolve, reject) => {
        console.log('Extracting text');
        var pythonProcess = spawn('python', [__dirname + '/ocr.py']);

        const out = [], err = [];

        pythonProcess.stdout.on('data', (data) => {
            out.push(data.toString());
        });

        pythonProcess.stderr.on('data', (data) => {
            err.push(data.toString());
        });

        pythonProcess.on('exit', (code, signal) => {
            if (code === 0) {
                console.log('Text extracted');
                resolve(out);
            } else {
                reject(new Error(err.join('\n')))
            }
        });

    });
}


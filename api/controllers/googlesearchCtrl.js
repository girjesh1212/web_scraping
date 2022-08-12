const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const puppeteer = require('puppeteer');
const spawn = require("child_process").spawn;
var readline = require('linebyline');
const stringSimilarity = require("string-similarity");

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


// If getExtraData is used cleverly, it can give very useful text that appears below the links in google search results.
const scrapeGoogle = async (query) => {
    const url = `https://www.google.com/search?q=${query}`;
    let links = [];
    try {

        await takeScreenShot(url);
        await extractText();

        let httpResponse = await axios.get(url);
        let $ = cheerio.load(httpResponse.data);
        let linkObjects = $('a'); // get all hyperlinks

        for (let i = 0; i < linkObjects.length; i++) {
            const element = linkObjects[i];
            const ref = $(element).attr('href').toString();
            var text = $(element).text().substring(0, $(element).text().indexOf('›'));

            if (ref.includes('url?q=https://')) {
                var link = ref.substring(ref.indexOf("=") + 1, ref.indexOf("&"));
                // const extraData = await getExtraData(text);
                // links.push({ link, extraData });
                links.push(link);
            }
        }

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

const getExtraData = (text) => {
    return new Promise((resolve, reject) => {
        // console.log('Extracting more data');
        let similarity = 0;
        var output = '';
        rl = readline(__dirname + '/ocr.txt');
        rl.on('line', function (line, lineCount, byteCount) {
            if (similarity > 0.6) {
                output = line;
                similarity = 0;
            }
            similarity = stringSimilarity.compareTwoStrings(line, text);
        })
            .on('error', function (e) {
                reject(e);
                // something went wrong
            });
        rl.on('close', function () {
            // console.log('Extra data extracted!');
            resolve(output);
        })
    })

}


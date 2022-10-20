#!/usr/bin/env node
import fs from 'fs/promises';
import puppeteer from 'puppeteer';
const rows = (await fs.readFile('Movies.csv')).toString().split('\n').filter(line.startsWith('2022')).map(line => line.split(','));
console.log(rows.length);
const browser = await puppeteer.launch({
	args: ['--no-sandbox', '--disable-setuid-sandbox'],
	executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
});
for (let k = 0; k < rows.length; ++k) {
	const row = rows[k];
	const title = row[2];
	console.log(k, title);
	const titlePage = await browser.newPage();
	await titlePage.goto(`https://www.imdb.com/title/${title}/`, { waitUntil: 'networkidle0' });
	const src = await titlePage.evaluate(() => { return document.querySelector('img.ipc-image').src;	});
	await titlePage.close();
	const jpg = `${src.split('_').slice(0, 2).join('_')}_.jpg`;
	const imagePage = await browser.newPage();
	const resp = await imagePage.goto(row[3]);
	await fs.writeFile(`images/${title}.jpg`, await resp.buffer());
	await imagePage.close();
}
await browser.close();

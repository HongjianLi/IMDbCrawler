#!/usr/bin/env node
import fs from 'fs/promises';
import https from 'https';
import puppeteer from 'puppeteer';
import ProgressBar from 'progress';
const year = '2022';
const rows = (await fs.readFile('Movies.csv')).toString().split('\n').filter(line => line.startsWith(year)).map(line => line.split(','));
const browser = await puppeteer.launch({
	args: ['--no-sandbox', '--disable-setuid-sandbox'],
	executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
});
const bar = new ProgressBar('[:bar] :title :current/:total=:percent :elapseds :etas', { total: rows.length });
for (let k = 0; k < rows.length; ++k) {
	const row = rows[k];
	const title = row[2];
	bar.tick({ title });
	const titlePage = await browser.newPage();
	await titlePage.goto(`https://www.imdb.com/title/${title}/`, { waitUntil: 'networkidle0' });
	const src = await titlePage.evaluate(() => (document.querySelector('img.ipc-image').src ));
	await titlePage.close();
	const buffer = await new Promise((resolve, reject) => {
		https.get(`${src.split('_').slice(0, 2).join('_')}_.jpg`, res => {
			const data = [];
			res.on('data', chunk => { data.push(chunk); });
			res.on('end', () => { resolve(Buffer.concat(data)); });
		}).on('error', error => { reject(error); });
	});
	await fs.writeFile(`images/${title}.jpg`, buffer);
}
await browser.close();

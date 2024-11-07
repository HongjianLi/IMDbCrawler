#!/usr/bin/env node
import { promises as fs, existsSync } from 'fs';
import https from 'https';
import puppeteer from 'puppeteer-core';
import ProgressBar from 'progress';
const year = '2023';
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
	const path = `images/${title}.jpg`;
	if (existsSync(path)) continue;
	const page = await browser.newPage();
	await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0');
	await page.setExtraHTTPHeaders({'accept-language': 'en,en-US;q=0.9,zh-CN;q=0.8,zh-TW;q=0.7,zh;q=0.6'});
	await page.goto(`https://www.imdb.com/title/${title}/`, { waitUntil: 'networkidle0' });
	const src = await page.evaluate(() => (document.querySelector('img.ipc-image').src ));
	await page.close();
	const buffer = await new Promise((resolve, reject) => {
		https.get(`${src.split('_').slice(0, 2).join('_')}_.jpg`, res => {
			const data = [];
			res.on('data', chunk => { data.push(chunk); });
			res.on('end', () => { resolve(Buffer.concat(data)); });
		}).on('error', error => { reject(error); });
	});
	await fs.writeFile(path, buffer);
}
await browser.close();

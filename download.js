#!/usr/bin/env node
import fs from 'fs/promises';
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
	const jpg = `${src.split('_').slice(0, 2).join('_')}_.jpg`;
	const imagePage = await browser.newPage();
	const resp = await imagePage.goto(jpg);
	await fs.writeFile(`images/${title}.jpg`, await resp.buffer()); // If the image is too large, say >6MB, calling resp.buffer() may cause ProtocolError: Protocol error (Network.getResponseBody): Request content was evicted from inspector cache
	await imagePage.close();
}
await browser.close();

#!/usr/bin/env node
import fs from 'fs/promises';
import * as tf from '@tensorflow/tfjs-node';
const year = '2022';
const rows = (await fs.readFile('Movies.csv')).toString().split('\n').filter(line => line.startsWith(year)).map(line => line.split(','));
console.log(rows.length);
const width = 1080;
const outputTensors = [];
for (let k = 0; k < 20; ++k) {
	const row = rows[k];
	const title = row[2];
	const inputBuffer = await fs.readFile(`images/${title}.jpg`);
	const inputTensor = tf.node.decodeImage(inputBuffer);
	const outputTensor = tf.image.resizeBilinear(inputTensor, [width * inputTensor.shape[0] / inputTensor.shape[1], width]); // resizeNearestNeighbor
	outputTensors.push(outputTensor);
	tf.dispose(inputTensor);
}
const outputTensor = tf.concat(outputTensors);
console.log(outputTensor.shape);
const outputBuffer = await tf.node.encodeJpeg(outputTensor);
await fs.writeFile(`images/${year}_.jpg`, outputBuffer);
tf.dispose(outputTensors);

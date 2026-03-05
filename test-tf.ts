import * as tf from '@tensorflow/tfjs';
import Papa from 'papaparse';

async function test() {
    const model = tf.sequential();
    model.add(tf.layers.dense({units: 256, inputShape: [35], activation: 'relu'}));
    model.add(tf.layers.dropout({rate: 0.25}));
    model.add(tf.layers.dense({units: 128, activation: 'relu'}));
    model.add(tf.layers.dropout({rate: 0.2}));
    model.add(tf.layers.dense({units: 64, activation: 'relu'}));
    model.add(tf.layers.dropout({rate: 0.1}));
    model.add(tf.layers.dense({units: 3, activation: 'softmax'}));

    model.compile({
        optimizer: tf.train.adam(0.0005),
        loss: 'sparseCategoricalCrossentropy',
        metrics: ['accuracy']
    });

    const url = "https://www.football-data.co.uk/mmz4281/2324/E0.csv";
    const res = await fetch(url);
    const csv = await res.text();
    const parsed = Papa.parse(csv, {header: true});
    const data = parsed.data.filter((r: any) => r.B365H && r.FTR);

    const features = data.map((r: any) => [
        parseFloat(r.B365H) || 2.5, parseFloat(r.B365D) || 3.5, parseFloat(r.B365A) || 3.5,
        16 + Math.random()*10, 50 + Math.random()*30, 5 + Math.random()*10, 
        50 + Math.random()*30, 2.5 + Math.random()*1, 2.5 + Math.random()*1, 50 + Math.random()*30,
        Math.random()*3, Math.random()*3, Math.random()*3, Math.random()*3,
        Math.random()*15, Math.random()*15, Math.random()*5, Math.random()*5,
        Math.random()*10 - 5, Math.random()*80, Math.random()*5,
        Math.random()*5, Math.random()*0.3, Math.random() > 0.5 ? 1 : 0,
        Math.random()*3, Math.random()*3, Math.random()*15 - 7.5, Math.random()*15 - 7.5,
        Math.random()*4 - 2, Math.random()*2 - 1, Math.random()*2 - 1,
        Math.random(), Math.random(), Math.random(), Math.random()
    ]);

    const labels = data.map((r: any) => r.FTR === 'H' ? 0 : r.FTR === 'D' ? 1 : 2);

    const xs = tf.tensor2d(features);
    const ys = tf.tensor1d(labels, 'float32');

    await model.fit(xs, ys, {epochs: 1, shuffle: true});
    console.log("Fit success");
}
test().catch(e => console.error(e));

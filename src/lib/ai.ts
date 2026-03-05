import * as tf from '@tensorflow/tfjs';
import Papa from 'papaparse';

let model: tf.Sequential | null = null;

export async function createAndTrainModel() {
    if (model) return model;
    model = tf.sequential();
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

    await loadHistoricalData(model);
    return model;
}

async function loadHistoricalData(model: tf.Sequential) {
    const urls = [
        "https://www.football-data.co.uk/mmz4281/2324/E0.csv",
        "https://www.football-data.co.uk/mmz4281/2324/D1.csv",
        "https://www.football-data.co.uk/mmz4281/2324/SP1.csv"
    ];

    for (let url of urls) {
        try {
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

            if (features.length === 0) continue;

            const xs = tf.tensor2d(features);
            const ys = tf.tensor1d(labels, 'float32');

            await model.fit(xs, ys, {epochs: 6, shuffle: true});
            xs.dispose(); ys.dispose();
        } catch (e) {
            console.warn("CSV load failed:", url, e);
        }
    }
}

export async function predictWithModel(features: number[]) {
    const m = await createAndTrainModel();
    const input = tf.tensor2d([features]);
    const prediction = m.predict(input) as tf.Tensor;
    const probs = await prediction.data();
    input.dispose();
    prediction.dispose();
    return Array.from(probs);
}

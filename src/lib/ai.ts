import * as tf from '@tensorflow/tfjs';
import { footballData } from './data';

let model: tf.Sequential | null = null;

// Feature vector size: 15
// 0: Odds H, 1: Odds D, 2: Odds A
// 3: Home Form Pts, 4: Away Form Pts
// 5: Home GS, 6: Away GS
// 7: Home GC, 8: Away GC
// 9: Home SoT avg, 10: Away SoT avg
// 11: H2H Home Wins, 12: H2H Away Wins, 13: H2H Draws
// 14: Home Advantage (1 for home, 0 for neutral)

export async function createAndTrainModel() {
    if (model) return model;
    
    // Ensure data is loaded
    await footballData.loadData();
    
    model = tf.sequential();
    
    // Deeper, more robust architecture for tabular data
    model.add(tf.layers.dense({units: 128, inputShape: [15], activation: 'relu', kernelRegularizer: tf.regularizers.l2({l2: 0.01})}));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({rate: 0.3}));
    
    model.add(tf.layers.dense({units: 64, activation: 'relu', kernelRegularizer: tf.regularizers.l2({l2: 0.01})}));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({rate: 0.2}));
    
    model.add(tf.layers.dense({units: 32, activation: 'relu'}));
    model.add(tf.layers.dropout({rate: 0.1}));
    
    model.add(tf.layers.dense({units: 3, activation: 'softmax'}));

    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'sparseCategoricalCrossentropy',
        metrics: ['accuracy']
    });

    await loadHistoricalData(model);
    return model;
}

async function loadHistoricalData(model: tf.Sequential) {
    const matches = footballData.getMatches();
    if (matches.length === 0) return;

    // We'll use the last 1000 matches for training to keep it fast but effective
    const trainingData = matches.slice(-1000);
    
    const features: number[][] = [];
    const labels: number[] = [];

    for (const m of trainingData) {
        // Mocking historical form by just using the current form getter (in a real app, we'd calculate form *up to* the match date)
        // For simplicity and speed in this browser-based model, we use the general form.
        const homeForm = footballData.getTeamForm(m.HomeTeam);
        const awayForm = footballData.getTeamForm(m.AwayTeam);
        const h2h = footballData.getH2H(m.HomeTeam, m.AwayTeam);

        const row = [
            m.B365H, m.B365D, m.B365A,
            homeForm.pts, awayForm.pts,
            homeForm.gs, awayForm.gs,
            homeForm.gc, awayForm.gc,
            homeForm.sot, awayForm.sot,
            h2h.homeWins, h2h.awayWins, h2h.draws,
            1 // Home advantage
        ];
        
        features.push(row);
        labels.push(m.FTR === 'H' ? 0 : m.FTR === 'D' ? 1 : 2);
    }

    if (features.length === 0) return;

    const xs = tf.tensor2d(features);
    const ys = tf.tensor1d(labels, 'float32');

    // Early stopping callback to prevent overfitting
    const earlyStopping = tf.callbacks.earlyStopping({ monitor: 'loss', patience: 3 });

    await model.fit(xs, ys, {
        epochs: 15, 
        batchSize: 32,
        shuffle: true,
        callbacks: [earlyStopping]
    });
    
    xs.dispose(); 
    ys.dispose();
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

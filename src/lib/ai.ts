import * as tf from '@tensorflow/tfjs';
import { footballData } from '../api/mockData';

let ensembleModels: tf.Sequential[] = [];

// Feature vector size: 31
// 0: Odds H, 1: Odds D, 2: Odds A
// 3: Home Form Pts, 4: Away Form Pts
// 5: Home GS, 6: Away GS
// 7: Home GC, 8: Away GC
// 9: Home SoT avg, 10: Away SoT avg
// 11: H2H Home Wins, 12: H2H Away Wins, 13: H2H Draws
// 14: Home Advantage (1 for home, 0 for neutral)
// 15: Home Key Player Form
// 16: Home Injury Impact
// 17: Home Discipline Impact
// 18: Away Key Player Form
// 19: Away Injury Impact
// 20: Away Discipline Impact
// 21: Home xG, 22: Away xG
// 23: Home PPDA, 24: Away PPDA
// 25: Home Field Tilt, 26: Away Field Tilt
// 27: Home CS Prob, 28: Away CS Prob
// 29: Home Rest Days, 30: Away Rest Days

function createBaseModel() {
    const model = tf.sequential();
    
    // Deeper, more robust architecture for tabular data
    model.add(tf.layers.dense({units: 256, inputShape: [31], activation: 'relu', kernelRegularizer: tf.regularizers.l2({l2: 0.005})}));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({rate: 0.4}));
    
    model.add(tf.layers.dense({units: 128, activation: 'relu', kernelRegularizer: tf.regularizers.l2({l2: 0.005})}));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({rate: 0.3}));
    
    model.add(tf.layers.dense({units: 64, activation: 'relu'}));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({rate: 0.2}));
    
    model.add(tf.layers.dense({units: 32, activation: 'relu'}));
    model.add(tf.layers.dropout({rate: 0.1}));
    
    model.add(tf.layers.dense({units: 3, activation: 'softmax'}));

    model.compile({
        optimizer: tf.train.adam(0.0005), // Lower learning rate for stability
        loss: 'sparseCategoricalCrossentropy',
        metrics: ['accuracy']
    });
    
    return model;
}

export async function createAndTrainModel(onProgress?: (msg: string) => void) {
    if (ensembleModels.length > 0) return ensembleModels;
    
    // Ensure data is loaded
    if (onProgress) onProgress("Loading historical match data...");
    await footballData.loadData();
    
    // Create an ensemble of 5 models
    for (let i = 0; i < 5; i++) {
        ensembleModels.push(createBaseModel());
    }

    await loadHistoricalData(ensembleModels, onProgress);
    return ensembleModels;
}

async function loadHistoricalData(models: tf.Sequential[], onProgress?: (msg: string) => void) {
    const matches = footballData.getMatches();
    if (matches.length === 0) return;

    // We'll use the last 3000 matches for training
    if (onProgress) onProgress("Preparing training data from 3000 matches...");
    const trainingData = matches.slice(-3000);
    
    const features: number[][] = [];
    const labels: number[] = [];

    for (const m of trainingData) {
        // Pass m.Date to ensure we only calculate form up to the match date
        const homeForm = footballData.getTeamForm(m.HomeTeam, m.Date);
        const awayForm = footballData.getTeamForm(m.AwayTeam, m.Date);
        const h2h = footballData.getH2H(m.HomeTeam, m.AwayTeam, m.Date);

        const row = [
            m.B365H, m.B365D, m.B365A,
            homeForm.pts, awayForm.pts,
            homeForm.gs, awayForm.gs,
            homeForm.gc, awayForm.gc,
            homeForm.sot, awayForm.sot,
            h2h.homeWins, h2h.awayWins, h2h.draws,
            1, // Home advantage
            // Mock historical player metrics (in a real app, this would be historical player data)
            5 + Math.random() * 4, // Home Key Player Form
            Math.random() * 4, // Home Injury Impact
            Math.random() * 2, // Home Discipline Impact
            5 + Math.random() * 4, // Away Key Player Form
            Math.random() * 4, // Away Injury Impact
            Math.random() * 2, // Away Discipline Impact
            // Mock advanced metrics
            1.0 + Math.random() * 1.5, // Home xG
            1.0 + Math.random() * 1.5, // Away xG
            8 + Math.random() * 10, // Home PPDA
            8 + Math.random() * 10, // Away PPDA
            40 + Math.random() * 20, // Home Field Tilt
            40 + Math.random() * 20, // Away Field Tilt
            10 + Math.random() * 40, // Home CS Prob
            10 + Math.random() * 40, // Away CS Prob
            3 + Math.random() * 4, // Home Rest Days
            3 + Math.random() * 4  // Away Rest Days
        ];
        
        features.push(row);
        labels.push(m.FTR === 'H' ? 0 : m.FTR === 'D' ? 1 : 2);
    }

    if (features.length === 0) return;

    const xs = tf.tensor2d(features);
    const ys = tf.tensor1d(labels, 'float32');

    // Train each model in the ensemble
    for (let i = 0; i < models.length; i++) {
        if (onProgress) onProgress(`Training ensemble model ${i + 1}/5...`);
        await models[i].fit(xs, ys, {
            epochs: 20, 
            batchSize: 64,
            shuffle: true
        });
    }
    
    xs.dispose(); 
    ys.dispose();
}

export async function predictWithModel(features: number[]) {
    const models = await createAndTrainModel();
    const input = tf.tensor2d([features]);
    
    let totalProbs = [0, 0, 0];
    
    // Average the predictions from all models in the ensemble
    for (const model of models) {
        const prediction = model.predict(input) as tf.Tensor;
        const probs = await prediction.data();
        totalProbs[0] += probs[0];
        totalProbs[1] += probs[1];
        totalProbs[2] += probs[2];
        prediction.dispose();
    }
    
    input.dispose();
    
    // Normalize averaged probabilities
    return [
        totalProbs[0] / models.length,
        totalProbs[1] / models.length,
        totalProbs[2] / models.length
    ];
}

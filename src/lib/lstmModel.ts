import * as tf from '@tensorflow/tfjs';

export interface MatchSequenceFeature {
  goals_scored: number;
  goals_conceded: number;
  xG_for: number;
  xG_against: number;
  shots_on_target: number;
  shots_conceded: number;
  possession: number;
  ppda: number;
  result: number; // 0, 0.5, 1
  opponent_strength: number; // elo
  home_or_away: number; // 0 or 1
  rest_days_before: number;
  match_importance: number;
  cards_received: number;
  form_cumulative: number;
}

export class LSTMSequenceModel {
  private model: tf.LayersModel | null = null;
  private performanceHistory: { lstm: number; baseline: number }[] = [];

  constructor() {
    this.buildModel();
  }

  private buildModel() {
    // Dual LSTM architecture (home + away separately)
    const homeInput = tf.input({ shape: [10, 15], name: 'home_input' });
    const awayInput = tf.input({ shape: [10, 15], name: 'away_input' });

    // Shared LSTM layers or separate? Let's use separate for team-specific sequence learning
    const homeLSTM = tf.layers.lstm({ 
      units: 64, 
      returnSequences: false,
      name: 'home_lstm' 
    }).apply(homeInput) as tf.SymbolicTensor;

    const awayLSTM = tf.layers.lstm({ 
      units: 64, 
      returnSequences: false,
      name: 'away_lstm' 
    }).apply(awayInput) as tf.SymbolicTensor;

    // Combine both team sequences
    const combined = tf.layers.concatenate().apply([homeLSTM, awayLSTM]) as tf.SymbolicTensor;

    const dense1 = tf.layers.dense({ units: 32, activation: 'relu' }).apply(combined) as tf.SymbolicTensor;
    const dropout = tf.layers.dropout({ rate: 0.3 }).apply(dense1) as tf.SymbolicTensor;
    const dense2 = tf.layers.dense({ units: 16, activation: 'relu' }).apply(dropout) as tf.SymbolicTensor;
    const output = tf.layers.dense({ units: 3, activation: 'softmax', name: 'output' }).apply(dense2) as tf.SymbolicTensor;

    this.model = tf.model({ inputs: [homeInput, awayInput], outputs: output });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }

  async predict(homeSeq: number[][], awaySeq: number[][]): Promise<number[]> {
    if (!this.model) return [0.33, 0.34, 0.33];

    return tf.tidy(() => {
      const homeTensor = tf.tensor3d([homeSeq], [1, 10, 15]);
      const awayTensor = tf.tensor3d([awaySeq], [1, 10, 15]);
      const forecast = this.model!.predict([homeTensor, awayTensor]) as tf.Tensor;
      return Array.from(forecast.dataSync());
    });
  }

  /**
   * Ensembles LSTM with existing neural net and Dixon-Coles
   */
  ensemble(
    lstmProb: number[], 
    nnProb: number[], 
    dcProb: number[],
    weights = { lstm: 0.35, nn: 0.40, dc: 0.25 }
  ): number[] {
    return lstmProb.map((p, i) => 
      p * weights.lstm + nnProb[i] * weights.nn + dcProb[i] * weights.dc
    );
  }

  /**
   * Tracks performance and adjusts weights automatically
   */
  trackPerformance(actualResult: number, lstmProb: number[], baselineProb: number[]) {
    // actualResult: 0=Home, 1=Draw, 2=Away
    const lstmCorrect = lstmProb.indexOf(Math.max(...lstmProb)) === actualResult;
    const baselineCorrect = baselineProb.indexOf(Math.max(...baselineProb)) === actualResult;

    this.performanceHistory.push({ 
      lstm: lstmCorrect ? 1 : 0, 
      baseline: baselineCorrect ? 1 : 0 
    });

    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }
  }

  getWeights(): { lstm: number; nn: number; dc: number } {
    if (this.performanceHistory.length < 20) return { lstm: 0.35, nn: 0.40, dc: 0.25 };

    const lstmAcc = this.performanceHistory.reduce((sum, h) => sum + h.lstm, 0) / this.performanceHistory.length;
    const baselineAcc = this.performanceHistory.reduce((sum, h) => sum + h.baseline, 0) / this.performanceHistory.length;

    // Dynamically adjust weights based on relative accuracy
    const totalAcc = lstmAcc + baselineAcc;
    const lstmWeight = (lstmAcc / totalAcc) * 0.75; // LSTM + NN share 75%
    const nnWeight = (baselineAcc / totalAcc) * 0.75;
    
    return {
      lstm: Number(lstmWeight.toFixed(2)),
      nn: Number(nnWeight.toFixed(2)),
      dc: 0.25
    };
  }
}

export const lstmModel = new LSTMSequenceModel();

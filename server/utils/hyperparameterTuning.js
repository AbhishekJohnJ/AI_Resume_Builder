/**
 * Hyperparameter Tuning using GridSearchCV approach
 * Finds optimal parameters for GradientBoostingRegressor
 */

const { GradientBoostingRegressor } = require('./mlModels');

/**
 * GridSearchCV - Grid Search with Cross-Validation
 * Equivalent to sklearn.model_selection.GridSearchCV
 */
class GridSearchCV {
  constructor(estimator, paramGrid, cv = 3) {
    this.estimator = estimator;
    this.paramGrid = paramGrid;
    this.cv = cv; // Number of cross-validation folds
    this.bestParams = null;
    this.bestScore = -Infinity;
    this.bestEstimator = null;
    this.cvResults = [];
    this.isFitted = false;
  }

  /**
   * Fit the grid search
   */
  fit(X, y) {
    if (!Array.isArray(X) || !Array.isArray(y)) {
      throw new Error('X and y must be arrays');
    }

    const paramCombinations = this._generateParamCombinations(this.paramGrid);
    console.log(`GridSearchCV: Testing ${paramCombinations.length} parameter combinations with ${this.cv}-fold CV`);

    // Test each parameter combination
    for (const params of paramCombinations) {
      const scores = this._crossValidate(X, y, params);
      const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const stdScore = this._calculateStd(scores);

      this.cvResults.push({
        params,
        meanScore,
        stdScore,
        scores
      });

      console.log(`  Params: ${JSON.stringify(params)} → Mean Score: ${meanScore.toFixed(4)}, Std: ${stdScore.toFixed(4)}`);

      // Update best parameters
      if (meanScore > this.bestScore) {
        this.bestScore = meanScore;
        this.bestParams = params;
      }
    }

    // Train final model with best parameters
    this.bestEstimator = new GradientBoostingRegressor(this.bestParams);
    this.bestEstimator.fit(X, y);

    this.isFitted = true;
    console.log(`GridSearchCV: Best parameters found: ${JSON.stringify(this.bestParams)}`);
    console.log(`GridSearchCV: Best CV score: ${this.bestScore.toFixed(4)}`);

    return this;
  }

  /**
   * Generate all parameter combinations
   */
  _generateParamCombinations(paramGrid) {
    const combinations = [];
    const keys = Object.keys(paramGrid);

    const generate = (index, current) => {
      if (index === keys.length) {
        combinations.push({ ...current });
        return;
      }

      const key = keys[index];
      const values = paramGrid[key];

      for (const value of values) {
        current[key] = value;
        generate(index + 1, current);
      }
    };

    generate(0, {});
    return combinations;
  }

  /**
   * Cross-validation
   */
  _crossValidate(X, y, params) {
    const scores = [];
    const foldSize = Math.ceil(X.length / this.cv);

    for (let fold = 0; fold < this.cv; fold++) {
      // Split data into train and validation
      const valStart = fold * foldSize;
      const valEnd = Math.min((fold + 1) * foldSize, X.length);

      const X_val = X.slice(valStart, valEnd);
      const y_val = y.slice(valStart, valEnd);

      const X_train = [...X.slice(0, valStart), ...X.slice(valEnd)];
      const y_train = [...y.slice(0, valStart), ...y.slice(valEnd)];

      // Train model
      const model = new GradientBoostingRegressor(params);
      model.fit(X_train, y_train);

      // Evaluate on validation set
      const predictions = model.predict(X_val);
      const score = this._calculateR2Score(y_val, predictions);
      scores.push(score);
    }

    return scores;
  }

  /**
   * Calculate R² score (coefficient of determination)
   * R² = 1 - (SS_res / SS_tot)
   * SS_res = sum of squared residuals
   * SS_tot = total sum of squares
   */
  _calculateR2Score(y_true, y_pred) {
    const mean_y = y_true.reduce((a, b) => a + b, 0) / y_true.length;

    let ss_res = 0;
    let ss_tot = 0;

    for (let i = 0; i < y_true.length; i++) {
      ss_res += Math.pow(y_true[i] - y_pred[i], 2);
      ss_tot += Math.pow(y_true[i] - mean_y, 2);
    }

    const r2 = 1 - (ss_res / ss_tot);
    return r2;
  }

  /**
   * Calculate standard deviation
   */
  _calculateStd(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Get best estimator
   */
  getBestEstimator() {
    if (!this.isFitted) {
      throw new Error('GridSearchCV must be fitted before getting best estimator');
    }
    return this.bestEstimator;
  }

  /**
   * Get best parameters
   */
  getBestParams() {
    if (!this.isFitted) {
      throw new Error('GridSearchCV must be fitted before getting best parameters');
    }
    return this.bestParams;
  }

  /**
   * Get best score
   */
  getBestScore() {
    if (!this.isFitted) {
      throw new Error('GridSearchCV must be fitted before getting best score');
    }
    return this.bestScore;
  }

  /**
   * Get CV results
   */
  getCVResults() {
    return this.cvResults;
  }

  /**
   * Get results summary
   */
  getResultsSummary() {
    return {
      bestParams: this.bestParams,
      bestScore: this.bestScore,
      totalCombinations: this.cvResults.length,
      cvFolds: this.cv,
      allResults: this.cvResults
    };
  }
}

/**
 * RandomizedSearchCV - Random Search with Cross-Validation
 * Samples random parameter combinations instead of exhaustive grid
 */
class RandomizedSearchCV {
  constructor(estimator, paramDistributions, nIter = 10, cv = 3) {
    this.estimator = estimator;
    this.paramDistributions = paramDistributions;
    this.nIter = nIter; // Number of parameter combinations to sample
    this.cv = cv;
    this.bestParams = null;
    this.bestScore = -Infinity;
    this.bestEstimator = null;
    this.cvResults = [];
    this.isFitted = false;
  }

  /**
   * Fit the random search
   */
  fit(X, y) {
    if (!Array.isArray(X) || !Array.isArray(y)) {
      throw new Error('X and y must be arrays');
    }

    const paramCombinations = this._sampleRandomParams(this.nIter);
    console.log(`RandomizedSearchCV: Testing ${paramCombinations.length} random parameter combinations with ${this.cv}-fold CV`);

    // Test each parameter combination
    for (const params of paramCombinations) {
      const scores = this._crossValidate(X, y, params);
      const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const stdScore = this._calculateStd(scores);

      this.cvResults.push({
        params,
        meanScore,
        stdScore,
        scores
      });

      console.log(`  Params: ${JSON.stringify(params)} → Mean Score: ${meanScore.toFixed(4)}, Std: ${stdScore.toFixed(4)}`);

      // Update best parameters
      if (meanScore > this.bestScore) {
        this.bestScore = meanScore;
        this.bestParams = params;
      }
    }

    // Train final model with best parameters
    const { GradientBoostingRegressor } = require('./mlModels');
    this.bestEstimator = new GradientBoostingRegressor(this.bestParams);
    this.bestEstimator.fit(X, y);

    this.isFitted = true;
    console.log(`RandomizedSearchCV: Best parameters found: ${JSON.stringify(this.bestParams)}`);
    console.log(`RandomizedSearchCV: Best CV score: ${this.bestScore.toFixed(4)}`);

    return this;
  }

  /**
   * Sample random parameter combinations
   */
  _sampleRandomParams(nIter) {
    const combinations = [];

    for (let i = 0; i < nIter; i++) {
      const params = {};

      Object.keys(this.paramDistributions).forEach(key => {
        const distribution = this.paramDistributions[key];

        if (Array.isArray(distribution)) {
          // Discrete values
          params[key] = distribution[Math.floor(Math.random() * distribution.length)];
        } else if (distribution.type === 'uniform') {
          // Uniform distribution
          params[key] = distribution.min + Math.random() * (distribution.max - distribution.min);
        } else if (distribution.type === 'int_uniform') {
          // Integer uniform distribution
          params[key] = Math.floor(distribution.min + Math.random() * (distribution.max - distribution.min + 1));
        }
      });

      combinations.push(params);
    }

    return combinations;
  }

  /**
   * Cross-validation
   */
  _crossValidate(X, y, params) {
    const scores = [];
    const foldSize = Math.ceil(X.length / this.cv);

    for (let fold = 0; fold < this.cv; fold++) {
      // Split data into train and validation
      const valStart = fold * foldSize;
      const valEnd = Math.min((fold + 1) * foldSize, X.length);

      const X_val = X.slice(valStart, valEnd);
      const y_val = y.slice(valStart, valEnd);

      const X_train = [...X.slice(0, valStart), ...X.slice(valEnd)];
      const y_train = [...y.slice(0, valStart), ...y.slice(valEnd)];

      // Train model
      const { GradientBoostingRegressor } = require('./mlModels');
      const model = new GradientBoostingRegressor(params);
      model.fit(X_train, y_train);

      // Evaluate on validation set
      const predictions = model.predict(X_val);
      const score = this._calculateR2Score(y_val, predictions);
      scores.push(score);
    }

    return scores;
  }

  /**
   * Calculate R² score
   */
  _calculateR2Score(y_true, y_pred) {
    const mean_y = y_true.reduce((a, b) => a + b, 0) / y_true.length;

    let ss_res = 0;
    let ss_tot = 0;

    for (let i = 0; i < y_true.length; i++) {
      ss_res += Math.pow(y_true[i] - y_pred[i], 2);
      ss_tot += Math.pow(y_true[i] - mean_y, 2);
    }

    const r2 = 1 - (ss_res / ss_tot);
    return r2;
  }

  /**
   * Calculate standard deviation
   */
  _calculateStd(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Get best estimator
   */
  getBestEstimator() {
    if (!this.isFitted) {
      throw new Error('RandomizedSearchCV must be fitted before getting best estimator');
    }
    return this.bestEstimator;
  }

  /**
   * Get best parameters
   */
  getBestParams() {
    if (!this.isFitted) {
      throw new Error('RandomizedSearchCV must be fitted before getting best parameters');
    }
    return this.bestParams;
  }

  /**
   * Get best score
   */
  getBestScore() {
    if (!this.isFitted) {
      throw new Error('RandomizedSearchCV must be fitted before getting best score');
    }
    return this.bestScore;
  }

  /**
   * Get CV results
   */
  getCVResults() {
    return this.cvResults;
  }
}

module.exports = {
  GridSearchCV,
  RandomizedSearchCV
};

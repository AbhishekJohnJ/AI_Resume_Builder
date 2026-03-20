/**
 * Machine Learning Models for Resume Score Prediction
 * Implements GradientBoostingRegressor and RandomForestRegressor
 */

/**
 * GradientBoostingRegressor - Gradient Boosting for regression
 * Parameters: n_estimators=200, learning_rate=0.1
 */
class GradientBoostingRegressor {
  constructor(options = {}) {
    this.n_estimators = options.n_estimators || 200;
    this.learning_rate = options.learning_rate || 0.1;
    this.max_depth = options.max_depth || 5;
    this.min_samples_split = options.min_samples_split || 2;
    this.min_samples_leaf = options.min_samples_leaf || 1;
    this.subsample = options.subsample || 1.0;
    
    this.trees = [];
    this.initial_prediction = 0;
    this.feature_importances_ = {};
    this.is_fitted = false;
  }

  /**
   * Fit the model on training data
   */
  fit(X, y) {
    if (!Array.isArray(X) || !Array.isArray(y)) {
      throw new Error('X and y must be arrays');
    }

    const n_samples = X.length;
    const n_features = X[0].length;

    // Initialize with mean prediction
    this.initial_prediction = y.reduce((a, b) => a + b, 0) / y.length;
    let predictions = new Array(n_samples).fill(this.initial_prediction);

    // Initialize feature importances
    for (let i = 0; i < n_features; i++) {
      this.feature_importances_[i] = 0;
    }

    // Boosting iterations
    for (let iter = 0; iter < this.n_estimators; iter++) {
      // Calculate residuals
      const residuals = y.map((val, idx) => val - predictions[idx]);

      // Fit tree to residuals
      const tree = this._fitTree(X, residuals, 0, n_features);
      this.trees.push(tree);

      // Update predictions
      const tree_predictions = this._predictTree(X, tree);
      for (let i = 0; i < n_samples; i++) {
        predictions[i] += this.learning_rate * tree_predictions[i];
      }

      // Update feature importances
      this._updateFeatureImportances(tree, n_features);
    }

    this.is_fitted = true;
    return this;
  }

  /**
   * Fit a single decision tree to residuals
   */
  _fitTree(X, y, depth, n_features) {
    const n_samples = X.length;

    // Stopping criteria
    if (depth >= this.max_depth || n_samples < this.min_samples_split) {
      const mean_value = y.reduce((a, b) => a + b, 0) / y.length;
      return { is_leaf: true, value: mean_value };
    }

    let best_split = null;
    let best_gain = 0;

    // Find best split
    for (let feature = 0; feature < n_features; feature++) {
      const feature_values = X.map(x => x[feature]);
      const unique_values = [...new Set(feature_values)].sort((a, b) => a - b);

      for (let i = 0; i < unique_values.length - 1; i++) {
        const threshold = (unique_values[i] + unique_values[i + 1]) / 2;

        const left_indices = [];
        const right_indices = [];

        for (let j = 0; j < n_samples; j++) {
          if (X[j][feature] <= threshold) {
            left_indices.push(j);
          } else {
            right_indices.push(j);
          }
        }

        if (left_indices.length < this.min_samples_leaf || right_indices.length < this.min_samples_leaf) {
          continue;
        }

        // Calculate information gain
        const left_y = left_indices.map(idx => y[idx]);
        const right_y = right_indices.map(idx => y[idx]);

        const left_var = this._variance(left_y);
        const right_var = this._variance(right_y);

        const gain = this._variance(y) - 
                     (left_indices.length / n_samples) * left_var - 
                     (right_indices.length / n_samples) * right_var;

        if (gain > best_gain) {
          best_gain = gain;
          best_split = {
            feature,
            threshold,
            left_indices,
            right_indices
          };
        }
      }
    }

    if (!best_split) {
      const mean_value = y.reduce((a, b) => a + b, 0) / y.length;
      return { is_leaf: true, value: mean_value };
    }

    // Recursively build left and right subtrees
    const left_y = best_split.left_indices.map(idx => y[idx]);
    const right_y = best_split.right_indices.map(idx => y[idx]);
    const left_X = best_split.left_indices.map(idx => X[idx]);
    const right_X = best_split.right_indices.map(idx => X[idx]);

    return {
      is_leaf: false,
      feature: best_split.feature,
      threshold: best_split.threshold,
      left: this._fitTree(left_X, left_y, depth + 1, n_features),
      right: this._fitTree(right_X, right_y, depth + 1, n_features)
    };
  }

  /**
   * Predict using a single tree
   */
  _predictTree(X, tree) {
    return X.map(x => this._predictSample(x, tree));
  }

  /**
   * Predict a single sample
   */
  _predictSample(x, tree) {
    if (tree.is_leaf) {
      return tree.value;
    }

    if (x[tree.feature] <= tree.threshold) {
      return this._predictSample(x, tree.left);
    } else {
      return this._predictSample(x, tree.right);
    }
  }

  /**
   * Calculate variance
   */
  _variance(y) {
    if (y.length === 0) return 0;
    const mean = y.reduce((a, b) => a + b, 0) / y.length;
    const variance = y.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / y.length;
    return variance;
  }

  /**
   * Update feature importances
   */
  _updateFeatureImportances(tree, n_features) {
    const traverse = (node) => {
      if (!node.is_leaf) {
        this.feature_importances_[node.feature] = 
          (this.feature_importances_[node.feature] || 0) + 1;
        traverse(node.left);
        traverse(node.right);
      }
    };
    traverse(tree);
  }

  /**
   * Predict on new data
   */
  predict(X) {
    if (!this.is_fitted) {
      throw new Error('Model must be fitted before prediction');
    }

    let predictions = X.map(() => this.initial_prediction);

    for (const tree of this.trees) {
      const tree_predictions = this._predictTree(X, tree);
      for (let i = 0; i < X.length; i++) {
        predictions[i] += this.learning_rate * tree_predictions[i];
      }
    }

    return predictions;
  }

  /**
   * Get feature importances
   */
  getFeatureImportances() {
    const total = Object.values(this.feature_importances_).reduce((a, b) => a + b, 0);
    const normalized = {};
    
    Object.keys(this.feature_importances_).forEach(key => {
      normalized[key] = total > 0 ? this.feature_importances_[key] / total : 0;
    });

    return normalized;
  }
}

/**
 * RandomForestRegressor - Random Forest for regression
 * Ensemble of decision trees with random feature selection
 */
class RandomForestRegressor {
  constructor(options = {}) {
    this.n_estimators = options.n_estimators || 100;
    this.max_depth = options.max_depth || 10;
    this.min_samples_split = options.min_samples_split || 2;
    this.min_samples_leaf = options.min_samples_leaf || 1;
    this.max_features = options.max_features || 'sqrt';
    this.random_state = options.random_state || 42;
    
    this.trees = [];
    this.feature_importances_ = {};
    this.is_fitted = false;
  }

  /**
   * Fit the model on training data
   */
  fit(X, y) {
    if (!Array.isArray(X) || !Array.isArray(y)) {
      throw new Error('X and y must be arrays');
    }

    const n_samples = X.length;
    const n_features = X[0].length;

    // Initialize feature importances
    for (let i = 0; i < n_features; i++) {
      this.feature_importances_[i] = 0;
    }

    // Build multiple trees
    for (let tree_idx = 0; tree_idx < this.n_estimators; tree_idx++) {
      // Bootstrap sampling
      const bootstrap_indices = this._bootstrapSample(n_samples);
      const X_bootstrap = bootstrap_indices.map(idx => X[idx]);
      const y_bootstrap = bootstrap_indices.map(idx => y[idx]);

      // Fit tree
      const tree = this._fitTree(X_bootstrap, y_bootstrap, 0, n_features);
      this.trees.push(tree);

      // Update feature importances
      this._updateFeatureImportances(tree, n_features);
    }

    this.is_fitted = true;
    return this;
  }

  /**
   * Bootstrap sampling
   */
  _bootstrapSample(n_samples) {
    const indices = [];
    for (let i = 0; i < n_samples; i++) {
      indices.push(Math.floor(Math.random() * n_samples));
    }
    return indices;
  }

  /**
   * Fit a single decision tree
   */
  _fitTree(X, y, depth, n_features) {
    const n_samples = X.length;

    // Stopping criteria
    if (depth >= this.max_depth || n_samples < this.min_samples_split) {
      const mean_value = y.reduce((a, b) => a + b, 0) / y.length;
      return { is_leaf: true, value: mean_value };
    }

    // Random feature selection
    const n_features_to_use = this.max_features === 'sqrt' 
      ? Math.ceil(Math.sqrt(n_features))
      : this.max_features;

    const feature_indices = this._randomFeatureSelection(n_features, n_features_to_use);

    let best_split = null;
    let best_gain = 0;

    // Find best split among random features
    for (const feature of feature_indices) {
      const feature_values = X.map(x => x[feature]);
      const unique_values = [...new Set(feature_values)].sort((a, b) => a - b);

      for (let i = 0; i < unique_values.length - 1; i++) {
        const threshold = (unique_values[i] + unique_values[i + 1]) / 2;

        const left_indices = [];
        const right_indices = [];

        for (let j = 0; j < n_samples; j++) {
          if (X[j][feature] <= threshold) {
            left_indices.push(j);
          } else {
            right_indices.push(j);
          }
        }

        if (left_indices.length < this.min_samples_leaf || right_indices.length < this.min_samples_leaf) {
          continue;
        }

        // Calculate information gain
        const left_y = left_indices.map(idx => y[idx]);
        const right_y = right_indices.map(idx => y[idx]);

        const left_var = this._variance(left_y);
        const right_var = this._variance(right_y);

        const gain = this._variance(y) - 
                     (left_indices.length / n_samples) * left_var - 
                     (right_indices.length / n_samples) * right_var;

        if (gain > best_gain) {
          best_gain = gain;
          best_split = {
            feature,
            threshold,
            left_indices,
            right_indices
          };
        }
      }
    }

    if (!best_split) {
      const mean_value = y.reduce((a, b) => a + b, 0) / y.length;
      return { is_leaf: true, value: mean_value };
    }

    // Recursively build subtrees
    const left_y = best_split.left_indices.map(idx => y[idx]);
    const right_y = best_split.right_indices.map(idx => y[idx]);
    const left_X = best_split.left_indices.map(idx => X[idx]);
    const right_X = best_split.right_indices.map(idx => X[idx]);

    return {
      is_leaf: false,
      feature: best_split.feature,
      threshold: best_split.threshold,
      left: this._fitTree(left_X, left_y, depth + 1, n_features),
      right: this._fitTree(right_X, right_y, depth + 1, n_features)
    };
  }

  /**
   * Random feature selection
   */
  _randomFeatureSelection(n_features, n_to_select) {
    const indices = [];
    const available = Array.from({ length: n_features }, (_, i) => i);

    for (let i = 0; i < n_to_select && available.length > 0; i++) {
      const random_idx = Math.floor(Math.random() * available.length);
      indices.push(available[random_idx]);
      available.splice(random_idx, 1);
    }

    return indices;
  }

  /**
   * Predict using ensemble
   */
  predict(X) {
    if (!this.is_fitted) {
      throw new Error('Model must be fitted before prediction');
    }

    const predictions = X.map(() => 0);

    for (const tree of this.trees) {
      const tree_predictions = X.map(x => this._predictSample(x, tree));
      for (let i = 0; i < X.length; i++) {
        predictions[i] += tree_predictions[i];
      }
    }

    // Average predictions
    for (let i = 0; i < predictions.length; i++) {
      predictions[i] /= this.n_estimators;
    }

    return predictions;
  }

  /**
   * Predict a single sample
   */
  _predictSample(x, tree) {
    if (tree.is_leaf) {
      return tree.value;
    }

    if (x[tree.feature] <= tree.threshold) {
      return this._predictSample(x, tree.left);
    } else {
      return this._predictSample(x, tree.right);
    }
  }

  /**
   * Calculate variance
   */
  _variance(y) {
    if (y.length === 0) return 0;
    const mean = y.reduce((a, b) => a + b, 0) / y.length;
    const variance = y.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / y.length;
    return variance;
  }

  /**
   * Update feature importances
   */
  _updateFeatureImportances(tree, n_features) {
    const traverse = (node) => {
      if (!node.is_leaf) {
        this.feature_importances_[node.feature] = 
          (this.feature_importances_[node.feature] || 0) + 1;
        traverse(node.left);
        traverse(node.right);
      }
    };
    traverse(tree);
  }

  /**
   * Get feature importances
   */
  getFeatureImportances() {
    const total = Object.values(this.feature_importances_).reduce((a, b) => a + b, 0);
    const normalized = {};
    
    Object.keys(this.feature_importances_).forEach(key => {
      normalized[key] = total > 0 ? this.feature_importances_[key] / total : 0;
    });

    return normalized;
  }
}

module.exports = {
  GradientBoostingRegressor,
  RandomForestRegressor
};

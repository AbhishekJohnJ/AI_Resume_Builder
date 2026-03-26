# AI Module Troubleshooting Guide

## Error: "Unexpected token '<', '<!DOCTYPE'... is not valid JSON"

This error means the Python script is outputting HTML or other non-JSON content instead of JSON.

### Causes & Solutions

#### 1. Models Not Trained
**Error**: Python script crashes and outputs error HTML
**Solution**:
```bash
python train_ai_models.py
```

#### 2. Python Not Found
**Error**: `spawn python ENOENT`
**Solution**:
- Ensure Python 3.8+ is installed
- Add Python to system PATH
- Test: `python --version`

#### 3. Missing Dependencies
**Error**: `ModuleNotFoundError: No module named 'sentence_transformers'`
**Solution**:
```bash
pip install -r requirements.txt
```

#### 4. Verbose Logging Interfering
**Error**: Python prints debug logs before JSON
**Solution**: Already fixed in `ai/predict_api.py` - logging is suppressed

#### 5. PDF Extraction Failure
**Error**: PDF contains no text or is corrupted
**Solution**:
- Ensure PDF contains text (not scanned image)
- Try a different PDF
- Check file size (max 10 MB)

### Quick Test

Run this to verify setup:
```bash
python test_ai_setup.py
```

Expected output:
```
🧪 AI MODULE SETUP TEST
======================================================================

🧪 Testing imports...
   ✅ config.py
   ✅ pdf_parser.py
   ✅ preprocess.py
   ✅ embedder.py
   ✅ feedback.py
   ✅ dataset_loader.py
✅ All imports successful

🧪 Checking trained models...
   Score model: ✅ ai/models/score_model.pkl
   Level model: ✅ ai/models/level_model.pkl
   Scaler: ✅ ai/models/scaler.pkl
✅ All models exist

🧪 Testing dataset loading...
   ✅ Dataset loaded: 500 records
   Columns: 21
✅ Dataset test passed

🧪 Testing feature extraction...
   ✅ Features extracted
      Skills: 6
      Projects: 3
      Certifications: 2
      GitHub: 1
      LinkedIn: 1
✅ Feature extraction test passed

======================================================================
📊 TEST RESULTS
======================================================================
Imports              ✅ PASS
Models               ✅ PASS
Dataset              ✅ PASS
Features             ✅ PASS
======================================================================
✅ ALL TESTS PASSED - AI module is ready!
======================================================================
```

## Common Issues & Fixes

### Issue 1: "No file or directory: ai/models/score_model.pkl"

**Cause**: Models haven't been trained yet

**Fix**:
```bash
python train_ai_models.py
```

**Expected output**:
```
======================================================================
🚀 TRAINING AI RESUME ANALYZER MODELS
======================================================================
...
✅ ALL MODELS TRAINED AND SAVED SUCCESSFULLY
======================================================================
```

### Issue 2: "spawn python ENOENT"

**Cause**: Python is not in system PATH

**Fix**:
1. Check Python is installed: `python --version`
2. Add Python to PATH:
   - **Windows**: Add Python installation folder to PATH
   - **Mac/Linux**: Usually already in PATH
3. Restart terminal/IDE

### Issue 3: "ModuleNotFoundError: No module named 'sentence_transformers'"

**Cause**: Python dependencies not installed

**Fix**:
```bash
pip install -r requirements.txt
```

**Verify**:
```bash
python -c "import sentence_transformers; print('OK')"
```

### Issue 4: "PDF extraction failed: No text extracted from PDF"

**Cause**: PDF is a scanned image or corrupted

**Fix**:
- Use a text-based PDF (not scanned)
- Try a different PDF
- Check file size (max 10 MB)

### Issue 5: "Connection refused" on port 5000

**Cause**: Backend server not running

**Fix**:
```bash
cd server
npm run dev
```

**Verify**:
```bash
curl http://localhost:5000/api/ai/health
```

### Issue 6: "CUDA out of memory"

**Cause**: GPU memory exhausted

**Fix**:
```bash
# Use CPU instead
export CUDA_VISIBLE_DEVICES=""
python train_ai_models.py
```

### Issue 7: "JSON parse error" in browser console

**Cause**: Python script output is not valid JSON

**Fix**:
1. Check server logs for Python errors
2. Run `python test_ai_setup.py` to verify setup
3. Check if models are trained
4. Restart server

## Step-by-Step Verification

### Step 1: Verify Python Setup
```bash
python --version
# Should be 3.8 or higher
```

### Step 2: Verify Dependencies
```bash
pip list | grep -E "numpy|pandas|scikit-learn|sentence-transformers|PyMuPDF"
# Should show all packages
```

### Step 3: Verify Models
```bash
ls -la ai/models/
# Should show: score_model.pkl, level_model.pkl, scaler.pkl
```

### Step 4: Verify Dataset
```bash
python -c "import json; data = json.load(open('dataset/resume-dataset.json')); print(f'Records: {len(data[\"records\"])}')"
# Should show: Records: 500
```

### Step 5: Verify Backend
```bash
cd server
npm run dev
# Should show: 🚀 Server running on port 5000
```

### Step 6: Verify API
```bash
curl http://localhost:5000/api/ai/health
# Should return: {"status":"ready","models_trained":true}
```

### Step 7: Verify Frontend
Open http://localhost:3000 and go to "AI Analyser"

## Debug Mode

### Enable Verbose Logging

Edit `ai/predict_api.py` and change:
```python
logging.getLogger().setLevel(logging.ERROR)
```

To:
```python
logging.getLogger().setLevel(logging.DEBUG)
```

### Check Server Logs

Watch server logs while uploading:
```bash
cd server
npm run dev
# Upload PDF in another terminal
# Watch logs for errors
```

### Check Python Output

Test Python directly:
```bash
python ai/predict_api.py predict_text '{"resume_text":"John Doe Software Engineer"}'
# Should output JSON
```

## Performance Issues

### Slow First Prediction (5-10 seconds)

**Normal**: First prediction loads models into memory
**Solution**: Subsequent predictions are faster (2-3 seconds)

### Slow Subsequent Predictions (>5 seconds)

**Cause**: System resources exhausted
**Solution**:
- Close other applications
- Increase available RAM
- Use CPU instead of GPU

### High Memory Usage (>1 GB)

**Cause**: Large embeddings or models
**Solution**:
- This is normal for Hugging Face models
- Ensure 2+ GB RAM available

## Getting Help

1. **Check this file** - Most issues are covered
2. **Run test script**: `python test_ai_setup.py`
3. **Check server logs** - Look for Python errors
4. **Check browser console** - Look for JavaScript errors
5. **Read documentation** - See AI_MODULE_SETUP.md

## Still Having Issues?

1. **Verify all 3 setup steps completed**:
   - [ ] `pip install -r requirements.txt`
   - [ ] `python train_ai_models.py`
   - [ ] `cd server && npm run dev`

2. **Run test script**:
   ```bash
   python test_ai_setup.py
   ```

3. **Check all files exist**:
   ```bash
   ls ai/models/score_model.pkl
   ls ai/models/level_model.pkl
   ls ai/models/scaler.pkl
   ```

4. **Restart everything**:
   - Stop server (Ctrl+C)
   - Stop any Python processes
   - Start fresh: `npm run dev`

5. **Check logs carefully** - Most errors are in the logs

## Success Indicators

✅ `python test_ai_setup.py` shows all PASS
✅ `curl http://localhost:5000/api/ai/health` returns ready
✅ Can upload PDF without errors
✅ Can analyze text without errors
✅ Different resumes get different scores
✅ No errors in server logs
✅ No errors in browser console

If all above are true, your AI module is working correctly!

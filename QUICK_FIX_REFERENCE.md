# Quick Fix Reference - ENAMETOOLONG Error

## ✅ What Was Fixed

**Error**: `spawn ENAMETOOLONG`
**Cause**: Large JSON passed as command-line argument
**Solution**: Use stdin instead

---

## Changes Made

### 1. Backend Route (server/routes/aiRoutes.js)

**Before**:
```javascript
spawn('python', [
  path.join(__dirname, '../../ai/predict_api.py'),
  method,
  JSON.stringify(data)  // ❌ Too large
]);
```

**After**:
```javascript
const pythonProcess = spawn('python', [
  path.join(__dirname, '../../ai/predict_api.py'),
  method  // ✅ Only method
]);

// Send data through stdin
pythonProcess.stdin.write(JSON.stringify(data));
pythonProcess.stdin.end();
```

### 2. Python Script (ai/predict_api.py)

**Before**:
```python
method = sys.argv[1]
data = json.loads(sys.argv[2])  # ❌ From command-line
```

**After**:
```python
method = sys.argv[1]
input_data = sys.stdin.read()  # ✅ From stdin
data = json.loads(input_data)
```

### 3. Filename Handling (server/routes/aiRoutes.js)

**Before**:
```javascript
filename: req.file.originalname  // ❌ Can be very long
```

**After**:
```javascript
const safeFilename = `resume_${Date.now()}.pdf`;  // ✅ Short and safe
filename: safeFilename
```

---

## Result

| Test Case | Before | After |
|-----------|--------|-------|
| Small resume (10KB) | ✅ Works | ✅ Works |
| Large resume (500KB) | ❌ ENAMETOOLONG | ✅ Works |
| Very long filename | ❌ Error | ✅ Works |
| Large text input | ❌ ENAMETOOLONG | ✅ Works |

---

## How to Verify

1. **Check server logs**:
   ```
   📤 [SPAWN] Starting Python process
      Method: predict_pdf
      Data size: 250000 bytes
      Exit code: 0
   ```

2. **Upload large resume**: Should work without error

3. **Check browser console**: Should show successful response

---

## Files Modified

- ✅ `server/routes/aiRoutes.js` - stdin communication + safe filenames
- ✅ `ai/predict_api.py` - stdin reading

---

## Status

✅ **Fixed and tested**
✅ **Server running**
✅ **Ready to use**

**Try uploading a large resume now!** 🚀

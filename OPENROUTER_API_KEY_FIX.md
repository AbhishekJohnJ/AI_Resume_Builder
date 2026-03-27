# OpenRouter API Key Error - Fix Guide

## Problem
```
❌ OpenRouter error: Request failed with status code 401
Response: { error: { message: 'User not found.', code: 401 } }
```

This error means the API key in your `.env` file is **invalid or expired**.

## Solution

### Step 1: Get a Valid OpenRouter API Key

1. Go to https://openrouter.ai
2. Sign up or log in to your account
3. Go to Settings → API Keys
4. Create a new API key or copy your existing one
5. The key should start with `sk-or-v1-`

### Step 2: Update Your .env File

**File**: `server/.env`

Replace the invalid key with your valid one:

```env
OPENROUTER_API_KEY=sk-or-v1-YOUR_ACTUAL_API_KEY_HERE
```

**Example** (with a valid format):
```env
OPENROUTER_API_KEY=sk-or-v1-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

### Step 3: Restart the Server

```bash
cd server
npm run dev
```

### Step 4: Test the API

Try uploading a resume again. You should see:
```
✅ OpenRouter response received
✅ Analysis complete
```

## Verify Your API Key

### Check if API Key is Set
```bash
cat server/.env | grep OPENROUTER_API_KEY
```

### Check if API Key is Valid
The key should:
- ✅ Start with `sk-or-v1-`
- ✅ Be at least 50 characters long
- ✅ Contain only alphanumeric characters and hyphens
- ✅ Be from your OpenRouter account

## Common Issues

### Issue: "User not found" (401 error)
**Cause**: Invalid or expired API key
**Fix**: Get a new API key from OpenRouter

### Issue: "Unauthorized" (401 error)
**Cause**: API key not recognized
**Fix**: Verify the key is correct and hasn't been revoked

### Issue: "Rate limit exceeded" (429 error)
**Cause**: Too many requests
**Fix**: Wait a moment and try again

### Issue: "Invalid request" (400 error)
**Cause**: Problem with the request format
**Fix**: Check server logs for details

## Getting Your OpenRouter API Key

### Step-by-Step:

1. **Visit OpenRouter**
   - Go to https://openrouter.ai

2. **Sign Up or Log In**
   - Create account or log in with existing credentials

3. **Navigate to API Keys**
   - Click on your profile/settings
   - Look for "API Keys" or "Keys" section

4. **Create or Copy API Key**
   - Click "Create New Key" or copy existing key
   - The key will start with `sk-or-v1-`

5. **Copy the Full Key**
   - Make sure to copy the entire key
   - Don't share it with anyone

6. **Update .env File**
   ```env
   OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE
   ```

7. **Restart Server**
   ```bash
   npm run dev
   ```

## Testing After Update

### Test 1: Check API Key is Loaded
```bash
cat server/.env | grep OPENROUTER_API_KEY
# Should show your key
```

### Test 2: Check Server Logs
```
✅ OpenRouter API key configured
```

### Test 3: Upload a Resume
- Go to http://localhost:3000/ai-analyser
- Upload a PDF resume
- Should see analysis results (not 401 error)

## If Still Getting 401 Error

1. **Verify the key is correct**
   - Copy it again from OpenRouter
   - Make sure no extra spaces

2. **Check the key hasn't been revoked**
   - Log into OpenRouter
   - Check if key is still active

3. **Try a different key**
   - Create a new API key in OpenRouter
   - Update .env with new key

4. **Check server logs**
   - Look for exact error message
   - May give more details

## File to Update

**Location**: `server/.env`

**Current (Invalid)**:
```env
OPENROUTER_API_KEY=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
```

**Should be (Your Valid Key)**:
```env
OPENROUTER_API_KEY=sk-or-v1-YOUR_ACTUAL_KEY_FROM_OPENROUTER
```

## After Fixing

Once you update the API key:

1. ✅ Resume Analyzer will work
2. ✅ Resume Builder will work
3. ✅ Portfolio Builder will work
4. ✅ All AI features will be enabled

## Support

If you still have issues:
1. Verify API key format (starts with `sk-or-v1-`)
2. Check key is from your OpenRouter account
3. Verify key hasn't been revoked
4. Try creating a new key
5. Check server logs for exact error
6. Restart server after updating .env

## Status

- ❌ Current API key: Invalid (401 error)
- ⏳ Action needed: Update with valid OpenRouter API key
- ✅ Once updated: All features will work

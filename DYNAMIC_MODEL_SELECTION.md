# Dynamic Ollama Model Selection

## Feature Overview

The AI settings page now dynamically fetches and displays available Ollama models installed on the server, making it easy for users to select from their installed models without manual configuration.

## How It Works

### 1. API Endpoint

**`/api/ollama/models`** - Returns available Ollama models

```typescript
GET /api/ollama/models

Response:
{
  available: true,
  models: [
    {
      name: "llama3.2:3b",
      displayName: "Llama 3.2 (3B)",
      size: 2048576000,
      modified: "2024-10-29T..."
    }
  ],
  baseUrl: "http://localhost:11434"
}
```

### 2. Frontend Integration

The AI settings page (`/account/ai`):

- Automatically fetches models on page load
- Shows real-time Ollama status
- Displays model sizes for each option
- Provides a "Refresh Models" button
- Shows helpful error messages if Ollama is unavailable

## User Experience

### When Ollama is Running ✅

- Lists all installed models with their sizes
- Shows: "✓ Ollama is running with X models available"
- Models appear as: "Llama 3.2 3B (1.9 GB)"

### When Ollama is Not Running ⚠️

- Shows: "⚠️ Ollama not available"
- Provides installation instructions
- Links to ollama.com
- Shows example command: `ollama pull llama3.2:3b`

### Refresh Feature 🔄

- Button appears only when "Local (Ollama)" is selected
- Click to re-check for newly installed models
- Shows spinner while loading
- Updates dropdown immediately

## Benefits

✅ **No manual model entry** - Users don't need to type model names
✅ **Always up-to-date** - Shows currently installed models
✅ **User-friendly** - Clear status messages and help text
✅ **Error-resilient** - Gracefully handles Ollama being offline
✅ **Size information** - Users can see model sizes before selecting

## Technical Details

### Model Name Formatting

```typescript
Input: 'llama3.2:3b';
Output: 'Llama 3.2 (3B)';

Input: 'gemma2:2b-instruct-q4_0';
Output: 'Gemma2 (2B-INSTRUCT-Q4_0)';
```

### Size Formatting

```typescript
Bytes -> Human-readable
2048576000 -> "1.9 GB"
524288000  -> "500.0 MB"
```

### Error States

| State                         | Message                       | Action                      |
| ----------------------------- | ----------------------------- | --------------------------- |
| **Ollama not installed**      | "Ollama not available"        | Link to ollama.com          |
| **No models installed**       | "No models installed"         | Show `ollama pull` command  |
| **Connection timeout**        | "Failed to connect to Ollama" | Check if service is running |
| **Ollama running, no models** | "No models installed"         | Provide pull instructions   |

## Configuration

### Environment Variables

```bash
# Optional: Custom Ollama endpoint
OLLAMA_BASE_URL=http://localhost:11434
```

### Timeout Settings

- API request timeout: 3 seconds
- Prevents page hanging if Ollama is slow

## Screenshots Flow

1. **Initial Load**: Page fetches models automatically
2. **Models Available**: Dropdown populated with installed models
3. **Status Indicator**: Green checkmark with model count
4. **Refresh Button**: Re-fetch after installing new models
5. **Error State**: Clear instructions if Ollama unavailable

## Future Enhancements

Potential improvements:

- [ ] Show model download progress (if pulling via API)
- [ ] Display model parameters (context length, etc.)
- [ ] Quick-install button (trigger `ollama pull` from UI)
- [ ] Model performance indicators (speed/quality ratings)
- [ ] Filter models by size or type
- [ ] Sort options (by name, size, date)

## Testing

### Test Scenarios

1. **With Ollama Running**:

   ```bash
   ollama list  # Check installed models
   # Visit /account/ai
   # Should see all models in dropdown
   ```

2. **Without Ollama**:

   ```bash
   # Stop Ollama
   # Visit /account/ai
   # Should see error message with instructions
   ```

3. **Install New Model**:

   ```bash
   ollama pull qwen2.5:3b
   # Click "Refresh Models" button
   # New model should appear in dropdown
   ```

4. **Model Selection**:
   ```bash
   # Select a model
   # Save settings
   # Model should be used for AI companion
   ```

## Error Handling

### Backend (API)

```typescript
- Connection timeout → Return available: false
- Ollama not responding → Return error message
- Empty model list → Return empty array with available: true
```

### Frontend (UI)

```typescript
- Fetch fails → Show connection error
- No models → Show installation instructions
- Loading state → Show spinner, disable refresh button
- Success → Update dropdown, show model count
```

## Integration Points

### Used By

- AI Settings page (`/account/ai`)
- AI companion chat (`/journal/companion`)
- Journal entry creation (sentiment analysis)
- Follow-up question generation

### Depends On

- Ollama running locally or remotely
- `/api/ollama/models` endpoint
- `OLLAMA_BASE_URL` environment variable

## Migration Notes

### Before

- Users had to manually enter model names
- Static dropdown with generic options
- No way to verify model availability
- Confusing errors if model not installed

### After

- Dynamic model list from Ollama
- Real-time status indicators
- Clear error messages
- One-click refresh after installing models

## Troubleshooting

### "Ollama not available"

1. Check if Ollama is installed: `which ollama`
2. Check if Ollama is running: `curl http://localhost:11434/api/tags`
3. Start Ollama: `ollama serve`

### "No models installed"

1. Pull a model: `ollama pull llama3.2:3b`
2. Verify: `ollama list`
3. Click "Refresh Models" in UI

### Models not appearing

1. Check Ollama is running: `ollama list`
2. Check server logs for API errors
3. Verify `OLLAMA_BASE_URL` is correct
4. Try refreshing the page

### Wrong models showing

1. Click "Refresh Models" button
2. Clear browser cache
3. Check `ollama list` matches UI

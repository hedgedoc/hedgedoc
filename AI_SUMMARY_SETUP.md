# AI Summary Feature - Setup Instructions

## Overview
This feature adds AI-powered text summarization to HedgeDoc using Google's Gemini API. Users can select paragraphs from their notes and generate concise summaries.

## Configuration

### 1. Get a Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure HedgeDoc Backend

Add the following environment variable to your HedgeDoc backend configuration:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

#### For Docker Compose:
Add to your `docker-compose.yml`:

```yaml
services:
  app:
    environment:
      - GEMINI_API_KEY=your_gemini_api_key_here
```

#### For Development:
Add to your `.env` file in the backend directory:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Restart HedgeDoc
After adding the API key, restart your HedgeDoc instance for the changes to take effect.

## Usage

1. Open a note in HedgeDoc
2. Click the sidebar menu button (☰) on the right side
3. Click the "Summary" button (💡 icon) - located between Export and Share
4. In the modal that appears:
   - Click on paragraphs from the list to select them (they will be highlighted in blue)
   - Or manually enter/edit text in the text area
   - Click "Generate Summary" to create an AI summary
   - Click "Check for Issues" to scan the text for spelling, grammar, or markdown mistakes
5. The summary and issue report will appear in the result sections below

## Features

- **Paragraph Selection**: Visual paragraph selector with click-to-select interface
- **Manual Text Entry**: Ability to type or paste custom text for summarization
- **Multi-paragraph Support**: Select multiple paragraphs at once
- **Loading States**: Clear feedback during summary generation
- **Error Handling**: Informative error messages if something goes wrong
- **Issue Detection**: Optional AI-powered linting for the selected text

## API Endpoint

The backend exposes private API endpoints:

```
POST /api/private/summary
Content-Type: application/json

{
  "text": "Your text to summarize..."
}
```

Response:
```json
{
  "summary": "The generated summary text..."
}
```

```
POST /api/private/summary/check
Content-Type: application/json

{
  "text": "Your text to review..."
}
```

Response:
```json
{
  "issues": "List of issues or “No issues found.”"
}
```

## Security Notes

- The Summary feature requires authentication (uses SessionGuard)
- Only logged-in users can generate summaries
- The Gemini API key should be kept secure and not exposed to the frontend
- API requests are made server-side to protect the API key

## Troubleshooting

### "Gemini API key is not configured" Error
- Ensure the `GEMINI_API_KEY` environment variable is set correctly
- Restart the HedgeDoc backend after adding the key

### "Failed to generate summary" Error
- Check your Gemini API key is valid
- Ensure you have not exceeded your API quota
- Check backend logs for detailed error messages

### Summary Button Not Visible
- Ensure you are logged in (guest users may not see this feature)
- Check that the frontend has been rebuilt with the latest changes
- Clear your browser cache and reload the page

## Technical Details

### Backend Components
- `backend/src/summary/summary.service.ts` - Core service for Gemini API integration
- `backend/src/summary/summary.controller.ts` - API endpoint controller
- `backend/src/summary/summary.module.ts` - NestJS module configuration

### Frontend Components
- `frontend/src/components/editor-page/sidebar/specific-sidebar-entries/summary-sidebar-entry/summary-sidebar-entry.tsx` - Sidebar button component
- `frontend/src/components/editor-page/sidebar/specific-sidebar-entries/summary-sidebar-entry/summary-modal.tsx` - Modal with paragraph selection and summary display

### Localization
- Translations added to `frontend/locales/en.json` under `editor.summary`

## Future Enhancements

Possible improvements for future versions:
- Support for other AI providers (OpenAI, Claude, etc.)
- Customizable summary length
- Summary style options (bullet points, brief, detailed)
- Save summaries to note history
- Batch summarization of multiple notes

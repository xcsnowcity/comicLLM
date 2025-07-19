# CLAUDE.md - ComicLLM Project Reference

## Project Overview
ComicLLM is a local comic text extraction and translation tool using Large Language Models (LLMs). It allows users to upload comic images, extract text in proper reading order, and translate from English to Chinese with contextual explanations. The application features comprehensive internationalization support, session-based comic book management, and enhanced navigation for viewing translations.

## Architecture

### Frontend (Next.js 14 + TypeScript)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: Zustand
- **Internationalization**: React Context-based i18n system
- **Key Libraries**: react-dropzone, axios

### Backend (Node.js + Express)
- **Framework**: Express.js
- **File Upload**: Multer
- **LLM Integration**: Custom service supporting multiple providers
- **Storage**: Local file system with session-based organization

### LLM Providers Supported
- **OpenRouter** (Primary): Google Gemini 2.5 Flash Lite Preview
- **OpenAI**: GPT-4V, GPT-4o
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus

## Project Structure
```
/home/cheng/comicLLM/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   │   ├── page.tsx     # Main upload/processing page
│   │   │   ├── settings/    # Settings page
│   │   │   └── layout.tsx   # Root layout with i18n provider
│   │   ├── components/      # Reusable components
│   │   │   ├── FileUpload.tsx
│   │   │   ├── TextDisplay.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── SessionManager.tsx  # Comic book library
│   │   │   ├── SessionControl.tsx  # Session management
│   │   │   ├── LanguageSwitcher.tsx # i18n language selector
│   │   │   ├── FilePreview.tsx
│   │   │   ├── BatchDisplay.tsx
│   │   │   └── ExportOptions.tsx
│   │   └── lib/
│   │       ├── store.ts     # Zustand state management
│   │       ├── i18n.ts      # i18n types and utilities
│   │       ├── i18nContext.tsx # React Context for i18n
│   │       └── translations/ # Translation files
│   │           ├── en.ts    # English translations
│   │           ├── zh.ts    # Chinese translations
│   │           └── index.ts # Translation exports
│   ├── package.json
│   └── tailwind.config.js
├── backend/                 # Express backend
│   ├── index.js            # Main server file
│   ├── llm.js              # LLM service integration
│   └── package.json
├── storage/                # Local file storage
│   ├── uploads/            # Uploaded comic images
│   ├── results/            # Processed JSON results
│   ├── exports/            # Generated exports
│   └── sessions/           # Session-based organization
├── config/                 # Configuration files
├── package.json            # Root package.json
├── .env.example           # Environment variables template
├── README.md              # English documentation
└── README_zh.md           # Chinese documentation
```

## Key Features Implemented

### Core Functionality
1. **File Upload**: Drag-and-drop interface supporting JPEG, PNG, GIF, WebP (max 10MB)
2. **Batch Processing**: Multiple file processing with smart ordering
3. **LLM Processing**: Vision-capable models extract text and analyze reading order
4. **Translation**: English to Chinese with contextual explanations
5. **Session Management**: Comic book organization with progress tracking
6. **Export Functionality**: JSON, TXT, and Markdown export formats
7. **Translation History**: View and navigate through all translated pages

### User Interface
1. **Multilingual Support**: Full Chinese and English UI with instant switching
2. **Dark Mode**: Full system theme support using Tailwind CSS
3. **Navigation**: Clean navigation between Home and Settings with language switcher
4. **Enhanced Translation Viewer**: Advanced pagination with page jumping
5. **Error Handling**: User-friendly error messages and retry options
6. **Responsive Design**: Works on desktop and mobile

### Session & Library Management
1. **Comic Book Library**: Organize translations into named comic book sessions
2. **Progress Tracking**: Monitor completion status and translation progress
3. **Session Persistence**: Automatically save and restore sessions
4. **Translation History**: Browse through all translated pages with enhanced navigation
5. **Auto-save Mode**: Optional automatic session creation

### Settings & Configuration
1. **Provider Selection**: Choose between OpenRouter, OpenAI, Anthropic
2. **Model Selection**: Dynamic model options based on provider
3. **API Key Input**: Secure local storage with visibility toggle
4. **Connection Testing**: Test API connectivity before processing
5. **Language Selection**: Switch between English and Chinese interface

## Internationalization (i18n) System

### Architecture
- **React Context**: Centralized translation management
- **TypeScript Support**: Fully typed translation keys
- **Persistent Storage**: Language preference saved in localStorage
- **No Flash Loading**: Prevents language switching flash on page load

### Translation Structure
```typescript
interface TranslationKeys {
  nav: { home, settings, library }
  app: { title, subtitle }
  common: { buttons, actions, status }
  upload: { interface, messages }
  session: { management, creation }
  library: { organization, navigation }
  translations: { viewer, navigation }
  settings: { configuration, api }
  // ... and more
}
```

### Language Support
- **English**: Complete UI translation
- **Chinese**: Professional localization
- **Extensible**: Easy to add more languages

## Development Commands

### Installation
```bash
# Install all dependencies
npm run install:all

# Install frontend only
cd frontend && npm install

# Install backend only
cd backend && npm install
```

### Development
```bash
# Start both frontend and backend
npm run dev

# Start frontend only (port 3000)
npm run dev:frontend

# Start backend only (port 3001)
npm run dev:backend
```

### Production
```bash
# Build frontend
npm run build

# Start production servers
npm run start
```

## API Endpoints

### Backend Endpoints
- `GET /api/health` - Health check
- `POST /api/upload` - Upload comic image
- `POST /api/process` - Process comic with LLM
- `POST /api/test-connection` - Test API connection
- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get specific session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session
- `POST /api/sessions/:id/export` - Export session

### Frontend API Integration
- Uses axios for HTTP requests
- Proxy configuration in next.config.js routes `/api/*` to backend
- Error handling with user-friendly messages
- Session management integration

## Configuration

### Environment Variables (.env.local)
```bash
# LLM API Keys (optional - can use UI input)
OPENROUTER_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Default Configuration
DEFAULT_PROVIDER=openrouter
DEFAULT_MODEL=google/gemini-2.5-flash-lite-preview-06-17

# Server Ports
BACKEND_PORT=3001
FRONTEND_PORT=3000
```

### LLM Service Configuration
- Supports dynamic API key input from frontend
- Fallback to environment variables
- Proper error handling for invalid keys
- Connection testing functionality
- Enhanced context instructions for better translation quality

## Data Flow

### Session-Based Workflow
1. **Session Creation**: User creates or selects a comic book session
2. **File Upload**: User uploads comic images to the session
3. **Batch Processing**: Backend processes all images with LLM
4. **Translation Storage**: Results stored in session-based structure
5. **History Navigation**: Enhanced viewer with page jumping and pagination
6. **Export Options**: Multiple format export for completed sessions

### Translation Processing
1. **Upload**: User drags/drops comic image → Frontend uploads to backend
2. **Process**: Backend sends image + API key to LLM provider with enhanced context
3. **Parse**: LLM returns JSON with extracted text and translations
4. **Display**: Frontend shows structured results with explanations
5. **Store**: Results saved in session-based local storage

## Testing & Quality Assurance

### Manual Testing Checklist
- [ ] File upload (drag-and-drop and click)
- [ ] Batch processing with multiple files
- [ ] LLM processing with valid API key
- [ ] Error handling with invalid API key
- [ ] Dark/light theme switching
- [ ] Language switching (English/Chinese)
- [ ] Session creation and management
- [ ] Translation history navigation
- [ ] Page jumping functionality
- [ ] Export functionality (JSON, TXT, Markdown)
- [ ] Settings page functionality
- [ ] API connection testing
- [ ] Cross-browser compatibility

### Error Scenarios Handled
- Invalid API keys
- File upload failures
- LLM processing errors
- Network connectivity issues
- Invalid file formats
- File size limits
- Session loading failures
- Translation navigation errors

## Performance Considerations
- 10MB file size limit for uploads
- Automatic cleanup of temporary files
- Efficient image processing
- Responsive UI during processing
- Optimized session storage
- Language switching without page reload
- Pagination for large translation sets

## Security Features
- API keys stored locally only
- No sensitive data sent to servers (except LLM APIs)
- File upload validation
- CORS configuration
- Input sanitization
- Session data stored locally

## Current Limitations
1. Currently optimized for English to Chinese translation
2. No translation editing capabilities
3. No direct CBR/CBZ archive support
4. Single device usage (no cloud sync)

## Development Roadmap

### ✅ Recently Completed
- Comprehensive i18n system with English/Chinese support
- Session-based comic book management
- Enhanced translation navigation with page jumping
- Batch processing with smart file ordering
- Export functionality (JSON, TXT, Markdown)
- Translation history viewer

### 📋 Planned Features
- Translation editing capabilities
- Multi-language support (beyond EN→CN)
- Archive support (CBR/CBZ files)
- Performance optimization for large batches
- Cloud sync capabilities
- OCR fallback for text-heavy images

## Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 3000 and 3001 are available
2. **API errors**: Verify API key validity using test function
3. **Upload failures**: Check file format and size limits
4. **Dark mode issues**: Ensure Tailwind dark mode classes are applied
5. **Language flash**: Check i18n provider loading state
6. **Session loading**: Verify localStorage accessibility

### Debug Commands
```bash
# Check backend logs
cd backend && npm run dev

# Check frontend build
cd frontend && npm run build

# Test API endpoints manually
curl http://localhost:3001/api/health
curl http://localhost:3001/api/sessions
```

## Contributing Guidelines
1. Follow TypeScript best practices
2. Maintain dark mode compatibility
3. Add translations for new UI text (both English and Chinese)
4. Add error handling for new features
5. Update session management for new data structures
6. Test i18n functionality thoroughly
7. Update this CLAUDE.md for significant changes
8. Test across different browsers and devices
9. Ensure accessibility compliance

## Translation Guidelines
- All user-facing text must support both English and Chinese
- Use the `useT()` hook to access translations
- Add new translation keys to both `en.ts` and `zh.ts`
- Test language switching for new features
- Maintain consistent terminology across languages

---

*Last updated: January 2025*
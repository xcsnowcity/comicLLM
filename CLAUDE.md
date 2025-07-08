# CLAUDE.md - ComicLLM Project Reference

## Project Overview
ComicLLM is a local comic text extraction and translation tool using Large Language Models (LLMs). It allows users to upload comic images, extract text in proper reading order, and translate from English to Chinese with contextual explanations.

## Architecture

### Frontend (Next.js 14 + TypeScript)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: Zustand
- **Key Libraries**: react-dropzone, axios

### Backend (Node.js + Express)
- **Framework**: Express.js
- **File Upload**: Multer
- **LLM Integration**: Custom service supporting multiple providers
- **Storage**: Local file system

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
│   │   │   └── layout.tsx   # Root layout
│   │   ├── components/      # Reusable components
│   │   │   ├── FileUpload.tsx
│   │   │   ├── TextDisplay.tsx
│   │   │   └── Navigation.tsx
│   │   └── lib/
│   │       └── store.ts     # Zustand state management
│   ├── package.json
│   └── tailwind.config.js
├── backend/                 # Express backend
│   ├── index.js            # Main server file
│   ├── llm.js              # LLM service integration
│   └── package.json
├── storage/                # Local file storage
│   ├── uploads/            # Uploaded comic images
│   ├── results/            # Processed JSON results
│   └── exports/            # Generated exports
├── config/                 # Configuration files
├── package.json            # Root package.json
├── .env.example           # Environment variables template
└── README.md              # Project documentation
```

## Key Features Implemented

### Core Functionality
1. **File Upload**: Drag-and-drop interface supporting JPEG, PNG, GIF, WebP (max 10MB)
2. **LLM Processing**: Vision-capable models extract text and analyze reading order
3. **Translation**: English to Chinese with contextual explanations
4. **Text Display**: Clean UI showing original text, translations, and explanations
5. **API Management**: Direct API key input and connection testing

### User Interface
1. **Dark Mode**: Full system theme support using Tailwind CSS
2. **Navigation**: Clean navigation between Home and Settings
3. **Error Handling**: User-friendly error messages and retry options
4. **Responsive Design**: Works on desktop and mobile

### Settings & Configuration
1. **Provider Selection**: Choose between OpenRouter, OpenAI, Anthropic
2. **Model Selection**: Dynamic model options based on provider
3. **API Key Input**: Secure local storage with visibility toggle
4. **Connection Testing**: Test API connectivity before processing

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

### Frontend API Integration
- Uses axios for HTTP requests
- Proxy configuration in next.config.js routes `/api/*` to backend
- Error handling with user-friendly messages

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

## Data Flow

1. **Upload**: User drags/drops comic image → Frontend uploads to backend
2. **Process**: Backend sends image + API key to LLM provider
3. **Parse**: LLM returns JSON with extracted text and translations
4. **Display**: Frontend shows structured results with explanations
5. **Store**: Results saved locally for potential future reference

## Testing & Quality Assurance

### Manual Testing Checklist
- [ ] File upload (drag-and-drop and click)
- [ ] LLM processing with valid API key
- [ ] Error handling with invalid API key
- [ ] Dark/light theme switching
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

## Performance Considerations
- 10MB file size limit for uploads
- Automatic cleanup of temporary files
- Efficient image processing
- Responsive UI during processing

## Security Features
- API keys stored locally only
- No sensitive data sent to servers (except LLM APIs)
- File upload validation
- CORS configuration
- Input sanitization

## Known Limitations
1. Currently optimized for English to Chinese translation
2. No batch processing (single image at a time)
3. No export functionality
4. No session persistence
5. No image editing capabilities

## Development Roadmap

### Phase 1: User Experience (Next)
- Export functionality (JSON, TXT, Markdown)
- Batch processing for multiple images
- Session management and history

### Phase 2: Advanced Features
- Translation editing capabilities
- Multi-language support
- Reading experience improvements

### Phase 3: Performance & Polish
- Performance optimization
- Enhanced error handling
- Additional export formats

## Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 3000 and 3001 are available
2. **API errors**: Verify API key validity using test function
3. **Upload failures**: Check file format and size limits
4. **Dark mode issues**: Ensure Tailwind dark mode classes are applied

### Debug Commands
```bash
# Check backend logs
cd backend && npm run dev

# Check frontend build
cd frontend && npm run build

# Test API endpoints manually
curl http://localhost:3001/api/health
```

## Contributing Guidelines
1. Follow TypeScript best practices
2. Maintain dark mode compatibility
3. Add error handling for new features
4. Update this CLAUDE.md for significant changes
5. Test across different browsers and devices

---

*Last updated: July 2025*
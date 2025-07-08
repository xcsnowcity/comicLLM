# ComicLLM 📚

A local comic text extraction and translation tool using Large Language Models (LLMs). Extract text from comic pages and translate English to Chinese with contextual explanations.

![ComicLLM Demo](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=ComicLLM+Demo)

## ✨ Features

- 🎨 **Smart Text Extraction** - Uses vision-capable LLMs to identify and extract text in proper reading order
- 🌐 **Intelligent Translation** - English to Chinese translation with cultural context and explanations
- 🔒 **Privacy First** - Fully local operation, your data never leaves your device
- 🌙 **Dark Mode** - Beautiful UI that adapts to your system theme
- ⚡ **Easy Setup** - No complex configuration, just add your API key and start
- 💰 **Cost Effective** - Only pay for LLM API usage, no subscription fees

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/yourusername/comicLLM
cd comicLLM
npm run install:all
```

### 2. Get an API Key
- **OpenRouter** (Recommended): Visit [openrouter.ai](https://openrouter.ai) 
- **OpenAI**: Visit [platform.openai.com](https://platform.openai.com/api-keys)
- **Anthropic**: Visit [console.anthropic.com](https://console.anthropic.com)

### 3. Run the Application
```bash
npm run dev
```
Open http://localhost:3000

### 4. Configure in Browser
1. Go to Settings page
2. Enter your API key
3. Test connection
4. Start processing comics!

## 🔧 Supported Providers & Models

| Provider | Models | Notes |
|----------|--------|-------|
| **OpenRouter** | Google Gemini 2.5 Flash Lite | Recommended for cost and performance |
| **OpenAI** | GPT-4V, GPT-4o | High quality but more expensive |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus | Excellent for complex scenes |

## 📱 How It Works

1. **Upload** - Drag and drop comic images (JPEG, PNG, GIF, WebP)
2. **Process** - LLM analyzes the image and extracts text in reading order
3. **Translate** - Automatic English to Chinese translation with explanations
4. **Review** - Clean interface shows original text, translations, and cultural context

## 🛠 Development

### Prerequisites
- Node.js 18+
- npm or yarn
- LLM API key

### Available Scripts
```bash
# Development (both frontend and backend)
npm run dev

# Frontend only (port 3000)
npm run dev:frontend

# Backend only (port 3001)  
npm run dev:backend

# Build for production
npm run build

# Start production servers
npm run start
```

### Project Structure
```
comicLLM/
├── frontend/           # Next.js app
├── backend/           # Express API server
├── storage/           # Local file storage
├── config/           # Configuration files
└── CLAUDE.md         # Development reference
```

## 📸 Screenshots

### Main Interface
![Main Interface](https://via.placeholder.com/600x400/f3f4f6/374151?text=Upload+Interface)

### Text Extraction Results
![Results](https://via.placeholder.com/600x400/f3f4f6/374151?text=Translation+Results)

### Settings Page
![Settings](https://via.placeholder.com/600x400/f3f4f6/374151?text=Settings+Page)

## 🌟 Roadmap

- [ ] **Export Functionality** - Save translations as JSON, TXT, Markdown
- [ ] **Batch Processing** - Process multiple pages at once
- [ ] **Session Management** - Save and resume processing sessions
- [ ] **Translation Editing** - Manual correction capabilities
- [ ] **Multi-language Support** - Support for other language pairs

## 🤝 Contributing

Contributions are welcome! Please read [CLAUDE.md](./CLAUDE.md) for development guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to the teams at OpenAI, Anthropic, and OpenRouter for providing excellent API services
- Built with Next.js, Express, and Tailwind CSS

---

**Note**: This tool is designed for personal use and language learning. Please respect copyright laws when processing comic content.
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const LLMService = require('./llm');
require('dotenv').config();

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
const llmService = new LLMService();

// Middleware
app.use(cors());
app.use(express.json());

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'storage', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

app.post('/api/upload', upload.single('comic'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    sessionId: uuidv4()
  });
});

app.post('/api/process', async (req, res) => {
  try {
    const { filename, sessionId, provider, model, apiKey } = req.body;
    
    if (!filename || !sessionId) {
      return res.status(400).json({ error: 'Missing filename or sessionId' });
    }

    // Get the full path to the uploaded file
    const filePath = path.join(__dirname, '..', 'storage', 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Process the comic using LLM
    const result = await llmService.processComic(filePath, { provider, model, apiKey });
    
    // Save the result to storage
    const resultsDir = path.join(__dirname, '..', 'storage', 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const resultFilename = `${sessionId}-${filename}.json`;
    const resultPath = path.join(resultsDir, resultFilename);
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

    res.json(result);
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process comic', 
      details: error.message 
    });
  }
});

app.post('/api/test-connection', async (req, res) => {
  try {
    const { provider, model, apiKey } = req.body;
    
    if (!provider || !model || !apiKey) {
      return res.status(400).json({ error: 'Missing provider, model, or apiKey' });
    }

    // Test the API connection with a simple request
    const testResult = await llmService.testConnection(provider, model, apiKey);
    
    res.json({
      success: true,
      message: `Successfully connected to ${provider} with model ${model}`,
      details: testResult
    });
  } catch (error) {
    console.error('API test error:', error);
    res.status(500).json({ 
      error: 'API connection test failed', 
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: 'Only image files are allowed' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
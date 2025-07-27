const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const LLMService = require('./llm');
const StorageManager = require('./storage');
require('dotenv').config();

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
const llmService = new LLMService();
const storageManager = new StorageManager();

// Middleware
app.use(cors());
app.use(express.json());

// Use memory storage for deduplication processing
const upload = multer({ 
  storage: multer.memoryStorage(),
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

app.post('/api/upload', upload.single('comic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Store file with deduplication
    const fileInfo = await storageManager.storeFile(req.file.buffer, req.file.originalname);
    
    res.json({
      message: fileInfo.exists ? 'File already exists, reusing' : 'File uploaded successfully',
      filename: fileInfo.filename, // Now hash-based filename
      hash: fileInfo.hash,
      originalName: fileInfo.originalName,
      size: fileInfo.size,
      reused: fileInfo.exists,
      sessionId: uuidv4()
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

app.post('/api/process', async (req, res) => {
  try {
    const { filename, sessionId, provider, model, apiKey, hash, temperature } = req.body;
    
    if (!filename || !sessionId) {
      return res.status(400).json({ error: 'Missing filename or sessionId' });
    }

    // Get the full path to the uploaded file
    const filePath = path.join(__dirname, '..', 'storage', 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if we already have a result for this file hash
    const fileHash = hash || filename.split('.')[0]; // Extract hash from filename or use provided hash
    const existingResult = storageManager.getResult(sessionId, fileHash);
    
    if (existingResult) {
      console.log(`Reusing existing result for file hash: ${fileHash}`);
      return res.json(existingResult.result);
    }

    // Process the comic using LLM
    const result = await llmService.processComic(filePath, { provider, model, apiKey, temperature });
    
    // Save the result using storage manager
    await storageManager.storeResult(fileHash, sessionId, result);

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

// Storage management endpoints
app.get('/api/storage/stats', (req, res) => {
  try {
    const stats = storageManager.getStorageStats();
    res.json(stats);
  } catch (error) {
    console.error('Storage stats error:', error);
    res.status(500).json({ error: 'Failed to get storage statistics' });
  }
});

app.get('/api/storage/duplicates', (req, res) => {
  try {
    const duplicates = storageManager.findDuplicateFiles();
    res.json({ duplicates });
  } catch (error) {
    console.error('Find duplicates error:', error);
    res.status(500).json({ error: 'Failed to find duplicate files' });
  }
});

app.get('/api/storage/orphaned', (req, res) => {
  try {
    const orphaned = storageManager.findOrphanedFiles();
    res.json(orphaned);
  } catch (error) {
    console.error('Find orphaned error:', error);
    res.status(500).json({ error: 'Failed to find orphaned files' });
  }
});

app.post('/api/storage/cleanup', (req, res) => {
  try {
    const cleaned = storageManager.cleanupOrphaned();
    res.json({ 
      message: 'Cleanup completed',
      cleaned 
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup storage' });
  }
});

// === SESSION MANAGEMENT ENDPOINTS ===

// Create new session
app.post('/api/sessions', (req, res) => {
  try {
    const { name, description, language } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Session name is required' });
    }

    const session = storageManager.createSession(name.trim(), {
      description: description || '',
      language: language || 'en-to-cn'
    });

    res.json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get all sessions
app.get('/api/sessions', (req, res) => {
  try {
    const sessions = storageManager.getAllSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// Get session by ID
app.get('/api/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = storageManager.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Update session
app.put('/api/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const updates = req.body;

    const updatedSession = storageManager.updateSession(sessionId, updates);
    res.json(updatedSession);
  } catch (error) {
    console.error('Update session error:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Delete session
app.delete('/api/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = storageManager.deleteSession(sessionId);
    res.json(result);
  } catch (error) {
    console.error('Delete session error:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Add page to session
app.post('/api/sessions/:sessionId/pages', (req, res) => {
  try {
    const { sessionId } = req.params;
    const pageData = req.body;

    const updatedSession = storageManager.addPageToSession(sessionId, pageData);
    res.json(updatedSession);
  } catch (error) {
    console.error('Add page to session error:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to add page to session' });
  }
});

// Update page in session
app.put('/api/sessions/:sessionId/pages/:pageId', (req, res) => {
  try {
    const { sessionId, pageId } = req.params;
    const updates = req.body;

    const updatedSession = storageManager.updatePageInSession(sessionId, pageId, updates);
    res.json(updatedSession);
  } catch (error) {
    console.error('Update page in session error:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update page in session' });
  }
});

// Reorder pages in session
app.put('/api/sessions/:sessionId/reorder', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { pageOrders } = req.body;

    if (!Array.isArray(pageOrders)) {
      return res.status(400).json({ error: 'pageOrders must be an array' });
    }

    const updatedSession = storageManager.reorderPagesInSession(sessionId, pageOrders);
    res.json(updatedSession);
  } catch (error) {
    console.error('Reorder pages error:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to reorder pages in session' });
  }
});

// Export session
app.post('/api/sessions/:sessionId/export', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { format = 'json' } = req.body;

    const exportResult = storageManager.exportSession(sessionId, format);
    res.json(exportResult);
  } catch (error) {
    console.error('Export session error:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Unsupported export format')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to export session' });
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
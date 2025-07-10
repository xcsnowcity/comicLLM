const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class StorageManager {
  constructor() {
    this.uploadsDir = path.join(__dirname, '..', 'storage', 'uploads');
    this.resultsDir = path.join(__dirname, '..', 'storage', 'results');
    this.sessionsDir = path.join(__dirname, '..', 'storage', 'sessions');
    this.exportsDir = path.join(__dirname, '..', 'storage', 'exports');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.uploadsDir, this.resultsDir, this.sessionsDir, this.exportsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Generate hash from file buffer
  generateFileHash(fileBuffer) {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  // Get file extension from original filename
  getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  }

  // Store file with deduplication
  async storeFile(fileBuffer, originalFilename) {
    const fileHash = this.generateFileHash(fileBuffer);
    const extension = this.getFileExtension(originalFilename);
    const hashedFilename = `${fileHash}${extension}`;
    const filePath = path.join(this.uploadsDir, hashedFilename);

    // Check if file already exists
    const fileExists = fs.existsSync(filePath);
    
    if (!fileExists) {
      // Save the file only if it doesn't exist
      fs.writeFileSync(filePath, fileBuffer);
      console.log(`Stored new file: ${hashedFilename}`);
    } else {
      console.log(`File already exists, reusing: ${hashedFilename}`);
    }

    // Return file info
    return {
      hash: fileHash,
      filename: hashedFilename,
      originalName: originalFilename,
      size: fileBuffer.length,
      exists: fileExists,
      path: filePath
    };
  }

  // Get file by hash
  getFile(fileHash, extension) {
    const filename = `${fileHash}${extension}`;
    const filePath = path.join(this.uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filename}`);
    }

    return {
      path: filePath,
      filename: filename,
      buffer: fs.readFileSync(filePath)
    };
  }

  // Store processing result with reference to original file
  async storeResult(fileHash, sessionId, result) {
    const resultFilename = `${sessionId}-${fileHash}.json`;
    const resultPath = path.join(this.resultsDir, resultFilename);

    const resultData = {
      fileHash,
      sessionId,
      processedAt: new Date().toISOString(),
      result
    };

    fs.writeFileSync(resultPath, JSON.stringify(resultData, null, 2));
    
    return {
      filename: resultFilename,
      path: resultPath
    };
  }

  // Get processing result
  getResult(sessionId, fileHash) {
    const resultFilename = `${sessionId}-${fileHash}.json`;
    const resultPath = path.join(this.resultsDir, resultFilename);

    if (!fs.existsSync(resultPath)) {
      return null;
    }

    const data = fs.readFileSync(resultPath, 'utf8');
    return JSON.parse(data);
  }

  // Get storage statistics
  getStorageStats() {
    const stats = {
      uploads: this.getDirectoryStats(this.uploadsDir),
      results: this.getDirectoryStats(this.resultsDir),
      sessions: this.getDirectoryStats(this.sessionsDir),
      exports: this.getDirectoryStats(this.exportsDir)
    };

    stats.total = {
      files: stats.uploads.files + stats.results.files + stats.sessions.files + stats.exports.files,
      size: stats.uploads.size + stats.results.size + stats.sessions.size + stats.exports.size
    };

    return stats;
  }

  // Get directory statistics
  getDirectoryStats(directory) {
    if (!fs.existsSync(directory)) {
      return { files: 0, size: 0 };
    }

    const files = fs.readdirSync(directory);
    let totalSize = 0;

    files.forEach(file => {
      const filePath = path.join(directory, file);
      try {
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          totalSize += stats.size;
        }
      } catch (error) {
        console.warn(`Error reading file stats for ${filePath}:`, error.message);
      }
    });

    return {
      files: files.length,
      size: totalSize,
      sizeFormatted: this.formatBytes(totalSize)
    };
  }

  // Format bytes to human readable
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Find orphaned files (not referenced by any session or result)
  findOrphanedFiles() {
    // This will be implemented when we have sessions
    // For now, return empty array
    return {
      orphanedUploads: [],
      orphanedResults: []
    };
  }

  // Find duplicate files (should be rare with hash-based storage, but useful for migration)
  findDuplicateFiles() {
    const uploads = fs.readdirSync(this.uploadsDir);
    const sizeGroups = {};
    const duplicates = [];

    // Group files by size first (quick check)
    uploads.forEach(filename => {
      const filePath = path.join(this.uploadsDir, filename);
      try {
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          if (!sizeGroups[stats.size]) {
            sizeGroups[stats.size] = [];
          }
          sizeGroups[stats.size].push(filename);
        }
      } catch (error) {
        console.warn(`Error reading file: ${filename}`, error.message);
      }
    });

    // Check files with same size for content duplicates
    Object.values(sizeGroups).forEach(group => {
      if (group.length > 1) {
        const hashes = {};
        group.forEach(filename => {
          try {
            const filePath = path.join(this.uploadsDir, filename);
            const buffer = fs.readFileSync(filePath);
            const hash = this.generateFileHash(buffer);
            
            if (!hashes[hash]) {
              hashes[hash] = [];
            }
            hashes[hash].push(filename);
          } catch (error) {
            console.warn(`Error hashing file: ${filename}`, error.message);
          }
        });

        // Add groups with multiple files (actual duplicates)
        Object.values(hashes).forEach(hashGroup => {
          if (hashGroup.length > 1) {
            duplicates.push(hashGroup);
          }
        });
      }
    });

    return duplicates;
  }

  // Clean up orphaned files
  cleanupOrphaned() {
    const orphaned = this.findOrphanedFiles();
    let cleaned = { uploads: 0, results: 0 };

    // This will be implemented when we have session tracking
    // For now, return empty cleanup result
    return cleaned;
  }

  // === SESSION MANAGEMENT ===

  // Create a new session
  createSession(sessionName, options = {}) {
    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      name: sessionName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: options.description || '',
      pages: [],
      metadata: {
        totalPages: 0,
        completedPages: 0,
        language: options.language || 'en-to-cn'
      }
    };

    const sessionPath = path.join(this.sessionsDir, `${sessionId}.json`);
    fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));

    return session;
  }

  // Get all sessions
  getAllSessions() {
    if (!fs.existsSync(this.sessionsDir)) {
      return [];
    }

    const sessionFiles = fs.readdirSync(this.sessionsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        try {
          const sessionPath = path.join(this.sessionsDir, file);
          const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
          return sessionData;
        } catch (error) {
          console.warn(`Error reading session file ${file}:`, error.message);
          return null;
        }
      })
      .filter(session => session !== null)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return sessionFiles;
  }

  // Get session by ID
  getSession(sessionId) {
    const sessionPath = path.join(this.sessionsDir, `${sessionId}.json`);
    
    if (!fs.existsSync(sessionPath)) {
      return null;
    }

    try {
      const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
      return sessionData;
    } catch (error) {
      console.error(`Error reading session ${sessionId}:`, error.message);
      return null;
    }
  }

  // Update session
  updateSession(sessionId, updates) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const updatedSession = {
      ...session,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const sessionPath = path.join(this.sessionsDir, `${sessionId}.json`);
    fs.writeFileSync(sessionPath, JSON.stringify(updatedSession, null, 2));

    return updatedSession;
  }

  // Add page to session
  addPageToSession(sessionId, pageData) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const page = {
      id: uuidv4(),
      fileHash: pageData.fileHash,
      filename: pageData.filename,
      originalName: pageData.originalName,
      order: pageData.order || session.pages.length + 1,
      addedAt: new Date().toISOString(),
      status: pageData.status || 'pending',
      result: pageData.result || null
    };

    session.pages.push(page);
    session.metadata.totalPages = session.pages.length;
    session.metadata.completedPages = session.pages.filter(p => p.status === 'completed').length;

    return this.updateSession(sessionId, session);
  }

  // Update page in session
  updatePageInSession(sessionId, pageId, updates) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const pageIndex = session.pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) {
      throw new Error(`Page ${pageId} not found in session ${sessionId}`);
    }

    session.pages[pageIndex] = {
      ...session.pages[pageIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    session.metadata.completedPages = session.pages.filter(p => p.status === 'completed').length;

    return this.updateSession(sessionId, session);
  }

  // Delete session
  deleteSession(sessionId) {
    const sessionPath = path.join(this.sessionsDir, `${sessionId}.json`);
    
    if (!fs.existsSync(sessionPath)) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Get session data before deletion
    const session = this.getSession(sessionId);
    
    // Delete the session file
    fs.unlinkSync(sessionPath);

    // Note: We don't delete the actual files (uploads/results) as they might be referenced by other sessions
    // This follows the "Option A" approach discussed earlier

    return {
      deletedSession: session,
      message: 'Session deleted successfully. Files preserved for potential reuse.'
    };
  }

  // Reorder pages in session
  reorderPagesInSession(sessionId, pageOrders) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Update page orders
    pageOrders.forEach(({ pageId, order }) => {
      const page = session.pages.find(p => p.id === pageId);
      if (page) {
        page.order = order;
      }
    });

    // Sort pages by order
    session.pages.sort((a, b) => a.order - b.order);

    return this.updateSession(sessionId, session);
  }

  // Export session data
  exportSession(sessionId, format = 'json') {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const exportData = {
      session,
      pages: session.pages.map(page => {
        if (page.result) {
          const resultData = this.getResult(sessionId, page.fileHash);
          return {
            ...page,
            fullResult: resultData?.result
          };
        }
        return page;
      })
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `session-${session.name}-${timestamp}.${format}`;
    const exportPath = path.join(this.exportsDir, filename);

    let content;
    switch (format) {
      case 'json':
        content = JSON.stringify(exportData, null, 2);
        break;
      case 'txt':
        content = this.formatSessionAsText(exportData);
        break;
      case 'md':
        content = this.formatSessionAsMarkdown(exportData);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    fs.writeFileSync(exportPath, content, 'utf8');

    return {
      filename,
      path: exportPath,
      size: Buffer.byteLength(content, 'utf8')
    };
  }

  // Format session as text
  formatSessionAsText(exportData) {
    const { session, pages } = exportData;
    let content = `Session: ${session.name}\n`;
    content += `Created: ${new Date(session.createdAt).toLocaleString()}\n`;
    content += `Updated: ${new Date(session.updatedAt).toLocaleString()}\n`;
    if (session.description) {
      content += `Description: ${session.description}\n`;
    }
    content += `Pages: ${session.metadata.totalPages} (${session.metadata.completedPages} completed)\n\n`;

    pages.forEach((page, index) => {
      content += `=== Page ${index + 1}: ${page.originalName} ===\n`;
      if (page.fullResult && page.fullResult.reading_order) {
        page.fullResult.reading_order.forEach((text, textIndex) => {
          content += `${textIndex + 1}. ${text.original_text}\n`;
          content += `   Chinese: ${text.chinese_translation}\n`;
          if (text.explanations && text.explanations.length > 0) {
            content += `   Explanations:\n`;
            text.explanations.forEach(exp => {
              content += `   - ${exp.phrase}: ${exp.meaning}\n`;
            });
          }
          content += '\n';
        });
      }
      content += '\n';
    });

    return content;
  }

  // Format session as markdown
  formatSessionAsMarkdown(exportData) {
    const { session, pages } = exportData;
    let content = `# ${session.name}\n\n`;
    content += `**Created:** ${new Date(session.createdAt).toLocaleString()}  \n`;
    content += `**Updated:** ${new Date(session.updatedAt).toLocaleString()}  \n`;
    if (session.description) {
      content += `**Description:** ${session.description}  \n`;
    }
    content += `**Pages:** ${session.metadata.totalPages} (${session.metadata.completedPages} completed)\n\n`;

    pages.forEach((page, index) => {
      content += `## Page ${index + 1}: ${page.originalName}\n\n`;
      if (page.fullResult && page.fullResult.reading_order) {
        page.fullResult.reading_order.forEach((text, textIndex) => {
          content += `### ${textIndex + 1}. Original Text\n`;
          content += `${text.original_text}\n\n`;
          content += `**Chinese Translation:** ${text.chinese_translation}\n\n`;
          if (text.explanations && text.explanations.length > 0) {
            content += `**Explanations:**\n`;
            text.explanations.forEach(exp => {
              content += `- **${exp.phrase}:** ${exp.meaning}\n`;
            });
            content += '\n';
          }
        });
      }
      content += '\n---\n\n';
    });

    return content;
  }
}

module.exports = StorageManager;
'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { toastManager } from '@/lib/toastManager';

interface Session {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    totalPages: number;
    completedPages: number;
    language: string;
  };
  pages: Array<{
    id: string;
    fileHash: string;
    filename: string;
    originalName: string;
    order: number;
    status: string;
    addedAt: string;
  }>;
}

export default function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [viewingTranslations, setViewingTranslations] = useState<Session | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loadingTranslations, setLoadingTranslations] = useState(false);

  const {
    getAllSessions,
    getSession,
    createSession,
    updateSession,
    deleteSession,
    exportSession,
    setCurrentSessionId,
    setCurrentSession,
    currentSessionId
  } = useAppStore();

  const loadSessions = async () => {
    setLoading(true);
    try {
      const sessionsData = await getAllSessions();
      setSessions(sessionsData);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;

    try {
      const session = await createSession(
        newSessionName.trim(),
        newSessionDescription.trim(),
        'en-to-cn'
      );
      
      // Add to sessions list
      setSessions(prev => [session, ...prev]);
      
      // Set as current session (this is what "Create & Start Reading" means)
      setCurrentSessionId(session.id);
      setCurrentSession(session);
      
      // Close modal and reset form
      setShowCreateModal(false);
      setNewSessionName('');
      setNewSessionDescription('');
      
      toastManager.success(`Now reading: ${session.name}`, 4000);
    } catch (error) {
      console.error('Failed to create session:', error);
      toastManager.error('Failed to create session. Please try again.');
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      const session = await getSession(sessionId);
      setSelectedSession(session);
    } catch (error) {
      console.error('Failed to load session:', error);
      alert('Failed to load session details.');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this comic book? Original files will be preserved.')) {
      return;
    }

    try {
      await deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
      
      // If the deleted session is the current active session, clear it
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setCurrentSession(null);
      }
      
      alert('Comic book deleted successfully.');
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Failed to delete session. Please try again.');
    }
  };

  const handleExportSession = async (sessionId: string, format: 'json' | 'txt' | 'md') => {
    try {
      const result = await exportSession(sessionId, format);
      alert(`Session exported successfully as ${result.filename}`);
    } catch (error) {
      console.error('Failed to export session:', error);
      alert('Failed to export session. Please try again.');
    }
  };

  const handleContinueSession = async (sessionId: string) => {
    try {
      const session = await getSession(sessionId);
      setCurrentSessionId(sessionId);
      setCurrentSession(session);
      // Store message to show on home page after redirect
      sessionStorage.setItem('continuedSession', JSON.stringify({
        message: `Now reading: ${session.name}`,
        type: 'success'
      }));
      // Optionally redirect to main page
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to continue session:', error);
      toastManager.error('Failed to continue session. Please try again.');
    }
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setEditName(session.name);
    setEditDescription(session.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingSession || !editName.trim()) return;

    try {
      const updatedSession = await updateSession(editingSession.id, {
        name: editName.trim(),
        description: editDescription.trim()
      });

      // Update sessions list
      setSessions(prev => 
        prev.map(s => s.id === editingSession.id ? updatedSession : s)
      );

      // Update selected session if it's the one being edited
      if (selectedSession?.id === editingSession.id) {
        setSelectedSession(updatedSession);
      }

      // Update current session if it's the one being edited
      if (currentSessionId === editingSession.id) {
        setCurrentSession(updatedSession);
      }

      // Close edit modal
      setEditingSession(null);
      setEditName('');
      setEditDescription('');
    } catch (error) {
      console.error('Failed to update session:', error);
      alert('Failed to update comic book. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingSession(null);
    setEditName('');
    setEditDescription('');
  };

  const handleViewTranslations = async (sessionId: string) => {
    setLoadingTranslations(true);
    try {
      const session = await getSession(sessionId);
      setViewingTranslations(session);
      setCurrentPageIndex(0);
    } catch (error) {
      console.error('Failed to load translations:', error);
      alert('Failed to load translations. Please try again.');
    } finally {
      setLoadingTranslations(false);
    }
  };

  const handleCloseTranslations = () => {
    setViewingTranslations(null);
    setCurrentPageIndex(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getProgressColor = (completed: number, total: number) => {
    if (total === 0) return 'bg-gray-200';
    const percentage = (completed / total) * 100;
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📚 Comic Book Library ({sessions.length})</h2>
        <div className="flex gap-2">
          <button
            onClick={loadSessions}
            disabled={!!loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            📚 New Comic
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-2">📚 No comic books yet</p>
            <p className="text-sm">Create your first comic book to organize your translations</p>
          </div>
        ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => handleSelectSession(session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {session.name}
                        </h4>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.metadata.completedPages === session.metadata.totalPages && session.metadata.totalPages > 0
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {session.metadata.completedPages}/{session.metadata.totalPages} pages
                        </div>
                      </div>
                      
                      {session.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {session.description}
                        </p>
                      )}
                      
                      {/* Progress Bar */}
                      {session.metadata.totalPages > 0 && (
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                              session.metadata.completedPages,
                              session.metadata.totalPages
                            )}`}
                            style={{
                              width: `${(session.metadata.completedPages / session.metadata.totalPages) * 100}%`
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Created: {formatDate(session.createdAt)}</span>
                        <span>Updated: {formatDate(session.updatedAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContinueSession(session.id);
                        }}
                        className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                        title="Continue reading this comic"
                      >
                        📖
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTranslations(session.id);
                        }}
                        className={`p-2 transition-colors ${
                          session.metadata.completedPages > 0
                            ? 'text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
                            : 'text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400'
                        }`}
                        title={`View translations (${session.metadata.completedPages} completed)`}
                      >
                        👀
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSession(session);
                        }}
                        className="p-2 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400"
                        title="Edit comic book details"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportSession(session.id, 'json');
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        title="Export as JSON"
                      >
                        📄
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        title="Delete comic book"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}
      </div>

    </div>

    {/* Modals - Outside of space-y-6 container */}
    {/* Create Session Modal */}
    {showCreateModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            📚 Create New Comic Book
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comic Book Title *
              </label>
              <input
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="e.g., Batman Issue #1, Naruto Chapter 700"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={newSessionDescription}
                onChange={(e) => setNewSessionDescription(e.target.value)}
                placeholder="Brief description of this comic book..."
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              onClick={handleCreateSession}
              disabled={!newSessionName || !newSessionName.trim()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              📖 Create & Start Reading
            </button>
            <button
              onClick={() => {
                setShowCreateModal(false);
                setNewSessionName('');
                setNewSessionDescription('');
              }}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Session Modal */}
    {editingSession && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            ✏️ Edit Comic Book
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comic Book Title *
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g., Batman Issue #1, Naruto Chapter 700"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Brief description of this comic book..."
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              onClick={handleSaveEdit}
              disabled={!editName || !editName.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              💾 Save Changes
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Session Details Modal */}
    {selectedSession && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {selectedSession.name}
            </h3>
            <button
              onClick={() => setSelectedSession(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {selectedSession.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {selectedSession.description}
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Pages</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedSession.metadata.totalPages}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
              <div className="text-xl font-bold text-green-900 dark:text-green-100">
                {selectedSession.metadata.completedPages}
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-sm text-blue-600 dark:text-blue-400">Created</div>
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {formatDate(selectedSession.createdAt)}
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <div className="text-sm text-purple-600 dark:text-purple-400">Updated</div>
              <div className="text-sm font-medium text-purple-900 dark:text-purple-100">
                {formatDate(selectedSession.updatedAt)}
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => handleExportSession(selectedSession.id, 'json')}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Export JSON
            </button>
            <button
              onClick={() => handleExportSession(selectedSession.id, 'txt')}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Export TXT
            </button>
            <button
              onClick={() => handleExportSession(selectedSession.id, 'md')}
              className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
            >
              Export Markdown
            </button>
          </div>

          {/* Pages List */}
          <div>
            <h4 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
              Pages ({selectedSession.pages.length})
            </h4>
            {selectedSession.pages.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No pages in this session yet
              </p>
            ) : (
              <div className="space-y-2">
                {selectedSession.pages
                  .sort((a, b) => {
                    // Extract numbers from filenames for natural sorting
                    const aMatch = a.originalName.match(/(\d+)/);
                    const bMatch = b.originalName.match(/(\d+)/);
                    
                    if (aMatch && bMatch) {
                      const aNum = parseInt(aMatch[1], 10);
                      const bNum = parseInt(bMatch[1], 10);
                      return aNum - bNum;
                    }
                    
                    // Fallback to alphabetical if no numbers found
                    return a.originalName.localeCompare(b.originalName);
                  })
                  .map((page, index) => (
                  <div
                    key={page.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-sm text-gray-500 dark:text-gray-400">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {page.originalName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Added: {formatDate(page.addedAt)}
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      page.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {page.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Translation Viewer Modal */}
    {viewingTranslations && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[calc(100vh-2rem)] overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              👀 {viewingTranslations.name} - Translations
            </h3>
            <button
              onClick={handleCloseTranslations}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {loadingTranslations ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Loading translations...</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
              {/* Page Navigation */}
              {viewingTranslations.pages.length > 1 && (
                <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <button
                    onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                    disabled={currentPageIndex === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Page {currentPageIndex + 1} of {viewingTranslations.pages.length}
                  </span>
                  <button
                    onClick={() => setCurrentPageIndex(Math.min(viewingTranslations.pages.length - 1, currentPageIndex + 1))}
                    disabled={currentPageIndex === viewingTranslations.pages.length - 1}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* Current Page Content */}
              {viewingTranslations.pages.length > 0 ? (
                (() => {
                  const sortedPages = viewingTranslations.pages.sort((a, b) => {
                    const aMatch = a.originalName.match(/(\d+)/);
                    const bMatch = b.originalName.match(/(\d+)/);
                    
                    if (aMatch && bMatch) {
                      const aNum = parseInt(aMatch[1], 10);
                      const bNum = parseInt(bMatch[1], 10);
                      return aNum - bNum;
                    }
                    
                    return a.originalName.localeCompare(b.originalName);
                  });
                  
                  const currentPage = sortedPages[currentPageIndex];
                  
                  if (!currentPage || !currentPage.result) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                          No translation data available for this page.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div>
                      {/* Page Info */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          {currentPage.originalName}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-blue-700 dark:text-blue-300">
                          <span>Status: {currentPage.status}</span>
                          <span>Added: {formatDate(currentPage.addedAt)}</span>
                        </div>
                      </div>

                      {/* Translation Content */}
                      <div className="space-y-4">
                        {currentPage.result.reading_order?.map((item, index) => (
                          <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm font-medium">
                                #{item.sequence}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                                {item.type}
                              </span>
                              {item.character && (
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
                                  {item.character}
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Original Text:</h5>
                                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                  {item.original_text}
                                </p>
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Chinese Translation:</h5>
                                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                  {item.chinese_translation}
                                </p>
                              </div>
                            </div>
                            
                            {item.explanations && item.explanations.length > 0 && (
                              <div className="mt-4">
                                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Explanations:</h5>
                                <div className="space-y-2">
                                  {item.explanations.map((explanation, expIndex) => (
                                    <div key={expIndex} className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                                      <div className="font-medium text-yellow-900 dark:text-yellow-100">
                                        "{explanation.phrase}"
                                      </div>
                                      <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                        <strong>Meaning:</strong> {explanation.meaning}
                                      </div>
                                      <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                        <strong>Context:</strong> {explanation.context}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No pages found in this comic book.
                  </p>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useT } from '@/lib/i18nContext';

export default function SessionControl() {
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const t = useT();
  
  const {
    currentSession,
    currentSessionId,
    autoSaveEnabled,
    setAutoSaveEnabled,
    loadCurrentSession,
    startNewSession,
    setCurrentSessionId,
    setCurrentSession
  } = useAppStore();

  useEffect(() => {
    if (currentSessionId && !currentSession) {
      loadCurrentSession().catch((error) => {
        // If loading fails (e.g., session was deleted), clear the current session
        console.warn('Failed to load current session, clearing:', error);
        setCurrentSessionId(null);
        setCurrentSession(null);
      }).finally(() => {
        setIsInitializing(false);
      });
    } else {
      // No session to load, stop initializing
      setIsInitializing(false);
    }
  }, [currentSessionId, currentSession, loadCurrentSession, setCurrentSessionId, setCurrentSession]);

  // Refresh current session when returning to page (e.g., from settings)
  useEffect(() => {
    const handleFocus = () => {
      if (currentSessionId && currentSession) {
        // Refresh session data when window gets focus (e.g., returning from settings)
        loadCurrentSession().catch((error) => {
          console.warn('Failed to refresh current session:', error);
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentSessionId, currentSession, loadCurrentSession]);

  const handleNewSession = async () => {
    if (!newSessionName.trim()) return;

    try {
      await startNewSession(newSessionName.trim(), newSessionDescription.trim());
      setShowNewSessionModal(false);
      setNewSessionName('');
      setNewSessionDescription('');
    } catch (error) {
      console.error('Failed to start new session:', error);
      alert('Failed to create new session. Please try again.');
    }
  };

  const handleSelectExistingSession = async () => {
    // This could be enhanced to show a session selection modal
    // For now, we'll redirect to settings page where users can manage sessions
    window.location.href = '/settings';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          📖 {t.session.currentSession}
        </h3>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            {t.common.autoSave}
          </label>
        </div>
      </div>

      {/* Current Session Display */}
      {isInitializing ? (
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 dark:text-gray-400 text-sm">Loading session...</span>
          </div>
        </div>
      ) : currentSession ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-600 dark:text-blue-400">📖</span>
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  {currentSession.name}
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                  {currentSession.metadata.completedPages}/{currentSession.metadata.totalPages} {t.library.pages} {t.common.translated}
                </span>
              </div>
              {currentSession.description && (
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                  {currentSession.description}
                </p>
              )}
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {t.common.created}: {formatDate(currentSession.createdAt)}
              </p>
            </div>
            <div>
              <button
                onClick={() => setShowNewSessionModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                📚 {t.common.newComic}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 dark:text-gray-300 mb-1">
                📚 {t.common.noComicSelected}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {autoSaveEnabled 
                  ? t.common.autoCreateSession
                  : t.common.pagesWithoutSession}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSelectExistingSession}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                📖 {t.common.continueReading}
              </button>
              <button
                onClick={() => setShowNewSessionModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                📚 {t.common.startNewComic}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Session Modal */}
      {showNewSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              📚 {t.session.createNewSession}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.common.comicBookTitle} *
                </label>
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder={t.library.comicTitlePlaceholder}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.common.description} ({t.library.description})
                </label>
                <textarea
                  value={newSessionDescription}
                  onChange={(e) => setNewSessionDescription(e.target.value)}
                  placeholder={t.library.descriptionPlaceholder}
                  rows={3}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleNewSession}
                disabled={!newSessionName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                📖 {t.common.startReading}
              </button>
              <button
                onClick={() => {
                  setShowNewSessionModal(false);
                  setNewSessionName('');
                  setNewSessionDescription('');
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import AnimatedKalpLogo from './AnimatedKalpLogo';
import Table from './Table';
import CodeBlock from './CodeBlock';
import SourcesDisplay from './SourcesDisplay';
import { useAuth } from '../contexts/AuthContext';

// API Configuration
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:5000';

console.log('🔧 KimiChat Environment Variables:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  REACT_APP_WEBSOCKET_URL: process.env.REACT_APP_WEBSOCKET_URL,
  API_BASE,
  WEBSOCKET_URL
});

const ENDPOINTS = {
  CHAT_SESSIONS: process.env.REACT_APP_CHAT_SESSIONS_ENDPOINT || '/api/v2/chat/sessions',
  CHAT_HISTORY: process.env.REACT_APP_CHAT_HISTORY_ENDPOINT || '/api/v2/chat/history',
  CHAT_SESSION: process.env.REACT_APP_CHAT_SESSION_ENDPOINT || '/api/v2/chat/session',
  CHAT_SEND: process.env.REACT_APP_CHAT_SEND_ENDPOINT || '/api/v2/chat/send',
};

const KimiChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // default closed on mobile
  const [showPromptBox, setShowPromptBox] = useState(true);
  const [chatSessions, setChatSessions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const promptBoxRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const suggestions = [
    "Show me the top 5 richest people in a table",
    "Compare programming languages in table format",
    "World's First Bank: 1668",
    "Create a table of planets and their distances",
    "Your Brain Has a Delete Button"
  ];

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, default sidebar open; on mobile, closed
      if (!mobile && messages.length === 0) {
        setSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [inputMessage]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;

    socketRef.current = io(WEBSOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket server');
      const token = localStorage.getItem('authToken');
      if (token && user._id) {
        socketRef.current.emit('join-user', { userId: user._id, token });
      }
    });

    socketRef.current.on('user-authenticated', (data) => {
      console.log(`User authenticated: ${data.username}`);
      setIsAuthenticated(true);
    });

    socketRef.current.on('auth-error', (error) => {
      console.error('WebSocket authentication failed:', error.message);
    });

    socketRef.current.on('message-response', (data) => {
      setIsLoading(false);
      setIsTyping(false);

      if (data.success && data.message) {
        const aiMessage = {
          type: 'ai',
          content: data.message,
          timestamp: new Date().toISOString(),
          contextUsed: data.context?.hasContext || false,
          sessionId: data.sessionId,
          metadata: {
            keyTopics: data.context?.keyTopics || [],
            recentMessages: data.context?.recentMessages || 0
          }
        };
        setMessages(prev => [...prev, aiMessage]);
        if (data.usage) console.log(`Messages this month: ${data.usage.messagesThisMonth}`);
      } else {
        setMessages(prev => [...prev, {
          type: 'ai',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
          isError: true
        }]);
      }
    });

    socketRef.current.on('message-error', (error) => {
      setIsLoading(false);
      setIsTyping(false);
      let errorContent = 'Something went wrong. Please try again.';
      if (error.error) {
        errorContent = error.error.includes('limit reached')
          ? 'Monthly message limit reached. Please upgrade your plan or try again next month.'
          : error.error;
      }
      setMessages(prev => [...prev, {
        type: 'ai',
        content: errorContent,
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    });

    socketRef.current.on('typing', (data) => {
      if (data.userId !== user._id) setIsTyping(data.isTyping);
    });

    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, [user]);

  useEffect(() => {
    if (sidebarOpen) loadChatSessions();
  }, [sidebarOpen]);

  useEffect(() => {
    if (currentSessionId && socketRef.current) {
      socketRef.current.emit('join-session', currentSessionId);
    }
  }, [currentSessionId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && sidebarOpen && !event.target.closest('.sidebar-container') && !event.target.closest('.sidebar-toggle')) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  const loadChatSessions = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}${ENDPOINTS.CHAT_SESSIONS}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setChatSessions(data.sessions);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const createNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setShowPromptBox(true);
    if (isMobile) setSidebarOpen(false);
  };

  const selectSession = async (sessionId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}${ENDPOINTS.CHAT_HISTORY}?sessionId=${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success && data.messages) {
        setCurrentSessionId(sessionId);
        const formattedMessages = data.messages.map(msg => ({
          type: msg.role === 'user' ? 'user' : 'ai',
          content: msg.message,
          timestamp: msg.timestamp
        }));
        setMessages(formattedMessages);
        setShowPromptBox(formattedMessages.length === 0);
        if (socketRef.current) socketRef.current.emit('join-session', sessionId);
        if (isMobile) setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}${ENDPOINTS.CHAT_SESSION}/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null);
          setMessages([]);
          setShowPromptBox(true);
        }
        loadChatSessions();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user || !isAuthenticated) return;

    const userMessage = {
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    if (showPromptBox) setShowPromptBox(false);
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = `session_${user._id}_${Date.now()}`;
      setCurrentSessionId(sessionId);
    }

    if (socketRef.current && sessionId) {
      socketRef.current.emit('send-message', {
        prompt: inputMessage.trim(),
        sessionId,
        temperature: 0.7,
        max_tokens: 2000
      });
    } else {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE}${ENDPOINTS.CHAT_SEND}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ message: inputMessage.trim(), sessionId })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        setIsLoading(false);

        const aiMessage = {
          type: 'ai', content: '', timestamp: new Date().toISOString(),
          isStreaming: true, sessionId
        };
        setMessages(prev => [...prev, aiMessage]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.type === 'chunk') {
                  setMessages(prev => {
                    const updated = [...prev];
                    const lastMsg = updated[updated.length - 1];
                    if (lastMsg?.type === 'ai' && lastMsg.isStreaming) lastMsg.content += parsed.content;
                    return updated;
                  });
                } else if (parsed.type === 'complete') {
                  setIsTyping(false);
                  setMessages(prev => {
                    const updated = [...prev];
                    const lastMsg = updated[updated.length - 1];
                    if (lastMsg?.type === 'ai') lastMsg.isStreaming = false;
                    return updated;
                  });
                  setCurrentSessionId(parsed.sessionId);
                } else if (parsed.type === 'error') {
                  setIsTyping(false);
                  setMessages(prev => {
                    const updated = prev.filter((_, i) => i !== prev.length - 1 || !prev[prev.length - 1]?.isStreaming);
                    return [...updated, {
                      type: 'ai',
                      content: parsed.message || 'An error occurred.',
                      timestamp: new Date().toISOString(),
                      isError: true
                    }];
                  });
                }
              } catch (e) { console.error('Error parsing SSE:', e); }
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
        setIsTyping(false);
        setMessages(prev => [...prev, {
          type: 'ai',
          content: 'Network error. Please check your connection and try again.',
          timestamp: new Date().toISOString(),
          isError: true
        }]);
      }
    }

    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  // Shared input box component
  const InputBox = ({ compact = false }) => (
    <div className={`bg-[#1f2023] rounded-2xl md:rounded-3xl border border-[#3a3a3a] focus-within:border-[#4a4a4a] transition-colors shadow-2xl`}>
      <textarea
        ref={textareaRef}
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ask Anything..."
        className={`w-full bg-transparent ${compact ? 'p-3 md:p-4' : 'p-4 md:p-6'} text-white placeholder-gray-400 resize-none outline-none min-h-[48px] md:min-h-[60px] max-h-[150px] text-base md:text-lg`}
        rows={1}
        style={{ height: 'auto' }}
      />

      <div className={`flex items-center justify-between ${compact ? 'p-3 md:p-4' : 'p-4 md:p-6'} pt-0`}>
        <div className="flex items-center space-x-1 md:space-x-4">
          <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#2a2a2a]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button className="hidden sm:flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#2a2a2a]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm">Researcher</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <span className="text-xs md:text-sm text-gray-400 px-2 md:px-3 py-1 bg-[#2a2a2a] rounded-full">K1.5</span>
          <button className="hidden sm:block p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#2a2a2a]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`${compact ? 'p-2' : 'p-2 md:p-3'} bg-white text-black rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen h-[100dvh] bg-[#161717] text-white overflow-hidden">

      {/* Mobile overlay backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar-container
          ${isMobile
            ? `fixed inset-y-0 left-0 z-40 w-[280px] transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `${sidebarOpen ? 'w-[280px] lg:w-[320px]' : 'w-0'} transition-all duration-300 overflow-hidden`
          }
          bg-[#161717] flex flex-col border-r border-[#2a2a2a]`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#2a2a2a]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/assets/kalp-logo-animated.svg" alt="Kalp Logo" className="w-9 h-9 md:w-12 md:h-12 object-contain" />
            </div>
            <div>
              <h1 className="font-semibold text-base md:text-lg text-white">Kalp</h1>
              <p className="text-xs text-gray-400">AI Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors group"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 md:p-4">
          <button
            onClick={createNewSession}
            className="w-full flex items-center space-x-3 p-3 md:p-4 bg-gradient-to-r from-[#2a2a2a] to-[#1f1f1f] hover:from-[#3a3a3a] hover:to-[#2f2f2f] rounded-xl transition-all duration-200 border border-[#3a3a3a] hover:border-[#4a4a4a] group shadow-lg"
          >
            <div className="p-2 bg-white bg-opacity-10 rounded-lg group-hover:bg-opacity-20 transition-all">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <span className="text-white font-medium text-sm md:text-base">New Chat</span>
            </div>
            <span className="hidden md:block text-xs text-gray-500 bg-[#3a3a3a] px-2 py-1 rounded">Ctrl+K</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden flex flex-col mt-2 md:mt-4">
          <div className="px-4 py-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">Recent Chats</h3>
            <button onClick={loadChatSessions} className="p-1 hover:bg-[#2a2a2a] rounded text-gray-400 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 md:px-4 pb-4 space-y-1 custom-scrollbar">
            {isLoadingHistory ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex items-center space-x-3 p-3 bg-[#2a2a2a] rounded-xl">
                    <div className="w-8 h-8 bg-[#3a3a3a] rounded-lg flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-[#3a3a3a] rounded w-3/4 mb-1"></div>
                      <div className="h-2 bg-[#3a3a3a] rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : chatSessions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-[#2a2a2a] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">No conversations yet</p>
                <p className="text-gray-500 text-xs mt-1">Start chatting to see history</p>
              </div>
            ) : (
              chatSessions.map((session) => (
                <div
                  key={session.sessionId}
                  className={`group flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    currentSessionId === session.sessionId
                      ? 'bg-gradient-to-r from-[#3a3a3a] to-[#2f2f2f] text-white border border-[#4a4a4a]'
                      : 'hover:bg-[#2a2a2a] text-gray-300 border border-transparent'
                  }`}
                  onClick={() => selectSession(session.sessionId)}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    currentSessionId === session.sessionId ? 'bg-blue-500' : 'bg-[#3a3a3a] group-hover:bg-[#4a4a4a]'
                  } transition-colors`}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{session.title || 'New Conversation'}</div>
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      <span>{getRelativeTime(new Date(session.updatedAt))}</span>
                      {session.messages?.length && (
                        <>
                          <span>•</span>
                          <span>{session.messages.length} msgs</span>
                        </>
                      )}
                    </div>
                  </div>
                  {/* On mobile: show delete always; on desktop: show on hover */}
                  <div className={`flex items-center space-x-1 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSession(session.sessionId); }}
                      className="p-1.5 hover:bg-red-500 rounded-lg transition-colors group/delete"
                    >
                      <svg className="w-3 h-3 text-gray-400 group-hover/delete:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-3 md:p-4 border-t border-[#2a2a2a] relative profile-dropdown-container">
          <div
            className="flex items-center space-x-3 p-2 md:p-3 rounded-xl hover:bg-[#2a2a2a] transition-colors cursor-pointer group"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-[#5a1fcf] to-[#d4145a] rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm">
                {getUserInitials(user?.username || user?.displayName)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#161717]"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate text-sm">{user?.username || user?.displayName || 'User'}</div>
              <div className="text-xs text-gray-400">Free Plan</div>
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${showProfileDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {showProfileDropdown && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-[#3a3a3a]">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#5a1fcf] to-[#d4145a] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {getUserInitials(user?.username || user?.displayName)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-medium text-sm truncate">{user?.username || user?.displayName || 'User'}</div>
                    <div className="text-xs text-gray-400 truncate">{user?.email || 'user@example.com'}</div>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <button
                  onClick={() => setShowProfileDropdown(false)}
                  className="w-full flex items-center space-x-3 p-2 text-gray-300 hover:text-white hover:bg-[#3a3a3a] rounded-lg transition-colors text-left"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => { setShowProfileDropdown(false); handleLogout(); }}
                  className="w-full flex items-center space-x-3 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0f1011] overflow-hidden relative min-w-0">
        {/* Top spacing - hidden on mobile */}
        <div className="hidden md:block h-4"></div>

        {/* Chat container */}
        <div className="flex-1 mx-0 md:mx-4 mb-0 md:mb-4 bg-[#0f1011] border-0 md:border md:border-gray-600 md:rounded-2xl overflow-hidden flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-3 md:px-4 py-3 md:py-4 border-b border-gray-700 bg-[#0f1011] sticky top-0 z-10">
            <div className="flex items-center space-x-2 min-w-0">
              {/* Sidebar toggle - always visible on mobile, only when closed on desktop */}
              {(!sidebarOpen || isMobile) && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="sidebar-toggle p-2 hover:bg-[#2a2a2a] rounded-lg flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}

              {messages.length > 0 && (
                <h1 className="text-sm md:text-base font-medium truncate text-gray-200">
                  {messages[0].content.substring(0, isMobile ? 30 : 50) + '...'}
                </h1>
              )}

              {/* Logo when no messages - mobile only */}
              {messages.length === 0 && isMobile && (
                <div className="flex items-center space-x-2">
                  <img src="/assets/kalp-logo-animated.svg" alt="Kalp" className="w-7 h-7" />
                  <span className="font-bold text-white">KALP</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
              <button className="p-2 hover:bg-[#2a2a2a] rounded-lg">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-[#2a2a2a] rounded-lg">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 relative overflow-hidden flex flex-col">

            {/* Welcome Screen */}
            {showPromptBox && messages.length === 0 && (
              <div
                ref={promptBoxRef}
                className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-6 overflow-y-auto"
              >
                {/* Logo */}
                <div className="mb-6 md:mb-8 flex flex-col items-center">
                  <div className="mb-3 md:mb-4">
                    <img src="/assets/kalp-logo-animated.svg" alt="Kalp Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold tracking-wider">KALP</h1>
                </div>

                {/* Prompt Input */}
                <div className="w-full max-w-2xl md:max-w-4xl mb-6 md:mb-8">
                  <InputBox />
                </div>

                {/* Suggestions - scrollable on mobile */}
                <div className="w-full max-w-2xl md:max-w-4xl">
                  <div className="flex flex-nowrap md:flex-wrap gap-2 md:gap-3 overflow-x-auto md:overflow-x-visible md:justify-center pb-2 md:pb-0 hide-scrollbar">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(suggestion)}
                        className="flex-shrink-0 px-3 md:px-5 py-2 md:py-3 bg-[#1f2023] hover:bg-[#2a2d30] rounded-xl md:rounded-2xl text-xs md:text-sm border border-[#3a3a3a] hover:border-[#4a4a4a] transition-all shadow-lg whitespace-nowrap"
                      >
                        {suggestion.startsWith('Show me') && '📊 '}
                        {suggestion.startsWith('Compare') && '⚖️ '}
                        {suggestion.startsWith('World') && '🏦 '}
                        {suggestion.startsWith('Create a table') && '📋 '}
                        {suggestion.startsWith('Your') && '🧠 '}
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language notice - hidden on mobile */}
                <div className="hidden md:block absolute top-6 right-8">
                  <div className="px-4 py-2 bg-[#1f2023] rounded-2xl text-sm text-gray-400 border border-[#3a3a3a] shadow-lg">
                    no language is english
                  </div>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className={`flex-1 overflow-y-auto hide-scrollbar flex flex-col ${messages.length === 0 && showPromptBox ? 'hidden' : ''}`}>
              <div className="flex-1 px-3 md:px-8 py-4 md:py-6 space-y-5 md:space-y-8 max-w-4xl mx-auto w-full">
                {messages.map((message, index) => (
                  <div key={index} className="flex items-start space-x-2 md:space-x-4">
                    {message.type === 'user' ? (
                      <>
                        <div className="flex-1"></div>
                        <div className="max-w-[85%] md:max-w-[80%] bg-[#2a2d30] rounded-2xl md:rounded-3xl rounded-br-lg px-4 md:px-6 py-3 md:py-4 shadow-lg">
                          <p className="text-white whitespace-pre-wrap text-sm md:text-base">{message.content}</p>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <span className="text-base md:text-lg">👤</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0">
                          <AnimatedKalpLogo isAnimating={isLoading && index === messages.length - 1} size="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                        <div className="flex-1 max-w-[85%] md:max-w-[80%] min-w-0">
                          <div className={`${message.isError ? 'text-red-300' : 'text-white'} leading-relaxed prose prose-invert max-w-none text-sm md:text-base`}>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                              components={{
                                p: ({ node, ...props }) => <p className="mb-3 md:mb-4 text-white leading-relaxed" {...props} />,
                                h1: ({ node, ...props }) => <h1 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-white" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-base md:text-lg font-medium mb-2 text-white" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 md:mb-4 space-y-1 text-white" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-3 md:mb-4 space-y-1 text-white" {...props} />,
                                li: ({ node, ...props }) => <li className="text-white leading-relaxed" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                                em: ({ node, ...props }) => <em className="italic text-white" {...props} />,
                                code: ({ node, inline, className, children, ...props }) => {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const language = match ? match[1] : 'text';
                                  if (!inline && children) {
                                    return <CodeBlock code={String(children).replace(/\n$/, '')} language={language} />;
                                  }
                                  return (
                                    <code className="bg-[#2a2a2a] px-1 py-0.5 rounded text-xs md:text-sm text-gray-300 font-mono" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                                pre: ({ node, children, ...props }) => <>{children}</>,
                                table: ({ node, children, ...props }) => {
                                  let tableData = [], headers = [];
                                  if (children && Array.isArray(children)) {
                                    const tableElements = children.filter(child => child && typeof child === 'object' && child.type);
                                    const thead = tableElements.find(el => el.type === 'thead');
                                    const tbody = tableElements.find(el => el.type === 'tbody');
                                    if (thead?.props?.children) {
                                      const headerRow = Array.isArray(thead.props.children)
                                        ? thead.props.children.find(child => child?.type === 'tr')
                                        : thead.props.children;
                                      if (headerRow?.props?.children) {
                                        const headerCells = Array.isArray(headerRow.props.children) ? headerRow.props.children : [headerRow.props.children];
                                        headers = headerCells.filter(cell => cell?.type === 'th').map(cell => {
                                          if (cell.props?.children) return typeof cell.props.children === 'string' ? cell.props.children : String(cell.props.children).replace(/,/g, '');
                                          return '';
                                        });
                                      }
                                    }
                                    if (tbody?.props?.children) {
                                      const rows = Array.isArray(tbody.props.children) ? tbody.props.children : [tbody.props.children];
                                      tableData = rows.filter(row => row?.type === 'tr').map(row => {
                                        if (row.props?.children) {
                                          const cells = Array.isArray(row.props.children) ? row.props.children : [row.props.children];
                                          const rowData = {};
                                          cells.filter(cell => cell?.type === 'td').forEach((cell, i) => {
                                            if (headers[i] && cell.props?.children) {
                                              rowData[headers[i]] = typeof cell.props.children === 'string' ? cell.props.children : String(cell.props.children).replace(/,/g, '');
                                            }
                                          });
                                          return rowData;
                                        }
                                        return {};
                                      });
                                    }
                                  }
                                  if (headers.length > 0 && tableData.length > 0) {
                                    return <div className="overflow-x-auto -mx-3 md:mx-0"><Table data={tableData} headers={headers} /></div>;
                                  }
                                  return (
                                    <div className="my-4 md:my-6 overflow-x-auto bg-[#1e1e1e] rounded-lg border border-[#3a3a3a] -mx-3 md:mx-0">
                                      <table className="w-full" {...props}>{children}</table>
                                    </div>
                                  );
                                },
                                thead: ({ node, ...props }) => <thead className="bg-[#2d2d2d] border-b border-[#3a3a3a]" {...props} />,
                                tbody: ({ node, ...props }) => <tbody className="divide-y divide-[#3a3a3a]" {...props} />,
                                tr: ({ node, ...props }) => <tr className="hover:bg-[#2a2a2a] transition-colors group" {...props} />,
                                th: ({ node, ...props }) => <th className="px-3 md:px-4 py-2 md:py-3 text-[#cccccc] font-medium text-xs md:text-sm uppercase tracking-wider text-left whitespace-nowrap" {...props} />,
                                td: ({ node, children, ...props }) => <td className="px-3 md:px-4 py-2 md:py-3 text-white border-r border-[#3a3a3a] last:border-r-0 text-sm" {...props}>{children}</td>,
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-500 pl-3 md:pl-4 italic text-gray-300 my-3 md:my-4 bg-[#1a1a1a] py-2" {...props} />
                              }}
                            >
                              {message.content
                                .replace(/\n+📌\s*Sources:[\s\S]*$/gi, '')
                                .replace(/\n+Sources:[\s\S]*$/gi, '')
                                .replace(/\n+\[\d+\]\s+[^\n]+(?:\n\[\d+\][^\n]+)*/gi, '')}
                            </ReactMarkdown>
                            {message.isStreaming && (
                              <style>{`
                                @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
                                .streaming-cursor { display: inline; animation: blink 1s infinite; }
                              `}</style>
                            )}
                            {message.isStreaming && <span className="streaming-cursor">|</span>}
                            {!message.isStreaming && <SourcesDisplay message={message.content} />}
                          </div>
                          {message.contextUsed && (
                            <div className="text-xs text-gray-500 mt-2">💭 Used conversation context</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-start space-x-2 md:space-x-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0">
                      <AnimatedKalpLogo isAnimating={true} size="w-8 h-8 md:w-10 md:h-10" />
                    </div>
                    <div className="py-3 md:py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs md:text-sm text-gray-400">Kalp is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Input Area */}
              {messages.length > 0 && (
                <div className="sticky bottom-0 px-3 md:px-6 py-3 md:py-6 bg-[#0f1011] border-t border-[#2a2a2a] md:border-0">
                  <div className="max-w-4xl mx-auto">
                    <InputBox compact={true} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KimiChat;

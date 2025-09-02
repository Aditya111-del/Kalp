import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import AnimatedKalpLogo from './AnimatedKalpLogo';
import Table from './Table';
import CodeBlock from './CodeBlock';
import { useAuth } from '../contexts/AuthContext';

// API Configuration
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:5000';

// Debug logging
console.log('🔧 KimiChat Environment Variables:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  REACT_APP_WEBSOCKET_URL: process.env.REACT_APP_WEBSOCKET_URL,
  API_BASE,
  WEBSOCKET_URL
});

// API Endpoints
const ENDPOINTS = {
  CHAT_SESSIONS: process.env.REACT_APP_CHAT_SESSIONS_ENDPOINT || '/api/v2/chat/sessions',
  CHAT_HISTORY: process.env.REACT_APP_CHAT_HISTORY_ENDPOINT || '/api/v2/chat/history',
  CHAT_SESSION: process.env.REACT_APP_CHAT_SESSION_ENDPOINT || '/api/v2/chat/session',
  CHAT_SEND: process.env.REACT_APP_CHAT_SEND_ENDPOINT || '/api/v2/chat/send',
};

// Helper function to format table cell content
const formatTableCellContent = (children) => {
  if (!children) return children;
  
  // Convert children to string to check content
  const content = Array.isArray(children) 
    ? children.map(child => typeof child === 'string' ? child : '').join('')
    : typeof children === 'string' ? children : '';
  
  // Handle monetary values (net worth)
  if (content.includes('~$') || (content.includes('billion') && content.includes('$'))) {
    return (
      <span className="font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
        {children}
      </span>
    );
  }
  
  // Handle rank numbers in first column
  if (/^\s*\d+\s*$/.test(content)) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg">
        {content.trim()}
      </span>
    );
  }
  
  // Handle names with emojis
  if (content.includes('🚀') || content.includes('💎') || content.includes('💼')) {
    return (
      <span className="font-semibold text-blue-300 flex items-center space-x-2">
        <span>{children}</span>
      </span>
    );
  }
  
  // Handle source of wealth (make it slightly smaller and gray)
  if (content.includes('Tesla') || content.includes('LVMH') || content.includes('Amazon') || 
      content.includes('SpaceX') || content.includes('Louis Vuitton')) {
    return (
      <span className="text-sm text-gray-300 bg-gray-700/30 px-2 py-1 rounded-md">
        {children}
      </span>
    );
  }
  
  // Handle countries
  if (content.includes('United States') || content.includes('France') || 
      content.includes('China') || content.includes('India')) {
    return (
      <span className="text-yellow-300 font-medium">
        {children}
      </span>
    );
  }
  
  return children;
};

const KimiChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPromptBox, setShowPromptBox] = useState(true);
  const [chatSessions, setChatSessions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const promptBoxRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Sample suggestions
  const suggestions = [
    "Show me the top 5 richest people in a table",
    "Compare programming languages in table format",
    "World's First Bank: 1668",
    "Create a table of planets and their distances",
    "Your Brain Has a Delete Button"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login');
      return;
    }

    socketRef.current = io(WEBSOCKET_URL);
    
    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket server');
      
      // Authenticate with user ID and token
      const token = localStorage.getItem('authToken');
      if (token && user._id) {
        socketRef.current.emit('join-user', {
          userId: user._id,
          token: token
        });
      }
    });

    // Handle authentication confirmation
    socketRef.current.on('user-authenticated', (data) => {
      console.log(`User authenticated: ${data.username} (${data.displayName})`);
      setIsAuthenticated(true);
    });

    // Handle authentication errors
    socketRef.current.on('auth-error', (error) => {
      console.error('WebSocket authentication failed:', error.message);
      // Could redirect to login or show error
    });

    // Listen for message responses
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
        
        // Update usage info if provided
        if (data.usage) {
          console.log(`Messages this month: ${data.usage.messagesThisMonth}`);
        }
      } else {
        const errorMessage = {
          type: 'ai',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    });

    socketRef.current.on('message-error', (error) => {
      setIsLoading(false);
      setIsTyping(false);
      
      let errorContent = 'Something went wrong. Please try again.';
      
      if (error.error) {
        errorContent = error.error;
        
        // Handle specific error types
        if (error.error.includes('limit reached')) {
          errorContent = 'Monthly message limit reached. Please upgrade your plan or try again next month.';
        }
      }
      
      const errorMessage = {
        type: 'ai',
        content: errorContent,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    });

    socketRef.current.on('typing', (data) => {
      // Only show typing indicator for other users in collaborative sessions
      if (data.userId !== user._id) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  // Load chat sessions
  useEffect(() => {
    if (sidebarOpen) {
      loadChatSessions();
    }
  }, [sidebarOpen]);

  // Join session when session ID changes
  useEffect(() => {
    if (currentSessionId && socketRef.current) {
      socketRef.current.emit('join-session', currentSessionId);
    }
  }, [currentSessionId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const loadChatSessions = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}${ENDPOINTS.CHAT_SESSIONS}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setChatSessions(data.sessions);
      }
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
  };

  const selectSession = async (sessionId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}${ENDPOINTS.CHAT_HISTORY}?sessionId=${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success && data.messages) {
        setCurrentSessionId(sessionId);
        
        // Convert backend message format to frontend format
        const formattedMessages = data.messages.map(msg => ({
          type: msg.role === 'user' ? 'user' : 'ai',
          content: msg.message,
          timestamp: msg.timestamp
        }));
        
        setMessages(formattedMessages);
        setShowPromptBox(formattedMessages.length === 0);
        
        // Join the session via WebSocket
        if (socketRef.current) {
          socketRef.current.emit('join-session', sessionId);
        }
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
    if (!inputMessage.trim() || !user || !isAuthenticated) {
      console.log('Cannot send message: missing input, user, or authentication');
      return;
    }
    
    const userMessage = {
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    // Hide prompt box with fade animation
    if (showPromptBox) {
      setShowPromptBox(false);
    }

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    // Generate session ID if none exists
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = `session_${user._id}_${Date.now()}`;
      setCurrentSessionId(sessionId);
    }

    // Send message via WebSocket with user authentication
    if (socketRef.current && sessionId) {
      socketRef.current.emit('send-message', {
        prompt: inputMessage.trim(),
        sessionId,
        temperature: 0.7,
        max_tokens: 2000
      });
    } else {
      // Fallback to HTTP API if WebSocket is not available
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE}${ENDPOINTS.CHAT_SEND}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            message: inputMessage.trim(),
            sessionId
          })
        });

        const data = await response.json();
        
        setIsLoading(false);
        setIsTyping(false);

        if (data.success) {
          const aiMessage = {
            type: 'ai',
            content: data.message,
            timestamp: new Date().toISOString(),
            contextUsed: data.context?.hasContext || false,
            sessionId: data.sessionId
          };
          setMessages(prev => [...prev, aiMessage]);
          setCurrentSessionId(data.sessionId);
        } else {
          const errorMessage = {
            type: 'ai',
            content: data.message || 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date().toISOString(),
            isError: true
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setIsLoading(false);
        setIsTyping(false);
        
        const errorMessage = {
          type: 'ai',
          content: 'Network error. Please check your connection and try again.',
          timestamp: new Date().toISOString(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }

    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex h-screen bg-[#161717] text-white overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-[320px]' : 'w-0'} transition-all duration-300 overflow-hidden bg-[#161717] flex flex-col border-r border-[#2a2a2a]`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/assets/kalp-logo-animated.svg" alt="Kalp Logo" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <h1 className="font-semibold text-lg text-white">Kalp</h1>
              <p className="text-xs text-gray-400">AI Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors group"
            title="Close sidebar"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={createNewSession}
            className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-[#2a2a2a] to-[#1f1f1f] hover:from-[#3a3a3a] hover:to-[#2f2f2f] rounded-xl transition-all duration-200 border border-[#3a3a3a] hover:border-[#4a4a4a] group shadow-lg"
          >
            <div className="p-2 bg-white bg-opacity-10 rounded-lg group-hover:bg-opacity-20 transition-all">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <span className="text-white font-medium">New Chat</span>
              
            </div>
            <span className="text-xs text-gray-500 bg-[#3a3a3a] px-2 py-1 rounded">Ctrl+K</span>
          </button>
        </div>

        {/* Chat History Section */}
        <div className="flex-1 overflow-hidden flex flex-col mt-4">
          <div className="px-4 py-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">Recent Chats</h3>
            <button 
              onClick={loadChatSessions}
              className="p-1 hover:bg-[#2a2a2a] rounded text-gray-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 custom-scrollbar">
            {isLoadingHistory ? (
              <div className="space-y-2">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-3 p-3 bg-[#2a2a2a] rounded-xl">
                      <div className="w-8 h-8 bg-[#3a3a3a] rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-[#3a3a3a] rounded w-3/4 mb-1"></div>
                        <div className="h-2 bg-[#3a3a3a] rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : chatSessions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#2a2a2a] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    currentSessionId === session.sessionId 
                      ? 'bg-blue-500' 
                      : 'bg-[#3a3a3a] group-hover:bg-[#4a4a4a]'
                  } transition-colors`}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {session.title || 'New Conversation'}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center space-x-2">
                      <span>{getRelativeTime(new Date(session.updatedAt))}</span>
                      {session.messages?.length && (
                        <>
                          <span>•</span>
                          <span>{session.messages.length} messages</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add edit functionality here
                      }}
                      className="p-1.5 hover:bg-[#4a4a4a] rounded-lg transition-colors"
                      title="Rename"
                    >
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.sessionId);
                      }}
                      className="p-1.5 hover:bg-red-500 rounded-lg transition-colors group/delete"
                      title="Delete"
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

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t border-[#2a2a2a]">
          <button className="w-full flex items-center justify-center space-x-2 p-3 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-sm font-medium">All Chats</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-[#2a2a2a] relative profile-dropdown-container">
          <div 
            className="flex items-center space-x-3 p-3 rounded-xl hover:bg-[#2a2a2a] transition-colors cursor-pointer group"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-[#5a1fcf] to-[#d4145a] rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {getUserInitials()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#161717]"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate">{user?.username || user?.displayName || 'User'}</div>
              <div className="text-xs text-gray-400">Free Plan</div>
            </div>
            <button className="p-2 text-gray-400 hover:text-white group-hover:bg-[#3a3a3a] rounded-lg transition-all">
              <svg 
                className={`w-4 h-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-[#3a3a3a]">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#5a1fcf] to-[#d4145a] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {getUserInitials()}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{user?.username || user?.displayName || 'User'}</div>
                    <div className="text-xs text-gray-400">{user?.email || 'user@example.com'}</div>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    // Add settings functionality here if needed
                  }}
                  className="w-full flex items-center space-x-3 p-2 text-gray-300 hover:text-white hover:bg-[#3a3a3a] rounded-lg transition-colors text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-3 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="flex-1 flex flex-col bg-[#0f1011] overflow-hidden relative">
        {/* Top spacing */}
        <div className="h-4"></div>
        
        {/* Chat container with white border */}
        <div className="flex-1 mx-4 mb-4 bg-[#0f1011] border border-gray-600 rounded-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-[#2a2a2a] rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            
            {messages.length > 0 && (
              <h1 className="text-lg font-medium truncate flex-1 text-center">
                {messages.length > 0 ? messages[0].content.substring(0, 50) + '...' : 'New Chat'}
              </h1>
            )}

            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-[#2a2a2a] rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-[#2a2a2a] rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 relative overflow-hidden">
            {/* Welcome Screen with Prompt Box */}
            {showPromptBox && messages.length === 0 && (
              <div 
                ref={promptBoxRef}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${
                  !showPromptBox ? 'transform translate-y-4 opacity-0' : 'transform translate-y-0 opacity-100'
                }`}
              >
                {/* Logo */}
                <div className="mb-8 flex flex-col items-center">
                  <div className="mb-4">
                    <img src="/assets/kalp-logo-animated.svg" alt="Kalp Logo" className="w-16 h-16 object-contain" />
                  </div>
                  <h1 className="text-6xl font-bold tracking-wider">KALP</h1>
                </div>

                {/* Prompt Input Box */}
                <div className="w-full max-w-4xl px-8 mb-8">
                  <div className="bg-[#1f2023] rounded-3xl border border-[#3a3a3a] focus-within:border-[#4a4a4a] transition-colors shadow-2xl">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask Anything..."
                      className="w-full bg-transparent p-6 text-white placeholder-gray-400 resize-none outline-none min-h-[80px] max-h-[200px] text-lg"
                      rows={1}
                    />
                    
                    <div className="flex items-center justify-between p-6 pt-0">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#2a2a2a]">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        
                        <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#2a2a2a]">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="text-sm">Researcher</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-400 px-3 py-1 bg-[#2a2a2a] rounded-full">K1.5</span>
                        <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#2a2a2a]">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#2a2a2a]">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                          </svg>
                        </button>
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim() || isLoading}
                          className="p-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-3 justify-center max-w-4xl px-8">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(suggestion)}
                      className="px-5 py-3 bg-[#1f2023] hover:bg-[#2a2d30] rounded-2xl text-sm border border-[#3a3a3a] hover:border-[#4a4a4a] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
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

                {/* Language Notice */}
                <div className="absolute top-6 right-8">
                  <div className="px-4 py-2 bg-[#1f2023] rounded-2xl text-sm text-gray-400 border border-[#3a3a3a] shadow-lg">
                    no language is english
                  </div>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className={`h-full overflow-y-auto hide-scrollbar ${messages.length === 0 && showPromptBox ? 'hidden' : 'flex flex-col'}`}>
              <div className="flex-1 px-8 py-6 space-y-8 max-w-4xl mx-auto w-full">
                {messages.map((message, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    {message.type === 'user' ? (
                      <>
                        <div className="flex-1"></div>
                        <div className="max-w-[80%] bg-[#2a2d30] rounded-3xl rounded-br-lg px-6 py-4 shadow-lg">
                          <p className="text-white whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <span className="text-lg">👤</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                          <AnimatedKalpLogo isAnimating={isLoading && index === messages.length - 1} size="w-10 h-10" />
                        </div>
                        <div className="flex-1 max-w-[80%]">
                          <div className={`${message.isError ? 'text-red-300' : 'text-white'} leading-relaxed prose prose-invert max-w-none`}>
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                              components={{
                                p: ({node, ...props}) => <p className="mb-4 text-white leading-relaxed" {...props} />,
                                h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-white" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-3 text-white" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-lg font-medium mb-2 text-white" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1 text-white" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1 text-white" {...props} />,
                                li: ({node, ...props}) => <li className="text-white leading-relaxed" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
                                em: ({node, ...props}) => <em className="italic text-white" {...props} />,
                                code: ({node, inline, className, children, ...props}) => {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const language = match ? match[1] : 'text';
                                  
                                  if (!inline && children) {
                                    // Multi-line code block
                                    return (
                                      <CodeBlock 
                                        code={String(children).replace(/\n$/, '')}
                                        language={language}
                                      />
                                    );
                                  } else {
                                    // Inline code
                                    return (
                                      <code className="bg-[#2a2a2a] px-1 py-0.5 rounded text-sm text-gray-300 font-mono" {...props}>
                                        {children}
                                      </code>
                                    );
                                  }
                                },
                                pre: ({node, children, ...props}) => {
                                  // Let the code component handle pre blocks
                                  return <>{children}</>;
                                },
                                // Enhanced table components using Table.jsx
                                table: ({node, children, ...props}) => {
                                  // Extract table data from children
                                  let tableData = [];
                                  let headers = [];
                                  
                                  // Parse table structure from ReactMarkdown children
                                  if (children && Array.isArray(children)) {
                                    const tableElements = children.filter(child => 
                                      child && typeof child === 'object' && child.type
                                    );
                                    
                                    const thead = tableElements.find(el => el.type === 'thead');
                                    const tbody = tableElements.find(el => el.type === 'tbody');
                                    
                                    if (thead && thead.props && thead.props.children) {
                                      const headerRow = Array.isArray(thead.props.children) 
                                        ? thead.props.children.find(child => child && child.type === 'tr')
                                        : thead.props.children;
                                      
                                      if (headerRow && headerRow.props && headerRow.props.children) {
                                        const headerCells = Array.isArray(headerRow.props.children) 
                                          ? headerRow.props.children 
                                          : [headerRow.props.children];
                                        
                                        headers = headerCells
                                          .filter(cell => cell && cell.type === 'th')
                                          .map(cell => {
                                            if (cell.props && cell.props.children) {
                                              return typeof cell.props.children === 'string' 
                                                ? cell.props.children 
                                                : String(cell.props.children).replace(/,/g, '');
                                            }
                                            return '';
                                          });
                                      }
                                    }
                                    
                                    if (tbody && tbody.props && tbody.props.children) {
                                      const rows = Array.isArray(tbody.props.children) 
                                        ? tbody.props.children 
                                        : [tbody.props.children];
                                      
                                      tableData = rows
                                        .filter(row => row && row.type === 'tr')
                                        .map(row => {
                                          if (row.props && row.props.children) {
                                            const cells = Array.isArray(row.props.children) 
                                              ? row.props.children 
                                              : [row.props.children];
                                            
                                            const rowData = {};
                                            cells
                                              .filter(cell => cell && cell.type === 'td')
                                              .forEach((cell, index) => {
                                                if (headers[index] && cell.props && cell.props.children) {
                                                  const cellContent = typeof cell.props.children === 'string' 
                                                    ? cell.props.children 
                                                    : String(cell.props.children).replace(/,/g, '');
                                                  rowData[headers[index]] = cellContent;
                                                }
                                              });
                                            return rowData;
                                          }
                                          return {};
                                        });
                                    }
                                  }
                                  
                                  // Use Table component if we have data, otherwise fallback
                                  if (headers.length > 0 && tableData.length > 0) {
                                    return <Table data={tableData} headers={headers} />;
                                  }
                                  
                                  // Fallback to original table styling
                                  return (
                                    <div className="my-6 overflow-x-auto bg-[#1e1e1e] rounded-lg border border-[#3a3a3a]">
                                      <table className="w-full" {...props}>
                                        {children}
                                      </table>
                                    </div>
                                  );
                                },
                                thead: ({node, ...props}) => <thead className="bg-[#2d2d2d] border-b border-[#3a3a3a]" {...props} />,
                                tbody: ({node, ...props}) => <tbody className="divide-y divide-[#3a3a3a]" {...props} />,
                                tr: ({node, ...props}) => <tr className="hover:bg-[#2a2a2a] transition-colors group" {...props} />,
                                th: ({node, ...props}) => (
                                  <th className="px-4 py-3 text-[#cccccc] font-medium text-sm uppercase tracking-wider text-left" {...props} />
                                ),
                                td: ({node, children, ...props}) => (
                                  <td className="px-4 py-3 text-white border-r border-[#3a3a3a] last:border-r-0 group-hover:border-[#4a4a4a]" {...props}>
                                    {children}
                                  </td>
                                ),
                                // Blockquote styling
                                blockquote: ({node, ...props}) => (
                                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-300 my-4 bg-[#1a1a1a] py-2" {...props} />
                                )
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                          {message.contextUsed && (
                            <div className="text-xs text-gray-500 mt-2">
                              💭 Used conversation context
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <AnimatedKalpLogo isAnimating={true} size="w-10 h-10" />
                    </div>
                    <div className="flex-1 max-w-[80%]">
                      <div className="py-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-sm text-gray-400 ml-2">Kalp is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Input Area (shown when messages exist) */}
              {messages.length > 0 && (
                <div className="p-6 bg-[#0f1011]">
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-[#1f2023] rounded-3xl border border-[#3a3a3a] focus-within:border-[#4a4a4a] transition-colors shadow-2xl">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask Anything..."
                        className="w-full bg-transparent p-6 text-white placeholder-gray-400 resize-none outline-none min-h-[60px] max-h-[150px] text-lg"
                        rows={1}
                      />
                      
                      <div className="flex items-center justify-between p-6 pt-0">
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#2a2a2a]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          
                          <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#2a2a2a]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="text-sm">Researcher</span>
                          </button>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-400 px-3 py-1 bg-[#2a2a2a] rounded-full">K1.5</span>
                          <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#2a2a2a]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                          </button>
                          <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#2a2a2a]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                            </svg>
                          </button>
                          <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className="p-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
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
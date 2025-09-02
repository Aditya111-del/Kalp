import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ code, language = 'javascript', filename = null }) => {
  const [copied, setCopied] = useState(false);
  const [showLineNumbers] = useState(true);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const downloadCode = () => {
    const extension = getFileExtension(language);
    const fileName = filename || `code.${extension}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (lang) => {
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css',
      json: 'json',
      xml: 'xml',
      sql: 'sql',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      kotlin: 'kt',
      swift: 'swift',
      dart: 'dart'
    };
    return extensions[lang] || 'txt';
  };

  const getLanguageIcon = (lang) => {
    const icons = {
      javascript: '🟨',
      typescript: '🔵',
      python: '🐍',
      java: '☕',
      cpp: '⚙️',
      c: '⚙️',
      html: '🌐',
      css: '🎨',
      json: '📄',
      xml: '📄',
      sql: '🗄️',
      php: '🐘',
      ruby: '💎',
      go: '🐹',
      rust: '🦀',
      kotlin: '🎯',
      swift: '🐦',
      dart: '🎯'
    };
    return icons[lang] || '📝';
  };

  return (
    <div className="code-block-container mb-4">
      {/* Header */}
      <div className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-t-lg px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getLanguageIcon(language)}</span>
          <span className="text-[#cccccc] text-sm font-medium capitalize">
            {language}
          </span>
          {filename && (
            <span className="text-[#888888] text-sm">• {filename}</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Copy Button - Minimalistic */}
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-2 py-1 bg-transparent hover:bg-[#3d3d3d] rounded text-[#cccccc] text-xs transition-colors"
            title="Copy code"
          >
            {copied ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs">Copied</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">Copy</span>
              </>
            )}
          </button>

          {/* Download Button - Minimalistic */}
          <button
            onClick={downloadCode}
            className="flex items-center space-x-1 px-2 py-1 bg-transparent hover:bg-[#3d3d3d] rounded text-[#cccccc] text-xs transition-colors"
            title="Download code"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative border-l border-r border-b border-[#3a3a3a] rounded-b-lg overflow-hidden">
        <div className="overflow-auto hide-scrollbar" style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <style>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none !important;
              width: 0 !important;
              height: 0 !important;
            }
            .hide-scrollbar::-webkit-scrollbar-track {
              display: none !important;
            }
            .hide-scrollbar::-webkit-scrollbar-thumb {
              display: none !important;
            }
            .hide-scrollbar {
              -webkit-overflow-scrolling: touch;
              scrollbar-width: none !important;
              -ms-overflow-style: none !important;
            }
          `}</style>
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            showLineNumbers={showLineNumbers}
            wrapLines={false}
            wrapLongLines={false}
            customStyle={{
              margin: 0,
              padding: '16px',
              backgroundColor: '#1e1e1e',
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
              overflow: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            codeTagProps={{
              style: {
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }
            }}
            lineNumberStyle={{
              color: '#666666',
              paddingRight: '16px',
              marginRight: '16px',
              borderRight: '1px solid #333333'
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default CodeBlock;

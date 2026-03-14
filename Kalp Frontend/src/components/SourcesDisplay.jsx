import React, { useState, useEffect } from 'react';

const SourcesDisplay = ({ message }) => {
  const [sources, setSources] = useState([]);

  useEffect(() => {
    if (!message) return;
    
    console.log('🔍 SourcesDisplay: Processing message for sources');
    
    // Try multiple patterns to find sources section
    let sourcesMatch = null;
    let sourcesText = '';
    
    // Pattern 1: 📌 Sources: [1] Domain - Title
    sourcesMatch = message.match(/📌?\s*Sources:\s*([\s\S]*?)(?:\n\n|$)/i);
    
    if (!sourcesMatch) {
      // Pattern 2: Just [1] Domain - Title format anywhere in message
      sourcesMatch = message.match(/(\[\d+\][^\n]*(?:\n\[\d+\][^\n]*)*)/);
    }
    
    if (sourcesMatch) {
      sourcesText = sourcesMatch[sourcesMatch.length - 1];
      console.log('📌 Found sources section:', sourcesText.substring(0, 150));
    } else {
      console.log('⚠️ No sources section found in message');
      return;
    }
    
    // Extract individual sources using flexible regex
    // Matches: [1] Domain - Title OR [1] Domain – Title
    const sourceRegex = /\[\d+\]\s*([^\-–\n]+?)(?:\s*[-–]\s*)([^\n]+)/g;
    const extractedSources = [];
    let match;
    
    while ((match = sourceRegex.exec(sourcesText)) !== null) {
      let domain = match[1].trim();
      let title = match[2].trim();
      
      // Clean domain if it has extra text
      domain = domain.replace(/\.com.*$/, '.com').replace(/\.org.*$/, '.org').replace(/\.net.*$/, '.net');
      
      console.log(`✅ Parsed source: "${domain}" | "${title}"`);
      
      extractedSources.push({
        name: domain,
        url: domain.startsWith('http') ? domain : `https://${domain}`,
        title: title,
        favicon: `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`
      });
    }
    
    if (extractedSources.length > 0) {
      console.log(`✅ Successfully extracted ${extractedSources.length} sources`);
      setSources(extractedSources);
    } else {
      console.log('⚠️ No sources matched with regex');
    }
  }, [message]);

  if (sources.length === 0) return null;

  return (
    <div className="mt-4 flex gap-2 flex-wrap">
      {sources.map((source, index) => (
        <a
          key={index}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-2 py-1 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#3a3a3a] hover:border-[#4a4a4a] rounded transition-all duration-200 group"
          title={source.title}
        >
          <img
            src={source.favicon}
            alt={source.name}
            className="w-4 h-4 rounded flex-shrink-0"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <span className="text-xs text-gray-400 group-hover:text-gray-200 font-medium">
            {source.name}
          </span>
        </a>
      ))}
    </div>
  );
};

export default SourcesDisplay;

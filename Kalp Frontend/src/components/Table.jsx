import React, { useState } from 'react';

const Table = ({ data, headers = null, caption = null }) => {
  const [copied, setCopied] = useState(false);
  
  // Auto-detect headers if not provided
  const tableHeaders = headers || (data && data.length > 0 ? Object.keys(data[0]) : []);
  
  // Function to copy table data to clipboard
  const copyTableData = async () => {
    try {
      // Format data as text table
      const headerRow = tableHeaders.join('\t');
      const dataRows = data.map(row => 
        tableHeaders.map(header => row[header] || '').join('\t')
      ).join('\n');
      
      const tableText = `${headerRow}\n${dataRows}`;
      
      await navigator.clipboard.writeText(tableText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy table data:', err);
    }
  };

  // Function to download table data as CSV
  const downloadCSV = () => {
    try {
      // Clean data for CSV format
      const cleanData = data.map(row => {
        const cleanRow = {};
        tableHeaders.forEach(header => {
          let value = row[header] || '';
          // Clean the value by removing HTML tags and special formatting
          if (typeof value === 'string') {
            value = value.replace(/beinsure[^0-9]*(\+?\d+)?/g, '').trim();
            value = value.replace(/[↑↓]/g, '').trim();
          }
          cleanRow[header] = value;
        });
        return cleanRow;
      });

      // Convert to CSV format
      const csvContent = [
        tableHeaders.join(','),
        ...cleanData.map(row => 
          tableHeaders.map(header => {
            let value = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma or quote
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `table_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download CSV:', err);
    }
  };
  
  // Function to format cell content
  const formatCellContent = (content) => {
    if (typeof content === 'string') {
      // Check if it's a currency value
      if (content.includes('$') || content.includes('USD')) {
        return <span className="font-mono text-green-400">{content}</span>;
      }
      // Check if it's a number with change indicator
      if (content.includes('↑') || content.includes('↓') || content.includes('+') || content.includes('-')) {
        const isPositive = content.includes('↑') || content.includes('+');
        return (
          <span className={`font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {content}
          </span>
        );
      }
    }
    return content;
  };

  // Function to get header style
  const getHeaderStyle = (header) => {
    const lowerHeader = header.toLowerCase();
    if (lowerHeader.includes('rank') || lowerHeader.includes('#')) {
      return 'text-center w-16';
    }
    if (lowerHeader.includes('name') || lowerHeader.includes('company')) {
      return 'text-left';
    }
    if (lowerHeader.includes('price') || lowerHeader.includes('value') || lowerHeader.includes('worth') || lowerHeader.includes('amount')) {
      return 'text-right font-mono';
    }
    return 'text-left';
  };

  // Function to get cell style
  const getCellStyle = (header, content, rowIndex) => {
    const lowerHeader = header.toLowerCase();
    let baseClass = 'text-white';
    
    if (lowerHeader.includes('rank') || lowerHeader.includes('#')) {
      baseClass += ' text-center font-bold text-[#4FC3F7]';
    } else if (lowerHeader.includes('name') || lowerHeader.includes('company')) {
      baseClass += ' text-left font-medium';
    } else if (lowerHeader.includes('price') || lowerHeader.includes('value') || lowerHeader.includes('worth') || lowerHeader.includes('amount')) {
      baseClass += ' text-right font-mono';
    } else {
      baseClass += ' text-left';
    }

    return baseClass;
  };

  if (!data || data.length === 0) {
    return (
      <div className="my-4 bg-[#1e1e1e] border-2 border-[#404040] rounded-lg p-6 text-center text-gray-400">
        <div className="text-lg font-medium">No data available</div>
        <div className="text-sm mt-1">Add some data to see the table</div>
      </div>
    );
  }

  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-[#404040] bg-[#1e1e1e] shadow-xl">
      {/* Header with Copy and Download Buttons */}
      <div className="bg-[#2a2a2a] px-4 py-3 border-b-2 border-[#404040] flex items-center justify-between">
        {caption ? (
          <h3 className="text-white font-medium text-base">{caption}</h3>
        ) : (
          <div className="text-gray-400 text-sm">Data Table</div>
        )}
        
        <div className="flex items-center space-x-2">
          {/* Copy Button */}
          <button
            onClick={copyTableData}
            className="flex items-center space-x-1 px-2 py-1 bg-transparent hover:bg-[#3d3d3d] rounded text-[#cccccc] text-xs transition-colors border border-transparent hover:border-[#555]"
            title="Copy table data"
          >
            {copied ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Download CSV Button */}
          <button
            onClick={downloadCSV}
            className="flex items-center space-x-1 px-2 py-1 bg-transparent hover:bg-[#3d3d3d] rounded text-[#cccccc] text-xs transition-colors border border-transparent hover:border-[#555]"
            title="Download as CSV"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>CSV</span>
          </button>
        </div>
      </div>
      
      {/* Table Container with Invisible Scrollbar */}
      <div 
        className="overflow-x-auto" 
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        <table className="w-full border-separate border-spacing-0">
          {/* Table Header */}
          <thead className="bg-[#2d2d2d]">
            <tr>
              {tableHeaders.map((header, index) => (
                <th
                  key={index}
                  className={`px-4 py-4 text-[#cccccc] font-semibold text-sm uppercase tracking-wider border-r-2 border-[#404040] last:border-r-0 border-b-2 ${getHeaderStyle(header)}`}
                  style={{ 
                    borderColor: '#404040'
                  }}
                >
                  {header.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Table Body with Enhanced Row Separation */}
          <tbody className="bg-[#1e1e1e]">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-[#252525] transition-colors duration-200 group"
              >
                {tableHeaders.map((header, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-4 py-4 ${getCellStyle(header, row[header], rowIndex)} border-r-2 border-[#404040] last:border-r-0 border-b-2 group-hover:border-[#4a4a4a] transition-colors duration-200`}
                    style={{ 
                      borderColor: '#404040'
                    }}
                  >
                    <div className="flex items-center">
                      {formatCellContent(row[header])}
                      
                      {/* Add special indicators for certain columns */}
                      {header.toLowerCase().includes('change') && row[header] && (
                        <span className="ml-2">
                          {String(row[header]).includes('-') ? (
                            <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          ) : String(row[header]).includes('+') ? (
                            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          ) : null}
                        </span>
                      )}
                      
                      {/* Add beinsure-style tags */}
                      {row[header] && typeof row[header] === 'string' && row[header].includes('beinsure') && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900 text-blue-200">
                          {row[header].match(/beinsure[^0-9]*(\+?\d+)?/)?.[0] || 'beinsure'}
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer */}
      <div className="bg-[#2a2a2a] px-4 py-3 border-t-2 border-[#404040]">
        <p className="text-xs text-gray-400 font-medium">
          Showing {data.length} {data.length === 1 ? 'entry' : 'entries'} • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default Table;

import React from 'react';

interface MarkdownMessageProps {
  content: string;
  isBot?: boolean;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, isBot = true }) => {
  // Parse lines into structured blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];
  let inList = false;
  let listItems: string[] = [];
  let isNumberedList = false;

  const flushTable = (key: number) => {
    if (tableHeader.length > 0 || tableRows.length > 0) {
      elements.push(
        <div
          key={`table-${key}`}
          style={{
            overflowX: 'auto',
            margin: '1rem 0',
            borderRadius: 'var(--radius-md)',
            border: isBot ? '1px solid var(--border)' : '1px solid rgba(255,255,255,0.25)',
            boxShadow: isBot ? '0 1px 3px rgba(0,0,0,0.03)' : 'none',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
              backgroundColor: isBot ? '#ffffff' : 'rgba(0,0,0,0.15)',
            }}
          >
            {tableHeader.length > 0 && (
              <thead>
                <tr style={{ backgroundColor: isBot ? '#f1f5f9' : 'rgba(255,255,255,0.15)' }}>
                  {tableHeader.map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: '0.7rem 1rem',
                        textAlign: 'left',
                        fontWeight: 700,
                        borderBottom: isBot ? '2px solid var(--border)' : '2px solid rgba(255,255,255,0.25)',
                        color: isBot ? 'var(--text-main)' : '#ffffff',
                        fontSize: '0.8125rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {tableRows.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    backgroundColor: ri % 2 === 1 && isBot ? '#f8fafc' : 'transparent',
                    borderBottom: ri < tableRows.length - 1 ? (isBot ? '1px solid var(--border-subtle)' : '1px solid rgba(255,255,255,0.1)') : 'none',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        padding: '0.65rem 1rem',
                        color: isBot ? (ci === 0 ? 'var(--text-main)' : 'var(--text-body)') : '#ffffff',
                        fontWeight: ci === 0 ? 600 : 400,
                        lineHeight: 1.5,
                        verticalAlign: 'top',
                      }}
                    >
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableHeader = [];
    tableRows = [];
    inTable = false;
  };

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      if (isNumberedList) {
        elements.push(
          <ol key={`ol-${key}`} style={{ margin: '0.5rem 0 0.75rem 1.4rem', paddingLeft: 0, fontSize: '0.9rem', color: isBot ? 'inherit' : '#ffffff' }}>
            {listItems.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '0.4rem', lineHeight: 1.55 }}>
                {renderInline(item)}
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${key}`} style={{ margin: '0.5rem 0 0.75rem 1.4rem', paddingLeft: 0, fontSize: '0.9rem', color: isBot ? 'inherit' : '#ffffff' }}>
            {listItems.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '0.4rem', lineHeight: 1.55 }}>
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
      }
    }
    listItems = [];
    inList = false;
  };

  const renderInline = (text: string): React.ReactNode => {
    // Process markdown inline syntax: `code`, **bold**, *italic*
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let index = 0;

    while (remaining.length > 0) {
      // Inline code
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code
            key={`code-${index++}`}
            style={{
              backgroundColor: isBot ? 'var(--bg-subtle)' : 'rgba(0,0,0,0.25)',
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              fontSize: '0.82em',
              fontFamily: 'monospace',
              border: isBot ? '1px solid var(--border)' : '1px solid rgba(255,255,255,0.2)',
              color: isBot ? 'var(--teal-700)' : '#ffffff',
              fontWeight: 600,
            }}
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Bold text
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        parts.push(
          <strong key={`bold-${index++}`} style={{ fontWeight: 700, color: isBot ? 'var(--text-main)' : '#ffffff' }}>
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italic text
      const italicMatch = remaining.match(/^\*([^*]+)\*/);
      if (italicMatch) {
        parts.push(
          <em key={`italic-${index++}`} style={{ fontStyle: 'italic', color: isBot ? 'inherit' : '#ffffff' }}>
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Plain char
      const nextSpecial = remaining.search(/[`*]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return <>{parts}</>;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Table line: starts with | and contains |
    if (line.startsWith('|') && (line.endsWith('|') || line.includes('|'))) {
      if (!inTable) {
        flushList(i);
        inTable = true;
        const cells = line
          .split('|')
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
          .map((c) => c.trim());
        tableHeader = cells;
      } else {
        // Divider row check
        if (line.replace(/[|\-\s:]/g, '').length === 0) {
          continue;
        }
        const cells = line
          .split('|')
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
          .map((c) => c.trim());
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    // Unordered List
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList || isNumberedList) {
        flushList(i);
        inList = true;
        isNumberedList = false;
      }
      listItems.push(line.slice(2).trim());
      continue;
    }

    // Numbered List
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      if (!inList || !isNumberedList) {
        flushList(i);
        inList = true;
        isNumberedList = true;
      }
      listItems.push(numMatch[2].trim());
      continue;
    }

    if (inList) {
      flushList(i);
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h4
          key={`h3-${i}`}
          style={{
            fontSize: '0.98rem',
            fontWeight: 800,
            color: isBot ? 'var(--primary)' : '#ffffff',
            margin: '0.85rem 0 0.35rem 0',
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          {renderInline(line.slice(4))}
        </h4>
      );
      continue;
    }

    if (line.startsWith('#### ')) {
      elements.push(
        <h5
          key={`h4-${i}`}
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: isBot ? 'var(--text-main)' : '#ffffff',
            margin: '0.75rem 0 0.35rem 0',
          }}
        >
          {renderInline(line.slice(5))}
        </h5>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`bq-${i}`}
          style={{
            margin: '0.5rem 0',
            padding: '0.55rem 0.85rem',
            backgroundColor: isBot ? 'var(--teal-50)' : 'rgba(0,0,0,0.2)',
            borderLeft: `3px solid ${isBot ? 'var(--teal-600)' : '#ffffff'}`,
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            fontSize: '0.8125rem',
            color: isBot ? 'var(--teal-900)' : '#ffffff',
            lineHeight: 1.45,
          }}
        >
          {renderInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Divider
    if (line === '---' || line === '***') {
      elements.push(
        <hr
          key={`hr-${i}`}
          style={{
            border: 'none',
            borderTop: isBot ? '1px solid var(--border)' : '1px solid rgba(255,255,255,0.2)',
            margin: '0.75rem 0',
          }}
        />
      );
      continue;
    }

    // Regular text / paragraph
    if (line.length > 0) {
      elements.push(
        <p
          key={`p-${i}`}
          style={{
            margin: '0.35rem 0',
            lineHeight: 1.55,
            color: isBot ? 'var(--text-body)' : '#ffffff',
          }}
        >
          {renderInline(line)}
        </p>
      );
    }
  }

  flushTable(lines.length);
  flushList(lines.length);

  return <div style={{ display: 'flex', flexDirection: 'column' }}>{elements}</div>;
};

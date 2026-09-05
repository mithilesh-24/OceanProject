import React from 'react';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Clean, secure, and beautiful Markdown parser and renderer
 * designed specifically for scientific AI oceanographic outputs.
 * Parses headings, bold/italics, bullet/ordered lists, blockquotes,
 * inline code, code blocks, and markdown tables without unsafe innerHTML.
 */
export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inList: 'ul' | 'ol' | null = null;
  let listItems: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      if (inList === 'ul') {
        elements.push(
          <ul key={`ul-${elements.length}`} style={{ paddingLeft: '18px', margin: '6px 0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {listItems}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${elements.length}`} style={{ paddingLeft: '18px', margin: '6px 0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {listItems}
          </ol>
        );
      }
      inList = null;
      listItems = [];
    }
  };

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1).filter((r) => !r.every((c) => /^[-:\s]+$/.test(c)));

      elements.push(
        <div key={`table-wrapper-${elements.length}`} style={{ overflowX: 'auto', margin: '8px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-secondary)' }}>
                {headerRow.map((h, i) => (
                  <th key={i} style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {renderInline(h.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{ padding: '4px 8px', color: 'var(--text-secondary)' }}>
                      {renderInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableRows = [];
    }
  };

  const flushCodeBlock = () => {
    if (inCodeBlock) {
      elements.push(
        <pre
          key={`code-${elements.length}`}
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid var(--border)',
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono, monospace)',
            overflowX: 'auto',
            color: '#38bdf8',
            margin: '6px 0'
          }}
        >
          <code>{codeBlockLines.join('\n')}</code>
        </pre>
      );
      inCodeBlock = false;
      codeBlockLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushList();
        flushTable();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Check for Table rows
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      inTable = true;
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Empty lines
    if (!trimmed) {
      flushList();
      flushTable();
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList();
      flushTable();
      elements.push(
        <h3 key={`h3-${i}`} style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', margin: '8px 0 4px 0', letterSpacing: '-0.01em' }}>
          {renderInline(trimmed.substring(4))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      flushTable();
      elements.push(
        <h2 key={`h2-${i}`} style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', margin: '10px 0 4px 0' }}>
          {renderInline(trimmed.substring(3))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      flushTable();
      elements.push(
        <h1 key={`h1-${i}`} style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', margin: '12px 0 6px 0' }}>
          {renderInline(trimmed.substring(2))}
        </h1>
      );
      continue;
    }

    // Blockquotes / Alerts
    if (trimmed.startsWith('> ')) {
      flushList();
      flushTable();
      const quoteText = trimmed.substring(2);
      elements.push(
        <blockquote
          key={`quote-${i}`}
          style={{
            borderLeft: '3px solid var(--primary)',
            paddingLeft: '10px',
            margin: '6px 0',
            color: 'var(--text-secondary)',
            fontSize: '11.5px',
            backgroundColor: 'rgba(56, 189, 248, 0.05)',
            padding: '4px 8px',
            borderRadius: '0 4px 4px 0'
          }}
        >
          {renderInline(quoteText)}
        </blockquote>
      );
      continue;
    }

    // Unordered Lists
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      flushTable();
      if (inList !== 'ul') {
        flushList();
        inList = 'ul';
      }
      const itemText = trimmed.substring(2);
      listItems.push(
        <li key={`li-${i}`} style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          {renderInline(itemText)}
        </li>
      );
      continue;
    }

    // Ordered Lists
    const matchOrdered = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (matchOrdered) {
      flushTable();
      if (inList !== 'ol') {
        flushList();
        inList = 'ol';
      }
      listItems.push(
        <li key={`oli-${i}`} style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          {renderInline(matchOrdered[2])}
        </li>
      );
      continue;
    }

    // Regular paragraph
    flushList();
    flushTable();
    elements.push(
      <p key={`p-${i}`} style={{ margin: '4px 0', fontSize: '11.5px', color: 'inherit', lineHeight: 1.5 }}>
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList();
  flushTable();
  flushCodeBlock();

  return <div className={`copilot-markdown-body ${className || ''}`}>{elements}</div>;
};

/**
 * Safely parse inline Markdown constructs (bold, italics, code, links)
 */
function renderInline(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining) {
    // 1. Bold: **text**
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)$/);
    if (boldMatch) {
      const [, before, boldText, after] = boldMatch;
      if (before) result.push(...renderInlineTokens(before, keyIndex++));
      result.push(
        <strong key={`b-${keyIndex++}`} style={{ fontWeight: 600, color: 'var(--text-bright, #f8fafc)' }}>
          {renderInlineTokens(boldText, keyIndex++)}
        </strong>
      );
      remaining = after;
      continue;
    }

    // 2. Inline code: `code`
    const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)$/);
    if (codeMatch) {
      const [, before, codeText, after] = codeMatch;
      if (before) result.push(...renderInlineTokens(before, keyIndex++));
      result.push(
        <code
          key={`code-${keyIndex++}`}
          style={{
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            color: '#38bdf8',
            padding: '1px 4px',
            borderRadius: '3px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono, monospace)'
          }}
        >
          {codeText}
        </code>
      );
      remaining = after;
      continue;
    }

    // 3. Italics: *text* or _text_
    const italicMatch = remaining.match(/^(.*?)[*_]([^*_]+)[*_](.*)$/);
    if (italicMatch) {
      const [, before, italicText, after] = italicMatch;
      if (before) result.push(...renderInlineTokens(before, keyIndex++));
      result.push(
        <em key={`em-${keyIndex++}`} style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
          {italicText}
        </em>
      );
      remaining = after;
      continue;
    }

    // Remainder is plain text
    result.push(...renderInlineTokens(remaining, keyIndex++));
    break;
  }

  return result;
}

function renderInlineTokens(text: string, baseKey: number): React.ReactNode[] {
  // Strip or format math notations like $W < -0.2\sigma_W$ cleanly
  const formatted = text
    .replace(/\$\\Delta\\eta_\{?\\text\{?surge\}?\}?\$/g, 'Δη surge')
    .replace(/\$\\text\{CO\}_2\$/g, 'CO₂')
    .replace(/\$Ro = ([0-9.]+)\$/g, 'Ro = $1')
    .replace(/\$W < ([^$]+)\$/g, 'W < $1')
    .replace(/\$R_\{?\\text\{?wave\}?\}? \\propto H_s\^2\$/g, 'R_wave ∝ Hs²')
    .replace(/\$\\Omega_\{?\\text\{?arag\}?\}? = ([0-9.]+)\$/g, 'Ω_arag = $1')
    .replace(/\$\[?\\text\{DO\}\]? < ([0-9]+)\\mu\\text\{mol\/kg\}\$/g, 'DO < $1 µmol/kg');

  return [<span key={`span-${baseKey}`}>{formatted}</span>];
}

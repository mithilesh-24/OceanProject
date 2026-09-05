import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, X, Sparkles, ChevronRight, Activity, 
  Terminal, ShieldCheck, Compass, Layers, AlertCircle, RefreshCw
} from 'lucide-react';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { Input } from '../UI/Input';
import { api, CopilotChatMessage, CopilotChatResponse, StructuredCesiumAction } from '../../services/apiClient';
import { validateCesiumAction } from '../../utils/actionValidator';

interface RightSideCopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatchCesiumAction?: (action: StructuredCesiumAction) => void;
  clientContext?: {
    current_route?: string;
    selected_model?: string;
    selected_variable?: string;
    selected_depth?: number;
    selected_time?: string;
    selected_platform_id?: string;
    current_region?: string;
    enabled_layers?: string[];
  };
}

export const RightSideCopilotPanel: React.FC<RightSideCopilotPanelProps> = ({
  isOpen,
  onClose,
  onDispatchCesiumAction,
  clientContext
}) => {
  const [messages, setMessages] = useState<CopilotChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I am the **BlueSphere AI Ocean Copilot**. Ask me to navigate to ocean basins, analyze mesoscale eddies, inspect oxygen minimum zones, optimize shipping passages, or compare numerical models.'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastActions, setLastActions] = useState<StructuredCesiumAction[]>([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    'Go to Arabian Sea',
    'Show Argo near Sri Lanka',
    'Compare HYCOM and ROMS',
    'Find active eddies',
    'Show OMZ',
    'Find cyclone threats'
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query || loading) return;

    const userMsg: CopilotChatMessage = { role: 'user', content: query };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputVal('');
    setLoading(true);

    try {
      const response: CopilotChatResponse = await api.chatWithCopilot({
        message: query,
        history: updatedHistory.slice(-6),
        context: clientContext
      });

      const assistantMsg: CopilotChatMessage = {
        role: 'assistant',
        content: response.message
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLastActions(response.structured_actions || []);

      if (response.suggested_prompts && response.suggested_prompts.length > 0) {
        setSuggestedPrompts(response.suggested_prompts);
      }

      // Validate and dispatch actions to Cesium
      if (response.structured_actions && response.structured_actions.length > 0 && onDispatchCesiumAction) {
        response.structured_actions.forEach((act) => {
          const valRes = validateCesiumAction(act);
          if (valRes.isValid && valRes.sanitizedAction) {
            onDispatchCesiumAction(valRes.sanitizedAction);
          } else {
            console.warn('Rejected invalid AI Cesium action:', valRes.error);
          }
        });
      }
    } catch (err) {
      console.error('Copilot request failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Unable to connect to the backend AI Copilot provider. Please check FastAPI server connectivity.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      style={{
        position: 'fixed',
        top: '48px',
        right: '0px',
        bottom: '0px',
        width: '380px',
        zIndex: 45,
        backgroundColor: 'var(--backdrop-panel)',
        backdropFilter: 'var(--backdrop-blur)',
        borderLeft: '1px solid var(--border)',
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                AI Ocean Copilot
              </h3>
              <Badge variant="primary" style={{ fontSize: '9px', padding: '1px 5px' }}>
                gpt-oss-20b
              </Badge>
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              NVIDIA Cloud API &bull; Controlled Tool Agent
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Close Copilot Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Prompts Pills */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-secondary)',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}
      >
        {suggestedPrompts.slice(0, 4).map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            style={{
              padding: '3px 8px',
              fontSize: '10.5px',
              fontWeight: 500,
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0
            }}
          >
            <Sparkles className="w-2.5 h-2.5 text-[var(--primary)]" />
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '90%',
                padding: '10px 12px',
                borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                backgroundColor: m.role === 'user' ? 'var(--primary)' : 'var(--bg-surface)',
                color: m.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                fontSize: '12px',
                lineHeight: 1.5,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {m.content.split('\n').map((paragraph, pIdx) => (
                <p key={pIdx} style={{ margin: pIdx > 0 ? '6px 0 0 0' : 0 }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', color: 'var(--text-muted)', fontSize: '11.5px' }}>
            <Activity className="w-3.5 h-3.5 text-cyan animate-spin" />
            <span>Consulting hydrodynamic engines &amp; tool registry...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        style={{
          padding: '10px 12px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}
      >
        <input
          type="text"
          placeholder="Ask BlueSphere Copilot..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            padding: '7px 12px',
            fontSize: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-surface-secondary)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!inputVal.trim() || loading}
          style={{ height: '32px', width: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </aside>
  );
};

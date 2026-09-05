import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Bot, User, ArrowRight, Globe, Zap, Compass, RefreshCw, X, Lightbulb } from 'lucide-react';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { Input } from '../UI/Input';
import { api } from '../../services/apiClient';

interface OceanCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OceanCopilotDrawer: React.FC<OceanCopilotDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; responseData?: any }>>([
    {
      sender: 'bot',
      text: "👋 Hello! I am **Bluesphere Ocean Copilot**, your physical oceanography AI assistant.\n\nAsk me anything about active marine heatwaves, model accuracy (HYCOM vs ROMS), salinity barrier layers, or tell me to fly to specific coordinates on the 3D globe!"
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);

  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const prompts = await api.getSuggestedPrompts();
        setSuggestedPrompts(prompts);
      } catch (e) {
        setSuggestedPrompts([
          "Explain the active Marine Heatwave in the Central Arabian Sea",
          "What causes the low salinity barrier layer in the Bay of Bengal?",
          "Compare HYCOM vs ROMS skill scores across Indian Ocean depths"
        ]);
      }
    };
    loadPrompts();
  }, []);

  const handleSend = async (userText: string) => {
    const q = userText || inputVal;
    if (!q.trim() || isLoading) return;

    const newMessages = [...messages, { sender: 'user' as const, text: q }];
    setMessages(newMessages);
    setInputVal('');
    setIsLoading(true);

    try {
      const res = await api.askOceanCopilot({
        message: q,
        context_view: 'explorer',
        active_model: 'hycom',
        active_variable: 'temperature'
      });

      setMessages([
        ...newMessages,
        {
          sender: 'bot' as const,
          text: res.answer_markdown,
          responseData: res
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: 'bot' as const,
          text: "I encountered an error analyzing that oceanographic query. Please ensure FastAPI backend is running."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = (act: any) => {
    if (act.action_type === 'FLY_TO' && act.latitude !== undefined && act.longitude !== undefined) {
      navigate(`/explorer?lat=${act.latitude}&lon=${act.longitude}&zoom=basin&var=${act.variable || 'temperature'}`);
      onClose();
    } else if (act.action_type === 'SWITCH_VIEW' && act.target_path) {
      navigate(act.target_path);
      onClose();
    } else if (act.target_path) {
      navigate(act.target_path);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="ui-drawer-backdrop" onClick={onClose} />
      <div className="ui-drawer-right" style={{ width: '480px', maxWidth: '95vw', padding: '0', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-surface-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Ocean AI Copilot
                </h3>
                <Badge variant="primary" style={{ fontSize: '9px', padding: '1px 5px' }}>Phase 25</Badge>
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Natural Language Ocean Intelligence</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" iconOnly onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Suggested Prompts Pills */}
        <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 500,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              ✨ {prompt.length > 38 ? prompt.slice(0, 38) + '...' : prompt}
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                gap: '4px'
              }}
            >
              <div
                style={{
                  maxWidth: '90%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-surface-secondary)',
                  color: m.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '12.5px',
                  lineHeight: 1.5,
                  border: m.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                {/* Parse Markdown-like sections simply */}
                {m.text.split('\n\n').map((para, pIdx) => (
                  <p key={pIdx} style={{ margin: pIdx === 0 ? 0 : '8px 0 0 0' }}>
                    {para}
                  </p>
                ))}

                {/* Structured Insights & Action Chips */}
                {m.responseData?.globe_actions && m.responseData.globe_actions.length > 0 && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {m.responseData.globe_actions.map((act: any, aIdx: number) => (
                      <button
                        key={aIdx}
                        onClick={() => executeAction(act)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--primary)',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <Globe className="w-3 h-3" />
                        Execute: {act.action_type} {act.variable || act.target_path || ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
              <RefreshCw className="w-4 h-4 animate-spin text-[var(--primary)]" />
              <span>Analyzing hydrographic data &amp; physical state...</span>
            </div>
          )}
        </div>

        {/* Query Input Bar */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputVal);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Input
              size="md"
              placeholder="Ask Copilot (e.g. 'Show me Arabian Sea MHW')..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isLoading}
            />
            <Button
              variant="primary"
              size="md"
              type="submit"
              iconOnly
              disabled={!inputVal.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

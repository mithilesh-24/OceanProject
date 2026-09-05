import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Bot, Send, X, Sparkles, ChevronRight, Activity, 
  Terminal, ShieldCheck, Compass, Layers, AlertCircle, RefreshCw, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { api, CopilotChatMessage, CopilotChatResponse, StructuredCesiumAction, ToolCallRecord } from '../../services/apiClient';
import { validateCesiumAction } from '../../utils/actionValidator';
import { MarkdownContent } from './MarkdownContent';

import { applicationController } from '../../controllers/applicationController';

interface ActionExecutionStatus {
  text: string;
  state: 'RUNNING' | 'SUCCESS' | 'FAILED';
}

interface ChatMessageWithMetadata extends CopilotChatMessage {
  toolCalls?: ToolCallRecord[];
  actionStatuses?: ActionExecutionStatus[];
  provenance?: string;
  isError?: boolean;
}

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

const formatToolLabel = (toolName: string, status: string): { text: string; success: boolean } => {
  const isSuccess = status === 'SUCCESS';
  switch (toolName) {
    case 'navigate_to_page':
      return { text: isSuccess ? 'Opened application view' : 'Navigation failed', success: isSuccess };
    case 'control_4d_view':
      return { text: isSuccess ? 'Opened 4D temporal view' : '4D view control failed', success: isSuccess };
    case 'run_error_analysis':
      return { text: isSuccess ? 'Computed spatial error metrics' : 'Error analysis failed', success: isSuccess };
    case 'get_accuracy_analysis':
      return { text: isSuccess ? 'Evaluated model skill scores' : 'Accuracy analysis failed', success: isSuccess };
    case 'get_anomaly_analysis':
      return { text: isSuccess ? 'Detected ocean anomalies & MHW' : 'Anomaly detection failed', success: isSuccess };
    case 'go_to_region':
    case 'go_to_location':
      return { text: isSuccess ? 'Navigating Cesium camera' : 'Navigation failed', success: isSuccess };
    case 'get_eddies':
      return { text: isSuccess ? 'Identified mesoscale vortices' : 'Unable to query eddy data', success: isSuccess };
    case 'get_omz':
      return { text: isSuccess ? 'Analyzed OMZ hypoxia volumes' : 'Unable to query BGC data', success: isSuccess };
    case 'optimize_maritime_route':
      return { text: isSuccess ? 'Calculated isochrone sea lane' : 'Route calculation failed', success: isSuccess };
    case 'get_ml_forecast':
      return { text: isSuccess ? 'Synthesized PINN forecast' : 'ML surrogate weights unconfigured', success: isSuccess };
    case 'get_active_disasters':
      return { text: isSuccess ? 'Evaluated cyclone surge threats' : 'Disaster feed unavailable', success: isSuccess };
    case 'run_model_intercomparison':
      return { text: isSuccess ? 'Executed model difference grid' : 'Intercomparison failed', success: isSuccess };
    case 'set_active_layer':
      return { text: isSuccess ? 'Toggled 3D layer' : 'Layer toggle failed', success: isSuccess };
    default:
      return { text: isSuccess ? `Executed tool: ${toolName}` : `Tool failed: ${toolName}`, success: isSuccess };
  }
};

export const RightSideCopilotPanel: React.FC<RightSideCopilotPanelProps> = ({
  isOpen,
  onClose,
  onDispatchCesiumAction,
  clientContext
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize application controller bridge
  useEffect(() => {
    applicationController.init(navigate, () => location.pathname);
  }, [navigate, location.pathname]);

  const [messages, setMessages] = useState<ChatMessageWithMetadata[]>([
    {
      role: 'assistant',
      content: 'Hello! I am the **BlueSphere AI Ocean Copilot**.\n\nAsk me to navigate anywhere in BlueSphere (3D explorer, 4D temporal view, error analysis, model accuracy), control the Cesium 3D globe, track mesoscale eddies, or run multi-model comparisons (HYCOM vs ROMS).'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    'Open 4D',
    'Go to Arabian Sea',
    'Show active eddies near Sri Lanka',
    'Open error analysis',
    'Compare HYCOM and ROMS',
    'Open biogeochemistry'
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

    const userMsg: ChatMessageWithMetadata = { role: 'user', content: query };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputVal('');
    setLoading(true);

    try {
      const response: CopilotChatResponse = await api.chatWithCopilot({
        message: query,
        history: updatedHistory.slice(-6).map(m => ({ role: m.role, content: m.content })),
        context: {
          current_route: location.pathname,
          ...clientContext
        }
      });

      const assistantMsgIndex = updatedHistory.length;
      const initialActionStatuses: ActionExecutionStatus[] = [];

      const assistantMsg: ChatMessageWithMetadata = {
        role: 'assistant',
        content: response.message || 'I processed your request.',
        toolCalls: response.tool_calls || [],
        actionStatuses: initialActionStatuses,
        provenance: response.provenance
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (response.suggested_prompts && response.suggested_prompts.length > 0) {
        setSuggestedPrompts(response.suggested_prompts);
      }

      // Execute structured actions via ApplicationController Navigation Transaction
      if (response.structured_actions && response.structured_actions.length > 0) {
        for (const act of response.structured_actions) {
          const valRes = validateCesiumAction(act);
          if (valRes.isValid && valRes.sanitizedAction) {
            const sanitized = valRes.sanitizedAction;

            await applicationController.navigateAndExecute(sanitized, (statusText, state) => {
              setMessages((prev) => {
                const next = [...prev];
                const targetMsg = next[assistantMsgIndex];
                if (targetMsg) {
                  const existing = targetMsg.actionStatuses || [];
                  const updated = [...existing.filter(s => s.text !== statusText), { text: statusText, state }];
                  next[assistantMsgIndex] = {
                    ...targetMsg,
                    actionStatuses: updated
                  };
                }
                return next;
              });
            });

            if (onDispatchCesiumAction) {
              onDispatchCesiumAction(sanitized);
            }
          }
        }
      }
    } catch (err) {
      console.error('Copilot request failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'AI provider is currently unavailable. Please try again.',
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      className="copilot-drawer-panel"
      style={{
        width: '380px',
        minWidth: '380px',
        maxWidth: '380px',
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zIndex: 80,
        overflow: 'hidden',
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.25)',
        position: 'relative'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface-secondary)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                BlueSphere AI Copilot
              </h3>
              <Badge variant="primary" style={{ fontSize: '9px', padding: '1px 5px' }}>
                gpt-oss-20b
              </Badge>
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              NVIDIA Cloud API &bull; 26 Controlled Tools
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
          padding: '6px 10px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}
      >
        {suggestedPrompts.slice(0, 4).map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            style={{
              padding: '3px 8px',
              fontSize: '10px',
              fontWeight: 500,
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-surface-secondary)',
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
          padding: '12px',
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
              width: '100%'
            }}
          >
            {/* Action Execution Progress Badges (Real Navigation Handshake) */}
            {m.role === 'assistant' && m.actionStatuses && m.actionStatuses.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '6px' }}>
                {m.actionStatuses.map((s, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '10px',
                      fontWeight: 600,
                      backgroundColor: s.state === 'SUCCESS' 
                        ? 'rgba(16, 185, 129, 0.12)' 
                        : s.state === 'FAILED'
                          ? 'rgba(244, 63, 94, 0.12)'
                          : 'rgba(6, 182, 212, 0.12)',
                      border: `1px solid ${
                        s.state === 'SUCCESS' 
                          ? 'rgba(16, 185, 129, 0.3)' 
                          : s.state === 'FAILED'
                            ? 'rgba(244, 63, 94, 0.3)'
                            : 'rgba(6, 182, 212, 0.3)'
                      }`,
                      color: s.state === 'SUCCESS' 
                        ? 'var(--success, #10b981)' 
                        : s.state === 'FAILED'
                          ? 'var(--error, #f43f5e)'
                          : 'var(--cyan, #06b6d4)',
                      width: 'fit-content'
                    }}
                  >
                    {s.state === 'RUNNING' && <Activity className="w-2.5 h-2.5 animate-spin" />}
                    {s.state === 'SUCCESS' && <CheckCircle2 className="w-2.5 h-2.5" />}
                    {s.state === 'FAILED' && <AlertTriangle className="w-2.5 h-2.5" />}
                    <span>{s.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tool Badges executed for this message */}
            {m.role === 'assistant' && (!m.actionStatuses || m.actionStatuses.length === 0) && m.toolCalls && m.toolCalls.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                {m.toolCalls.map((t, tIdx) => {
                  const info = formatToolLabel(t.tool_name, t.status);
                  return (
                    <div
                      key={tIdx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '10px',
                        fontWeight: 600,
                        backgroundColor: info.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.15)',
                        border: `1px solid ${info.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.35)'}`,
                        color: info.success ? 'var(--success, #10b981)' : 'var(--warning, #f59e0b)'
                      }}
                    >
                      {info.success ? (
                        <CheckCircle2 className="w-2.5 h-2.5" />
                      ) : (
                        <AlertTriangle className="w-2.5 h-2.5" />
                      )}
                      <span>{info.text}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Message Bubble */}
            <div
              style={{
                maxWidth: '92%',
                padding: '9px 12px',
                borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                backgroundColor: m.role === 'user' 
                  ? 'var(--primary)' 
                  : m.isError 
                    ? 'rgba(244, 63, 94, 0.1)' 
                    : 'var(--bg-surface-secondary)',
                color: m.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                border: m.role === 'user' 
                  ? 'none' 
                  : m.isError 
                    ? '1px solid rgba(244, 63, 94, 0.3)' 
                    : '1px solid var(--border)',
                fontSize: '11.5px',
                lineHeight: 1.5,
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              {m.role === 'user' ? (
                <span style={{ whiteSpace: 'pre-wrap' }}>{m.content}</span>
              ) : (
                <MarkdownContent content={m.content} />
              )}
            </div>

            {/* Provenance Footer */}
            {m.role === 'assistant' && m.provenance && (
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '3px', paddingLeft: '4px' }}>
                Provenance: {m.provenance}
              </span>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '11px',
              width: 'fit-content'
            }}
          >
            <Activity className="w-3.5 h-3.5 text-cyan animate-spin" />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '11px' }}>AI Copilot</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Analyzing ocean data &amp; consulting tools...</div>
            </div>
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
          padding: '8px 10px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--bg-surface-secondary)',
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          flexShrink: 0
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
            padding: '6px 10px',
            fontSize: '11.5px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!inputVal.trim() || loading}
          style={{ height: '30px', width: '30px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </aside>
  );
};

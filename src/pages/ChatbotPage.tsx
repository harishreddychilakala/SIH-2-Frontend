import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Plus,
  Scale,
  FileText,
  ChevronRight,
  Wind,
  ShieldCheck,
  History,
  MessageSquare,
  Trash2,
  Package,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Badge } from '../components/common/Badge';
import { MarkdownMessage } from '../components/chat/MarkdownMessage';
import { AiThinkingBubble } from '../components/chat/AiThinkingBubble';
import { chatService, chatPromptPresets, initialChatMessages, resetChatSession } from '../services/chatService';
import { recommendationService } from '../services/recommendationService';
import type { ChatMessage, ChatPromptPreset, RecommendationHistoryItem } from '../types';

export interface StoredChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: ChatMessage[];
  commodityName?: string;
}

const STORAGE_KEY_SESSIONS = 'packsmart_chat_sessions_v3';
const STORAGE_KEY_ACTIVE_ID = 'packsmart_chat_active_id_v3';

export const ChatbotPage: React.FC = () => {
  const location = useLocation();

  const [sessions, setSessions] = useState<StoredChatSession[]>(() => {
    let saved: StoredChatSession[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (raw) saved = JSON.parse(raw);
    } catch {
      // fallback
    }

    // Check if a specific past session was requested via query param e.g. ?session=XYZ
    const requestedId = new URLSearchParams(window.location.search).get('session');
    if (requestedId && saved.some((s) => s.id === requestedId)) {
      return saved;
    }

    // If the top session has NO user messages, it's already an unstarted clean new chat
    if (saved.length > 0 && !saved[0].messages.some((m) => m.sender === 'user')) {
      return saved;
    }

    // Otherwise, create a brand new clean consultation session at the front
    const freshSession: StoredChatSession = {
      id: 'session-' + Date.now(),
      title: 'New Consultation',
      timestamp: 'Just now',
      messages: initialChatMessages,
    };
    return [freshSession, ...saved];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const requestedId = new URLSearchParams(window.location.search).get('session');
    if (requestedId && sessions.some((s) => s.id === requestedId)) {
      return requestedId;
    }
    return sessions[0]?.id || 'session-default';
  });

  const [pastRecommendations, setPastRecommendations] = useState<RecommendationHistoryItem[]>([]);
  const [showHistorySidebar, setShowHistorySidebar] = useState(true);
  const [activeHistoryTab, setActiveHistoryTab] = useState<'chats' | 'recommendations'>('chats');
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastNewChatTriggerRef = useRef<number | null>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || {
    id: 'session-default',
    title: 'New Consultation',
    timestamp: 'Just now',
    messages: initialChatMessages,
  };

  const messages = activeSession.messages;

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Reset conversational memory on initial mount
  useEffect(() => {
    resetChatSession();
  }, []);

  // Handle explicit new chat trigger from navigation (e.g. clicking AI Chat navbar/sidebar)
  useEffect(() => {
    const newChatTrigger = (location.state as any)?.newChat;
    if (newChatTrigger && newChatTrigger !== lastNewChatTriggerRef.current) {
      lastNewChatTriggerRef.current = newChatTrigger;
      handleNewChat();
    }
  }, [location.state]);

  // Load past recommendation dossiers from service
  useEffect(() => {
    async function loadPastRecs() {
      try {
        const history = await recommendationService.getHistory();
        setPastRecommendations(history || []);
      } catch {
        setPastRecommendations([]);
      }
    }
    loadPastRecs();
  }, []);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeSessionId);
    } catch (e) {
      console.warn(e);
    }
    scrollToBottom('smooth');
  }, [sessions, activeSessionId, isTyping]);

  const updateActiveSessionMessages = (newMessages: ChatMessage[], newTitle?: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: newMessages,
            title: newTitle || s.title,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return s;
      })
    );
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isTyping) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    const updatedWithUser = [...messages, userMessage];

    // Generate dynamic title if it's the first user message
    let sessionTitle = activeSession.title;
    if (activeSession.title === 'Packaging Consultation' || activeSession.title === 'New Consultation') {
      sessionTitle = text.length > 32 ? text.slice(0, 32) + '...' : text;
    }

    updateActiveSessionMessages(updatedWithUser, sessionTitle);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    try {
      const botReply = await chatService.processUserMessage(text);
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...updatedWithUser, botReply],
              timestamp: 'Just now',
            };
          }
          return s;
        })
      );
    } catch {
      const errorReply: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'bot',
        text: 'Sorry, I encountered an issue processing that query. Please try selecting a preset or rephrase.',
        timestamp: 'Just now',
      };
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...updatedWithUser, errorReply],
            };
          }
          return s;
        })
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    resetChatSession();
    const newId = 'session-' + Date.now();
    const newSession: StoredChatSession = {
      id: newId,
      title: 'New Consultation',
      timestamp: 'Just now',
      messages: initialChatMessages,
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setInputVal('');
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = sessions.filter((s) => s.id !== sessionId);
    if (remaining.length === 0) {
      const fresh: StoredChatSession = {
        id: 'session-' + Date.now(),
        title: 'New Consultation',
        timestamp: 'Just now',
        messages: initialChatMessages,
      };
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
    } else {
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  const handleDiscussRecommendation = async (rec: RecommendationHistoryItem) => {
    const prompt = `Can you explain the barrier specifications and packaging recommendation for ${rec.commodityName}?`;
    handleSendMessage(prompt);
  };

  const handlePresetClick = (preset: ChatPromptPreset) => {
    handleSendMessage(preset.prompt);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <PageHeader
        title="AI Packaging Assistant"
        description="Conversational decision support assistant for post-harvest food properties and barrier material matching."
        badgeText="PackBot SIH26236"
        actions={
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <button
              type="button"
              className={`btn btn-sm ${showHistorySidebar ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setShowHistorySidebar(!showHistorySidebar)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="Toggle Past Conversations & Recommendations Drawer"
            >
              <History size={16} />
              <span>{showHistorySidebar ? 'Hide History' : 'Past History'}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleNewChat}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
              title="Start a new chat consultation"
            >
              <Plus size={16} /> New Chat
            </button>
          </div>
        }
      />

      {/* Preset Prompts Strip */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Sparkles size={14} style={{ color: 'var(--primary-vivid)' }} /> Quick Science Inquiries
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>Click any prompt to consult PackBot</span>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '0.6rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}
        >
          {chatPromptPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetClick(preset)}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                padding: '0.4rem 0.95rem',
                fontSize: '0.8rem',
                color: 'var(--text-main)',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: 'var(--shadow-xs)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-border)';
                e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>{preset.title}</span>
              <ChevronRight size={13} style={{ color: 'var(--primary-vivid)' }} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Interface + History Drawer Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showHistorySidebar ? '280px 1fr' : '1fr',
          gap: '1rem',
          alignItems: 'stretch',
          height: 'calc(100vh - 175px)',
          minHeight: '620px',
        }}
      >
        {/* PAST CONVERSATIONS & RECOMMENDATIONS SIDEBAR */}
        {showHistorySidebar && (
          <div
            className="card"
            style={{
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Sidebar Navigation Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
              <button
                type="button"
                onClick={() => setActiveHistoryTab('chats')}
                style={{
                  flex: 1,
                  padding: '0.75rem 0.5rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: 'none',
                  borderBottom: activeHistoryTab === 'chats' ? '2px solid var(--primary)' : '2px solid transparent',
                  backgroundColor: activeHistoryTab === 'chats' ? '#ffffff' : 'transparent',
                  color: activeHistoryTab === 'chats' ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                <MessageSquare size={14} /> Chats ({sessions.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveHistoryTab('recommendations')}
                style={{
                  flex: 1,
                  padding: '0.75rem 0.5rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: 'none',
                  borderBottom: activeHistoryTab === 'recommendations' ? '2px solid var(--primary)' : '2px solid transparent',
                  backgroundColor: activeHistoryTab === 'recommendations' ? '#ffffff' : 'transparent',
                  color: activeHistoryTab === 'recommendations' ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                <Package size={14} /> Dossiers ({pastRecommendations.length})
              </button>
            </div>

            {/* Sidebar Content List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
              {activeHistoryTab === 'chats' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={handleNewChat}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'var(--primary-light)',
                      border: '1px dashed var(--primary-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.78rem',
                      color: 'var(--primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <Plus size={14} /> + New Consultation
                  </button>

                  {sessions.map((sess) => {
                    const isActive = sess.id === activeSessionId;
                    return (
                      <div
                        key={sess.id}
                        onClick={() => setActiveSessionId(sess.id)}
                        style={{
                          padding: '0.65rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isActive ? '#f0fdf4' : 'transparent',
                          border: isActive ? '1px solid var(--primary-border)' : '1px solid transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem',
                          transition: 'all var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: '0.8125rem',
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? 'var(--primary)' : 'var(--text-main)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '180px',
                            }}
                          >
                            {sess.title}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSession(sess.id, e)}
                            title="Delete this session"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-subtle)',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          <span>{sess.messages.length} messages</span>
                          <span>{sess.timestamp}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {pastRecommendations.length === 0 ? (
                    <div style={{ padding: '1.5rem 0.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      No past recommendation dossiers generated yet.
                    </div>
                  ) : (
                    pastRecommendations.map((rec) => (
                      <div
                        key={rec.id}
                        style={{
                          padding: '0.65rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                            {rec.commodityName}
                          </strong>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>
                            {rec.storageConditionSummary || rec.category}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--teal-700)', fontWeight: 600 }}>
                          {rec.primaryMaterialName}
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem' }}>
                          <Link
                            to={`/recommendation/${rec.id}`}
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1, padding: '0.2rem 0.4rem', fontSize: '0.7rem', justifyContent: 'center' }}
                          >
                            Dossier
                          </Link>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleDiscussRecommendation(rec)}
                            style={{ flex: 1, padding: '0.2rem 0.4rem', fontSize: '0.7rem', justifyContent: 'center' }}
                            title="Discuss this recommendation with PackBot"
                          >
                            Discuss
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MAIN CHAT CONVERSATION VIEW */}
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Chat Stream Header */}
          <div
            style={{
              padding: '0.95rem 1.5rem',
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-vivid)',
                  boxShadow: '0 0 0 3px var(--primary-focus)',
                }}
              />
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>
                {activeSession.title}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                PackBot BioTech Engine · SIH26236
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              backgroundColor: 'var(--bg-app)',
            }}
          >
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    justifyContent: isBot ? 'flex-start' : 'flex-end',
                    width: '100%',
                  }}
                >
                  {isBot && (
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 5px rgba(18, 84, 56, 0.25)',
                        marginTop: '2px',
                      }}
                    >
                      <Bot size={22} />
                    </div>
                  )}

                  <div
                    style={{
                      maxWidth: isBot ? '98%' : '78%',
                      width: isBot ? '100%' : 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isBot ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        padding: '1.25rem 1.5rem',
                        borderRadius: isBot
                          ? '4px var(--radius-lg) var(--radius-lg) var(--radius-lg)'
                          : 'var(--radius-lg) 4px var(--radius-lg) var(--radius-lg)',
                        backgroundColor: isBot ? '#ffffff' : 'var(--primary)',
                        color: isBot ? 'var(--text-main)' : '#ffffff',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        border: isBot ? '1px solid var(--border)' : 'none',
                        boxShadow: isBot ? '0 1px 4px rgba(0, 0, 0, 0.05)' : '0 2px 6px rgba(18, 84, 56, 0.3)',
                      }}
                    >
                      <MarkdownMessage content={msg.text} isBot={isBot} />

                      {/* Embedded Recommendation Card if provided */}
                      {msg.recommendationData && (
                        <div
                          style={{
                            marginTop: '1.25rem',
                            padding: '1.25rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: 'var(--radius-md)',
                            border: '1.5px solid var(--primary-border)',
                            color: 'var(--text-main)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '0.04em' }}>
                              <ShieldCheck size={16} /> PACKBOT VALIDATED SYSTEM
                            </span>
                            <Badge variant="teal">{msg.recommendationData.primaryMaterial.category}</Badge>
                          </div>

                          <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '0.65rem' }}>
                            {msg.recommendationData.primaryMaterial.name}
                          </div>

                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                              gap: '0.75rem',
                              fontSize: '0.825rem',
                              marginTop: '0.75rem',
                              backgroundColor: '#ffffff',
                              padding: '0.85rem 1rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)',
                            }}
                          >
                            <div>
                              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>Oxygen Barrier</span>
                              <strong>{msg.recommendationData.otr}</strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>Moisture Barrier</span>
                              <strong>{msg.recommendationData.wvtr}</strong>
                            </div>
                          </div>

                          {msg.recommendationData.map && (
                            <div style={{ marginTop: '0.75rem', fontSize: '0.825rem', color: 'var(--teal-800)', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#e0f2fe', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                              <Wind size={15} style={{ color: '#0284c7' }} />
                              <span>MAP Headspace: <strong>{msg.recommendationData.map}</strong></span>
                            </div>
                          )}

                          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {msg.recommendationData.resultId && (
                              <Link
                                to={`/recommendation/${msg.recommendationData.resultId}`}
                                className="btn btn-primary"
                                style={{ flex: 1, minWidth: '180px', fontSize: '0.825rem', padding: '0.55rem 1rem', justifyContent: 'center', fontWeight: 700 }}
                              >
                                <FileText size={15} /> Full Technical Dossier
                              </Link>
                            )}
                            <Link
                              to={`/compare?mat1=${msg.recommendationData.primaryMaterial.id}`}
                              className="btn btn-secondary"
                              style={{ flex: 1, minWidth: '180px', fontSize: '0.825rem', padding: '0.55rem 1rem', justifyContent: 'center', fontWeight: 600 }}
                            >
                              <Scale size={15} /> Compare Alternatives
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Interactive Quick Reply Option Buttons */}
                    {isBot && msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem', width: '100%' }}>
                        {msg.quickReplies.map((reply, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (reply.toLowerCase().includes('package another') || reply.toLowerCase().includes('new chat')) {
                                handleNewChat();
                              } else {
                                handleSendMessage(reply);
                              }
                            }}
                            style={{
                              backgroundColor: '#ffffff',
                              border: '1.5px solid #cbd5e1',
                              borderRadius: 'var(--radius-full)',
                              padding: '0.45rem 1rem',
                              fontSize: '0.8125rem',
                              color: 'var(--primary)',
                              fontWeight: 600,
                              cursor: 'pointer',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                              e.currentTarget.style.borderColor = 'var(--primary)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.borderColor = '#cbd5e1';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                            }}
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}

                    <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '0.3rem' }}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {!isBot && (
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <User size={20} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* ChatGPT-style AI Thinking & Reasoning Indicator */}
            {isTyping && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', width: '100%' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    boxShadow: '0 2px 8px rgba(18, 84, 56, 0.25)',
                  }}
                >
                  <Bot size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <AiThinkingBubble
                    commodityName={activeSession.commodityName}
                    isCompleted={false}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Fixed Input Bar */}
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border)',
              backgroundColor: '#ffffff',
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleNewChat}
                title="Start New Consultation"
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                <Plus size={16} /> New Chat
              </button>

              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Type food details (e.g. 'Packaging for fresh tomatoes, 14 days, 12°C')..."
                className="input-control"
                style={{
                  flex: 1,
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border)',
                  fontSize: '0.9rem',
                }}
                disabled={isTyping}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.875rem' }}
                disabled={!inputVal.trim() || isTyping}
              >
                <Send size={16} />
                <span>Send</span>
              </button>
            </form>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.45rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              <span>PackBot Decision Engine · Live Food Science Database</span>
              <span>Press Enter to send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

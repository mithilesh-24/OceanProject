import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Compass, Award, Play, CheckCircle2, Globe, HelpCircle, ArrowRight, Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { useRole } from '../context/RoleContext';
import { api } from '../services/apiClient';

export const StudentWorkspaceView: React.FC = () => {
  const { profile } = useRole();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const res = await api.getEducationalModules();
        if (res && res.modules) {
          setModules(res.modules);
        }
      } catch (err) {
        console.error('Failed to load educational modules:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  const handleStartQuiz = (mod: any) => {
    setSelectedModule(mod);
    setActiveQuizIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
  };

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header Banner */}
      <div className="welcome-banner">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[var(--primary)]" />
              Student Oceanography Learning Workspace
            </h1>
            <Badge variant="primary">Phase 18</Badge>
          </div>
          <p className="page-subtitle">
            Curated interactive oceanographic modules, guided 3D Cesium tours, and step-by-step physics simulations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/explorer">
            <Button variant="primary" size="sm" leftIcon={<Globe className="w-4 h-4" />}>
              Open 3D Learning Globe
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Course Progress</span>
            <CheckCircle2 className="w-4 h-4 text-emerald" />
          </div>
          <div className="metric-stat-value text-emerald">68%</div>
          <div className="metric-stat-sub"><span>2 of 3 core modules completed</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>3D Guided Tours</span>
            <Compass className="w-4 h-4 text-sky" />
          </div>
          <div className="metric-stat-value">6 Steps</div>
          <div className="metric-stat-sub"><span>Interactive camera fly-tos</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Explored Profiles</span>
            <BookOpen className="w-4 h-4 text-cyan" />
          </div>
          <div className="metric-stat-value">18 CTD Casts</div>
          <div className="metric-stat-sub"><span>Thermocline depth models</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Honor Badge</span>
            <Award className="w-4 h-4 text-amber" />
          </div>
          <div className="metric-stat-value text-amber">Hydrographic Explorer</div>
          <div className="metric-stat-sub"><span>Level 3 Certified</span></div>
        </div>
      </div>

      {/* Educational Modules Grid */}
      <div className="grid-cols-3">
        {modules.map((mod) => (
          <div key={mod.id} className="ui-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <span className={mod.difficulty_level === 'Beginner' ? 'badge-emerald' : mod.difficulty_level === 'Intermediate' ? 'badge-cyan' : 'badge-amber'}>
                  {mod.difficulty_level}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {mod.duration_minutes} Mins
                </span>
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>
                {mod.title}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {mod.subtitle}
              </p>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '10px' }}>
                {mod.summary}
              </p>

              {/* Key Takeaways */}
              <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Core Concepts
                </span>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(mod.key_takeaways || []).map((t: string, idx: number) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions: 3D Tour & Quiz */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '6px' }}>
              {mod.tour_steps && mod.tour_steps.length > 0 && (
                <Link
                  to={`/explorer?lat=${mod.tour_steps[0].target_lat}&lon=${mod.tour_steps[0].target_lon}&zoom=basin`}
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="primary" size="sm" leftIcon={<Globe className="w-3.5 h-3.5" />} className="w-full">
                    Start 3D Guided Tour ({mod.tour_steps.length} Steps)
                  </Button>
                </Link>
              )}

              {mod.quiz_questions && mod.quiz_questions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<HelpCircle className="w-3.5 h-3.5" />}
                  onClick={() => handleStartQuiz(mod)}
                  className="w-full"
                >
                  Take Knowledge Check ({mod.quiz_questions.length} Questions)
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Modal */}
      {selectedModule && selectedModule.quiz_questions && (
        <div className="ui-modal-backdrop" onClick={() => setSelectedModule(null)}>
          <div className="ui-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="ui-modal-header">
              <div>
                <h3 className="ui-modal-title">Knowledge Check: {selectedModule.title}</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Question {activeQuizIndex + 1} of {selectedModule.quiz_questions.length}
                </span>
              </div>
              <button
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setSelectedModule(null)}
              >
                ✕
              </button>
            </div>

            <div className="ui-modal-body space-y-4">
              <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {selectedModule.quiz_questions[activeQuizIndex].question}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedModule.quiz_questions[activeQuizIndex].options.map((opt: string, optIdx: number) => {
                  const isCorrect = optIdx === selectedModule.quiz_questions[activeQuizIndex].correct_index;
                  const isChosen = selectedOption === optIdx;

                  let bg = 'var(--bg-surface)';
                  let border = '1px solid var(--border)';
                  let text = 'var(--text-primary)';

                  if (showExplanation) {
                    if (isCorrect) {
                      bg = 'rgba(16, 185, 129, 0.15)';
                      border = '1px solid #10b981';
                      text = '#10b981';
                    } else if (isChosen) {
                      bg = 'rgba(244, 63, 94, 0.15)';
                      border = '1px solid #f43f5e';
                      text = '#f43f5e';
                    }
                  } else if (isChosen) {
                    bg = 'var(--primary-subtle)';
                    border = '1px solid var(--primary)';
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => {
                        if (!showExplanation) {
                          setSelectedOption(optIdx);
                        }
                      }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: bg,
                        border: border,
                        color: text,
                        cursor: showExplanation ? 'default' : 'pointer',
                        fontSize: '12.5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{opt}</span>
                      {showExplanation && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Banner */}
              {showExplanation && (
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Lightbulb className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                    <strong>Scientific Explanation:</strong> {selectedModule.quiz_questions[activeQuizIndex].explanation}
                  </p>
                </div>
              )}
            </div>

            <div className="ui-modal-footer">
              {!showExplanation ? (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={selectedOption === null}
                  onClick={() => setShowExplanation(true)}
                >
                  Submit Answer
                </Button>
              ) : activeQuizIndex < selectedModule.quiz_questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setActiveQuizIndex((prev) => prev + 1);
                    setSelectedOption(null);
                    setShowExplanation(false);
                  }}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Next Question
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={() => setSelectedModule(null)}>
                  Complete Quiz
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

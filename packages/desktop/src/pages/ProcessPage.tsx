import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTask } from '../hooks/useTask';

const STEPS = [
  { id: 'extract-audio', label: '音频抽取', icon: '♪', description: '从视频中分离音频轨道' },
  { id: 'transcribe', label: '语音转录', icon: '◈', description: 'AI 识别语音内容' },
  { id: 'segment-text', label: '文本分段', icon: '◇', description: '智能划分内容段落' },
  { id: 'score-segments', label: '内容评分', icon: '★', description: '评估片段精彩程度' },
  { id: 'select-highlights', label: '选择精华', icon: '◆', description: '提取高分片段' },
  { id: 'complete', label: '完成', icon: '✓', description: '准备预览' },
];

function ProcessPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const taskState = useTask(taskId ?? null);

  React.useEffect(() => {
    if (taskState.status === 'completed') {
      setTimeout(() => {
        navigate(`/preview/${taskId}`);
      }, 1000);
    }
  }, [taskState.status, taskId, navigate]);

  const currentStepIndex = STEPS.findIndex(s => s.id === taskState.currentStep);
  const progress = taskState.progress;

  const getStepStatus = (stepId: string) => {
    const stepIndex = STEPS.findIndex(s => s.id === stepId);
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="page-container">
      {/* Film grain overlay */}
      <div className="grain-overlay" />

      {/* Cinematic background atmosphere */}
      <div className="cinematic-bg" />

      {/* Header */}
      <header className="page-header">
        <div style={{ marginBottom: '16px' }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--accent-secondary)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: '600',
          }}>
            PROCESSING
          </span>
        </div>
        <h1 className="heading-large" style={{ marginBottom: '24px' }}>
          正在处理视频
        </h1>
        <p className="text-body">
          AI 正在分析你的视频内容，请稍候...
        </p>
      </header>

      {/* Progress Visualization */}
      <div className="page-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Main Progress Bar */}
        <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
          {/* Film strip decoration */}
          <div className="film-strip-decoration" />
          <div className="film-strip-decoration" style={{ bottom: 0, top: 'auto' }} />

          {/* Progress Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-lg)',
          }}>
            <div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-lg)',
                color: 'var(--text-primary)',
              }}>
                {STEPS[currentStepIndex]?.label || '处理中'}
              </span>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-tertiary)',
                marginTop: 'var(--space-xs)',
              }}>
                {STEPS[currentStepIndex]?.description || ''}
              </p>
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-2xl)',
              color: 'var(--accent-primary)',
            }}>
              {progress}%
            </div>
          </div>

          {/* Timeline Track */}
          <div className="timeline-track" style={{ marginBottom: 'var(--space-xl)' }}>
            <div
              className="timeline-progress"
              style={{
                width: `${progress}%`,
                animation: progress < 100 ? 'pulseGlow 2s ease-in-out infinite' : 'none',
              }}
            />
          </div>

          {/* Step Indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative',
          }}>
            {STEPS.map((step, index) => {
              const status = getStepStatus(step.id);
              return (
                <div
                  key={step.id}
                  className="stagger-item"
                  style={{
                    textAlign: 'center',
                    flex: 1,
                    opacity: status === 'pending' ? 0.4 : 1,
                  }}
                >
                  <div
                    className="timeline-step-marker"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--font-size-sm)',
                      background: status === 'completed'
                        ? 'var(--accent-success)'
                        : status === 'active'
                          ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                          : 'var(--bg-tertiary)',
                      border: status === 'pending'
                        ? '2px solid var(--glass-border)'
                        : 'none',
                      color: status === 'pending'
                        ? 'var(--text-tertiary)'
                        : 'var(--bg-primary)',
                      boxShadow: status === 'active'
                        ? 'var(--shadow-glow)'
                        : 'none',
                      margin: '0 auto',
                      transition: 'all var(--duration-normal) var(--ease-out)',
                      animation: status === 'active' ? 'pulseGlow 2s ease-in-out infinite' : 'none',
                    }}
                  >
                    {status === 'completed' ? '✓' : step.icon}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-xs)',
                    color: status === 'active'
                      ? 'var(--accent-primary)'
                      : status === 'completed'
                        ? 'var(--accent-success)'
                        : 'var(--text-tertiary)',
                    marginTop: 'var(--space-sm)',
                    display: 'block',
                  }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Step Detail Card */}
        <div className="glass-card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-lg)',
          }}>
            {/* Animated processing indicator */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'spin 2s linear infinite',
              boxShadow: 'var(--shadow-glow)',
            }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--bg-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>

            <div style={{ textAlign: 'left' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-md)',
                color: 'var(--text-primary)',
              }}>
                {STEPS[currentStepIndex]?.label}
              </span>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-tertiary)',
                marginTop: 'var(--space-xs)',
              }}>
                {taskState.status === 'failed' ? '处理失败' : '正在执行...'}
              </p>
            </div>
          </div>
        </div>

        {/* Error state */}
        {taskState.status === 'failed' && (
          <div style={{
            textAlign: 'center',
            marginTop: 'var(--space-xl)',
          }}>
            <button
              className="btn-secondary"
              onClick={() => navigate('/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              返回重试
            </button>
          </div>
        )}

        {/* Completion celebration */}
        {taskState.status === 'completed' && (
          <div
            className="glass-card success-glow"
            style={{
              padding: 'var(--space-xl)',
              textAlign: 'center',
              marginTop: 'var(--space-xl)',
              borderColor: 'var(--accent-success)',
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'var(--accent-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-lg)',
              animation: 'pulseGlow 2s ease-in-out infinite',
            }}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--bg-primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-xl)',
              color: 'var(--accent-success)',
            }}>
              处理完成!
            </span>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-tertiary)',
              marginTop: 'var(--space-md)',
            }}>
              正在跳转到预览页面...
            </p>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export default ProcessPage;
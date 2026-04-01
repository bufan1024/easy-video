import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { getSegments, exportVideo } from '../services/api';
import type { Segment } from '@easy-video/shared';

function ExportPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [exporting, setExporting] = useState(false);
  const [outputPath, setOutputPath] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);

  useEffect(() => {
    if (taskId) {
      loadSegments();
    }
  }, [taskId]);

  // Simulate progress during export
  useEffect(() => {
    if (exporting) {
      const interval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [exporting]);

  const loadSegments = async () => {
    try {
      const data = await getSegments(taskId!);
      setSegments(data);
    } catch (error) {
      message.error('加载片段失败');
    }
  };

  const handleExport = async () => {
    const selectedIds = segments.filter(s => s.selected).map(s => s.id);

    if (selectedIds.length === 0) {
      message.warning('没有选中的片段');
      return;
    }

    setExporting(true);
    setExportProgress(10);
    try {
      const result = await exportVideo(taskId!, selectedIds);
      setExportProgress(100);
      setTimeout(() => {
        setOutputPath(result.outputPath);
        message.success('导出完成');
      }, 500);
    } catch (error) {
      message.error('导出失败');
      setExporting(false);
      setExportProgress(0);
    }
  };

  const handleSaveAs = async () => {
    const savePath = await window.electronAPI.saveOutputFile(`output-${taskId}.mp4`);
    if (savePath) {
      message.success(`将保存到: ${savePath}`);
    }
  };

  const handleNewVideo = () => {
    navigate('/');
  };

  const selectedSegments = segments.filter(s => s.selected);
  const totalDuration = selectedSegments.reduce((acc, s) => acc + (s.endTime - s.startTime), 0);

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
            color: outputPath ? 'var(--accent-success)' : 'var(--accent-warning)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: '600',
          }}>
            {outputPath ? 'COMPLETE' : 'EXPORT'}
          </span>
        </div>
        <h1 className="heading-large" style={{ marginBottom: '24px' }}>
          {outputPath ? '导出完成' : '导出视频'}
        </h1>
        <p className="text-body">
          {outputPath
            ? '你的精华视频已生成完毕'
            : '将所选片段拼接为完整视频'}
        </p>
      </header>

      {/* Content */}
      <div className="page-content" style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Summary card */}
        <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
          {/* Film strip decoration */}
          <div className="film-strip-decoration" />
          <div className="film-strip-decoration" style={{ bottom: 0, top: 'auto' }} />

          {/* Summary stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            padding: 'var(--space-lg) 0',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-2xl)',
                color: 'var(--accent-primary)',
              }}>
                {selectedSegments.length}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-tertiary)',
                marginTop: 'var(--space-xs)',
              }}>
                片段数量
              </div>
            </div>

            <div style={{
              width: '1px',
              background: 'var(--glass-border)',
            }} />

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-2xl)',
                color: 'var(--accent-success)',
              }}>
                {totalDuration}s
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-tertiary)',
                marginTop: 'var(--space-xs)',
              }}>
                视频时长
              </div>
            </div>

            <div style={{
              width: '1px',
              background: 'var(--glass-border)',
            }} />

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-2xl)',
                color: 'var(--accent-secondary)',
              }}>
                {Math.round(selectedSegments.reduce((acc, s) => acc + s.score, 0) / selectedSegments.length || 0)}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-tertiary)',
                marginTop: 'var(--space-xs)',
              }}>
                平均评分
              </div>
            </div>
          </div>
        </div>

        {/* Export progress / completion */}
        {exporting && !outputPath ? (
          <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
            {/* Progress indicator */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                animation: 'spin 2s linear infinite',
                boxShadow: 'var(--shadow-glow)',
              }}>
                <svg
                  width="40"
                  height="40"
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
            </div>

            <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-xl)',
                color: 'var(--text-primary)',
              }}>
                正在导出...
              </span>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-tertiary)',
                marginTop: 'var(--space-md)',
              }}>
                正在拼接片段并生成最终视频
              </p>
            </div>

            {/* Progress bar */}
            <div className="timeline-track" style={{ height: '8px' }}>
              <div
                className="timeline-progress"
                style={{
                  width: `${exportProgress}%`,
                  borderRadius: '4px',
                }}
              />
            </div>

            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-lg)',
              color: 'var(--accent-primary)',
              textAlign: 'center',
              marginTop: 'var(--space-md)',
            }}>
              {Math.round(exportProgress)}%
            </div>
          </div>
        ) : outputPath ? (
          /* Completion celebration */
          <div
            className="glass-card success-glow"
            style={{
              padding: 'var(--space-xl)',
              borderColor: 'var(--accent-success)',
              textAlign: 'center',
            }}
          >
            {/* Success icon */}
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '24px',
              background: 'var(--accent-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-xl)',
              animation: 'pulseGlow 2s ease-in-out infinite',
              boxShadow: '0 0 60px rgba(0, 255, 136, 0.4)',
            }}>
              <svg
                width="50"
                height="50"
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
              fontSize: 'var(--font-size-2xl)',
              color: 'var(--accent-success)',
              marginBottom: 'var(--space-lg)',
              display: 'block',
            }}>
              导出成功!
            </span>

            {/* Output file info */}
            <div style={{
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              borderRadius: '12px',
              padding: 'var(--space-md) var(--space-lg)',
              margin: 'var(--space-lg) 0',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
            }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-success)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <div style={{ flex: 1 }}>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-tertiary)',
                  display: 'block',
                }}>
                  文件路径
                </span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--font-size-md)',
                  color: 'var(--text-primary)',
                  wordBreak: 'break-all',
                }}>
                  {outputPath}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: 'var(--space-md)',
              justifyContent: 'center',
              marginTop: 'var(--space-xl)',
            }}>
              <button
                className="btn-secondary"
                onClick={handleSaveAs}
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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                另存为
              </button>

              <button
                className="btn-primary"
                onClick={handleNewVideo}
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
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                处理新视频
              </button>
            </div>
          </div>
        ) : (
          /* Initial export prompt */
          <div className="glass-card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--accent-warning), var(--accent-tertiary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-lg)',
              boxShadow: '0 0 40px rgba(255, 170, 0, 0.3)',
            }}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--bg-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>

            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-lg)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-md)',
              display: 'block',
            }}>
              准备导出
            </span>

            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-md)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-xl)',
            }}>
              将拼接 {selectedSegments.length} 个精选片段，生成约 {totalDuration} 秒的精华视频
            </p>

            {selectedSegments.length === 0 ? (
              <div style={{
                background: 'rgba(255, 51, 102, 0.1)',
                border: '1px solid rgba(255, 51, 102, 0.3)',
                borderRadius: '12px',
                padding: 'var(--space-lg)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--accent-tertiary)',
                }}>
                  没有可导出的片段，请返回预览页选择片段
                </span>
                <button
                  className="btn-secondary"
                  onClick={() => navigate(`/preview/${taskId}`)}
                  style={{
                    marginTop: 'var(--space-md)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
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
                  返回预览
                </button>
              </div>
            ) : (
              <button
                className="btn-primary"
                onClick={handleExport}
                style={{
                  padding: '18px 48px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                开始导出
              </button>
            )}
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

export default ExportPage;
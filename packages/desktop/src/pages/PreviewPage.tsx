import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { getSegments, updateSegment } from '../services/api';
import type { Segment } from '@easy-video/shared';

function PreviewPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (taskId) {
      loadSegments();
    }
  }, [taskId]);

  const loadSegments = async () => {
    setLoading(true);
    try {
      const data = await getSegments(taskId!);
      setSegments(data);
    } catch (error) {
      message.error('加载片段失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (segmentId: string) => {
    await updateSegment(taskId!, segmentId, 'delete');
    loadSegments();
  };

  const handleLock = async (segmentId: string) => {
    await updateSegment(taskId!, segmentId, 'lock');
    loadSegments();
  };

  const handleUnlock = async (segmentId: string) => {
    await updateSegment(taskId!, segmentId, 'unlock');
    loadSegments();
  };

  const selectedCount = segments.filter(s => s.selected).length;
  const lockedCount = segments.filter(s => s.locked).length;
  const totalDuration = segments
    .filter(s => s.selected)
    .reduce((acc, s) => acc + (s.endTime - s.startTime), 0);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--accent-success)';
    if (score >= 60) return 'var(--accent-warning)';
    return 'var(--accent-tertiary)';
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
            color: 'var(--accent-success)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: '600',
          }}>
            PREVIEW
          </span>
        </div>
        <h1 className="heading-large" style={{ marginBottom: '24px' }}>
          片段预览
        </h1>

        {/* Stats summary */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-xl)',
          flexWrap: 'wrap',
        }}>
          <div className="stagger-item" style={{
            background: 'rgba(0, 255, 136, 0.1)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: '12px',
            padding: 'var(--space-md) var(--space-lg)',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-xl)',
              color: 'var(--accent-success)',
            }}>
              {selectedCount}
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-tertiary)',
              marginLeft: 'var(--space-sm)',
            }}>
              已选择
            </span>
          </div>

          <div className="stagger-item" style={{
            background: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            borderRadius: '12px',
            padding: 'var(--space-md) var(--space-lg)',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-xl)',
              color: 'var(--accent-secondary)',
            }}>
              {lockedCount}
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-tertiary)',
              marginLeft: 'var(--space-sm)',
            }}>
              已锁定
            </span>
          </div>

          <div className="stagger-item" style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '12px',
            padding: 'var(--space-md) var(--space-lg)',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-xl)',
              color: 'var(--accent-primary)',
            }}>
              {totalDuration}s
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-tertiary)',
              marginLeft: 'var(--space-sm)',
            }}>
              总时长
            </span>
          </div>
        </div>
      </header>

      {/* Segments List */}
      <div className="page-content">
        {loading ? (
          <div className="glass-card" style={{
            padding: 'var(--space-2xl)',
            textAlign: 'center',
          }}>
            <div className="loading-shimmer" style={{
              height: '60px',
              borderRadius: '12px',
              marginBottom: 'var(--space-lg)',
            }} />
            <div className="loading-shimmer" style={{
              height: '60px',
              borderRadius: '12px',
              marginBottom: 'var(--space-lg)',
            }} />
            <div className="loading-shimmer" style={{
              height: '60px',
              borderRadius: '12px',
            }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                className={`segment-card stagger-item ${segment.selected ? 'selected' : ''} ${segment.locked ? 'locked' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Film strip perforation effect */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  bottom: '8px',
                  left: '-4px',
                  width: '8px',
                  background: `repeating-linear-gradient(
                    0deg,
                    transparent 0px,
                    transparent 4px,
                    var(--bg-tertiary) 4px,
                    var(--bg-tertiary) 8px
                  )`,
                  borderRadius: '4px',
                }} />

                {/* Time display */}
                <div className="segment-time-display">
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--font-size-lg)',
                    color: 'var(--accent-primary)',
                  }}>
                    {segment.startTime}s
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-tertiary)',
                    marginTop: 'var(--space-xs)',
                  }}>
                    → {segment.endTime}s
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-muted)',
                    marginTop: 'var(--space-xs)',
                  }}>
                    {segment.endTime - segment.startTime}秒
                  </div>
                </div>

                {/* Content */}
                <div className="segment-content">
                  {/* Text preview */}
                  <div className="segment-text">
                    {segment.text}
                  </div>

                  {/* Meta info */}
                  <div className="segment-meta">
                    {/* Score */}
                    <div className="segment-score">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={getScoreColor(segment.score)}
                        stroke={getScoreColor(segment.score)}
                        strokeWidth="2"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span style={{ color: getScoreColor(segment.score) }}>
                        {segment.score}分
                      </span>
                    </div>

                    {/* Status tags */}
                    {segment.selected && (
                      <span className="tag-selected">已选</span>
                    )}
                    {segment.locked && (
                      <span className="tag-locked">锁定</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="segment-actions">
                  {/* Lock button */}
                  <button
                    className="btn-icon"
                    onClick={() => segment.locked ? handleUnlock(segment.id) : handleLock(segment.id)}
                    style={{
                      borderColor: segment.locked ? 'var(--accent-secondary)' : 'var(--glass-border)',
                      color: segment.locked ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={segment.locked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>{segment.locked ? '解锁' : '锁定'}</span>
                  </button>

                  {/* Delete button */}
                  <button
                    className="btn-danger"
                    disabled={segment.locked}
                    onClick={() => handleDelete(segment.id)}
                    style={{
                      opacity: segment.locked ? 0.4 : 1,
                      cursor: segment.locked ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ marginRight: 'var(--space-xs)' }}
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Export button */}
        <div className="glass-card" style={{
          padding: 'var(--space-lg)',
          marginTop: 'var(--space-xl)',
          textAlign: 'center',
        }}>
          <button
            className="btn-primary"
            onClick={() => navigate(`/export/${taskId}`)}
            disabled={selectedCount === 0}
            style={{
              opacity: selectedCount > 0 ? 1 : 0.5,
              cursor: selectedCount > 0 ? 'pointer' : 'not-allowed',
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
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
            <span>继续导出 ({selectedCount} 个片段)</span>
          </button>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-muted)',
            marginTop: 'var(--space-md)',
          }}>
            {selectedCount === 0
              ? '请至少选择一个片段才能导出'
              : `将导出 ${totalDuration} 秒的精华视频`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PreviewPage;
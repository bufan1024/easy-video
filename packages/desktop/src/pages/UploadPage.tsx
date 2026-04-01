import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { startProcess } from '../services/api';

function UploadPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleSelectFile = async () => {
    const filePath = await window.electronAPI.selectVideoFile();
    if (filePath) {
      setSelectedFile(filePath);
    }
  };

  const handleStartProcess = async () => {
    if (!selectedFile) {
      message.warning('请先选择视频文件');
      return;
    }

    setLoading(true);
    try {
      const { taskId } = await startProcess(selectedFile);
      message.success('处理已开始');
      navigate(`/process/${taskId}`);
    } catch (error) {
      message.error('启动处理失败');
    } finally {
      setLoading(false);
    }
  };

  const formatFileName = (path: string) => {
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    if (fileName.length > 40) {
      return fileName.substring(0, 40) + '...';
    }
    return fileName;
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
            color: 'var(--accent-primary)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: '600',
          }}>
            AI POWERED
          </span>
        </div>
        <h1 className="heading-xl" style={{ marginBottom: '24px' }}>
          <span style={{ color: 'var(--accent-primary)' }}>智能</span>
          剪辑
        </h1>
        <p className="text-body" style={{ maxWidth: '600px', margin: '0 auto' }}>
          上传你的视频，让 AI 自动识别精彩片段，一键提取精华内容
        </p>

        {/* Feature highlights */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-xl)',
          marginTop: 'var(--space-xl)',
          flexWrap: 'wrap',
        }}>
          <div className="stagger-item" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
            }} />
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
            }}>
              语音转录
            </span>
          </div>
          <div className="stagger-item" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-secondary)',
            }} />
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
            }}>
              智能评分
            </span>
          </div>
          <div className="stagger-item" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-tertiary)',
            }} />
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
            }}>
              自动剪辑
            </span>
          </div>
        </div>
      </header>

      {/* Upload Section */}
      <div className="page-content" style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Upload Zone */}
        <div
          className="glass-card"
          style={{
            padding: 'var(--space-3xl) var(--space-xl)',
            textAlign: 'center',
            cursor: 'pointer',
            position: 'relative',
          }}
          onClick={handleSelectFile}
          onMouseEnter={() => setIsDragActive(true)}
          onMouseLeave={() => setIsDragActive(false)}
        >
          {/* Film strip decoration */}
          <div className="film-strip-decoration" />
          <div className="film-strip-decoration" style={{ bottom: 0, top: 'auto' }} />

          {/* Corner accents */}
          <div className="corner-accent top-left" />
          <div className="corner-accent bottom-right" />

          {/* Upload Icon */}
          <div className="upload-zone-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'var(--bg-primary)' }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          {/* Upload Text */}
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-lg)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-md)',
          }}>
            选择视频文件
          </h3>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-lg)',
          }}>
            支持 MP4、MOV、AVI 等常见格式
          </p>

          {/* File info display */}
          {selectedFile && (
            <div style={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '12px',
              padding: 'var(--space-md) var(--space-lg)',
              marginTop: 'var(--space-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
            }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--accent-primary)' }}
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-md)',
                color: 'var(--text-primary)',
              }}>
                {formatFileName(selectedFile)}
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div style={{
          textAlign: 'center',
          marginTop: 'var(--space-xl)',
        }}>
          <button
            className="btn-primary"
            disabled={!selectedFile}
            onClick={handleStartProcess}
            style={{
              opacity: selectedFile ? 1 : 0.5,
              cursor: selectedFile ? 'pointer' : 'not-allowed',
              padding: '18px 48px',
              fontSize: 'var(--font-size-lg)',
              minWidth: '200px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-md)',
            }}
          >
            {loading ? (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: 'spin 1s linear infinite' }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span>处理中...</span>
              </>
            ) : (
              <>
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
                <span>开始处理</span>
              </>
            )}
          </button>
        </div>

        {/* Help hint */}
        <p style={{
          textAlign: 'center',
          marginTop: 'var(--space-lg)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-muted)',
        }}>
          AI 将自动分析视频内容，提取精彩片段
        </p>
      </div>

      {/* CSS for spinning animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default UploadPage;
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import UploadPage from './pages/UploadPage';
import ProcessPage from './pages/ProcessPage';
import PreviewPage from './pages/PreviewPage';
import ExportPage from './pages/ExportPage';

// Custom cinematic theme for Ant Design
const cinematicTheme = {
  token: {
    // Colors
    colorPrimary: '#00d4ff',
    colorSuccess: '#00ff88',
    colorWarning: '#ffaa00',
    colorError: '#ff3366',
    colorInfo: '#7c3aed',

    // Background
    colorBgContainer: 'rgba(18, 18, 26, 0.7)',
    colorBgElevated: '#222230',
    colorBgLayout: '#0a0a0f',

    // Text
    colorText: '#ffffff',
    colorTextSecondary: '#a0a0b8',
    colorTextTertiary: '#6a6a80',
    colorTextQuaternary: '#4a4a60',

    // Border
    colorBorder: 'rgba(255, 255, 255, 0.08)',
    colorBorderSecondary: 'rgba(255, 255, 255, 0.05)',

    // Fonts
    fontFamily: "'DM Sans', sans-serif",

    // Sizing
    borderRadius: 12,
    borderRadiusLG: 20,
    borderRadiusSM: 8,

    // Shadows
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
    boxShadowSecondary: '0 16px 64px rgba(0, 0, 0, 0.8)',
  },
  components: {
    Card: {
      borderRadiusLG: 20,
      boxShadowTertiary: '0 8px 32px rgba(0, 0, 0, 0.6)',
    },
    Button: {
      borderRadius: 12,
      controlHeight: 44,
      controlHeightLG: 52,
      controlHeightSM: 36,
      fontWeight: 600,
      primaryShadow: '0 0 40px rgba(0, 212, 255, 0.3)',
    },
    Progress: {
      defaultColor: '#00d4ff',
      remainingColor: '#1a1a25',
    },
    Tag: {
      borderRadiusSM: 6,
    },
    List: {
      colorSplit: 'rgba(255, 255, 255, 0.08)',
    },
    Typography: {
      fontFamily: "'DM Sans', sans-serif",
    },
    Message: {
      colorBg: 'rgba(18, 18, 26, 0.9)',
      colorText: '#ffffff',
    },
  },
};

function App() {
  return (
    <ConfigProvider theme={cinematicTheme} locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/process/:taskId" element={<ProcessPage />} />
          <Route path="/preview/:taskId" element={<PreviewPage />} />
          <Route path="/export/:taskId" element={<ExportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
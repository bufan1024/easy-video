import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import UploadPage from './pages/UploadPage';
import ProcessPage from './pages/ProcessPage';
import PreviewPage from './pages/PreviewPage';
import ExportPage from './pages/ExportPage';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
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
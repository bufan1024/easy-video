import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Typography, Space, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { startProcess } from '../services/api';

const { Title, Text } = Typography;

function UploadPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

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

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>AI 自动剪辑</Title>
      <Text type="secondary">选择一个视频文件，AI 将自动提取精华片段</Text>

      <Card style={{ marginTop: '24px', textAlign: 'center' }}>
        <Space direction="vertical" size="large">
          <Button
            type="primary"
            icon={<UploadOutlined />}
            size="large"
            onClick={handleSelectFile}
          >
            选择视频文件
          </Button>

          {selectedFile && (
            <Text>已选择: {selectedFile}</Text>
          )}

          <Button
            type="primary"
            size="large"
            disabled={!selectedFile}
            loading={loading}
            onClick={handleStartProcess}
          >
            开始处理
          </Button>
        </Space>
      </Card>
    </div>
  );
}

export default UploadPage;
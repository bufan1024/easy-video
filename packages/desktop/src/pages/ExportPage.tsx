import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Button, Space, message, Progress } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { getSegments, exportVideo } from '../services/api';
import type { Segment } from '@easy-video/shared';

const { Title, Text } = Typography;

function ExportPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [exporting, setExporting] = useState(false);
  const [outputPath, setOutputPath] = useState<string | null>(null);

  useEffect(() => {
    if (taskId) {
      loadSegments();
    }
  }, [taskId]);

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
    try {
      const result = await exportVideo(taskId!, selectedIds);
      setOutputPath(result.outputPath);
      message.success('导出完成');
    } catch (error) {
      message.error('导出失败');
    } finally {
      setExporting(false);
    }
  };

  const handleSaveAs = async () => {
    const savePath = await window.electronAPI.saveOutputFile(`output-${taskId}.mp4`);
    if (savePath) {
      message.success(`将保存到: ${savePath}`);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>导出视频</Title>

      <Card style={{ marginTop: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Text>将拼接 {segments.filter(s => s.selected).length} 个片段</Text>

          {exporting && <Progress percent={50} status="active" />}

          {outputPath ? (
            <Space>
              <Text>已导出到: {outputPath}</Text>
              <Button icon={<DownloadOutlined />} onClick={handleSaveAs}>
                另存为
              </Button>
            </Space>
          ) : (
            <Button
              type="primary"
              size="large"
              loading={exporting}
              onClick={handleExport}
            >
              开始导出
            </Button>
          )}
        </Space>
      </Card>
    </div>
  );
}

export default ExportPage;
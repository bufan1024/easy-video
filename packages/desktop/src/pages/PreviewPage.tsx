import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, List, Button, Space, Tag, message } from 'antd';
import { LockOutlined, DeleteOutlined } from '@ant-design/icons';
import { getSegments, updateSegment } from '../services/api';
import type { Segment } from '@easy-video/shared';

const { Title, Text } = Typography;

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

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}>片段预览</Title>
      <Text type="secondary">已选择 {selectedCount} 个片段</Text>

      <Card style={{ marginTop: '24px' }}>
        <List
          loading={loading}
          dataSource={segments}
          renderItem={(segment) => (
            <List.Item
              actions={[
                segment.locked ? (
                  <Button icon={<LockOutlined />} onClick={() => handleUnlock(segment.id)}>
                    解锁
                  </Button>
                ) : (
                  <Button icon={<LockOutlined />} onClick={() => handleLock(segment.id)}>
                    锁定
                  </Button>
                ),
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  disabled={segment.locked}
                  onClick={() => handleDelete(segment.id)}
                >
                  删除
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text>{segment.startTime}s - {segment.endTime}s</Text>
                    {segment.selected && <Tag color="green">已选</Tag>}
                    {segment.locked && <Tag color="blue">锁定</Tag>}
                  </Space>
                }
                description={`${segment.text.substring(0, 50)}... | 评分: ${segment.score}`}
              />
            </List.Item>
          )}
        />

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Button type="primary" size="large" onClick={() => navigate(`/export/${taskId}`)}>
            继续导出
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default PreviewPage;
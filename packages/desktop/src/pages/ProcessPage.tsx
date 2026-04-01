import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Progress, Typography, Space, Button } from 'antd';
import { useTask } from '../hooks/useTask';

const { Title, Text } = Typography;

const STEP_LABELS: Record<string, string> = {
  'extract-audio': '抽取音频',
  'transcribe': '语音转录',
  'segment-text': '文本分段',
  'score-segments': '内容评分',
  'select-highlights': '选择精华',
  'complete': '完成',
};

function ProcessPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const taskState = useTask(taskId ?? null);

  React.useEffect(() => {
    if (taskState.status === 'completed') {
      navigate(`/preview/${taskId}`);
    }
  }, [taskState.status, taskId, navigate]);

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>正在处理视频</Title>

      <Card style={{ marginTop: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text>当前步骤: {STEP_LABELS[taskState.currentStep] || taskState.currentStep}</Text>
          </div>

          <Progress
            percent={taskState.progress}
            status={taskState.status === 'failed' ? 'exception' : 'active'}
          />

          {taskState.status === 'failed' && (
            <Button type="primary" onClick={() => navigate('/')}>
              返回重试
            </Button>
          )}
        </Space>
      </Card>
    </div>
  );
}

export default ProcessPage;
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Select, Input, Button, message, Divider, Alert, AutoComplete } from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ApiOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import {
  getLLMConfig,
  saveLLMConfig,
  deleteLLMConfig,
  testLLMConfig,
  type LLMConfigRequest,
} from '../services/api';

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'], baseUrl: 'https://api.openai.com/v1' },
  { value: 'anthropic', label: 'Anthropic Claude', models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'], baseUrl: 'https://api.anthropic.com' },
  { value: 'zhipu', label: '智谱 GLM', models: ['glm-4', 'glm-4-flash', 'glm-3-turbo'], baseUrl: 'https://open.bigmodel.cn/api/paas/v4' },
  { value: 'qwen', label: '通义千问', models: ['qwen-turbo', 'qwen-plus', 'qwen-max'], baseUrl: 'https://dashscope.aliyuncs.com/api/v1' },
];

const API_KEY_LINKS: Record<string, string> = {
  openai: 'https://platform.openai.com/api-keys',
  anthropic: 'https://console.anthropic.com/settings/keys',
  zhipu: 'https://open.bigmodel.cn/api-keys',
  qwen: 'https://dashscope.console.aliyun.com/apiKey',
};

function SettingsPage() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState<string>('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1'); // 默认 OpenAI 地址
  const [isCustomBaseUrl, setIsCustomBaseUrl] = useState(false); // 标记是否用户自定义
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await getLLMConfig();
      if (config.configured) {
        const loadedProvider = config.provider || 'openai';
        setProvider(loadedProvider);
        setModel(config.model || '');
        if (config.baseUrl) {
          setBaseUrl(config.baseUrl);
          setIsCustomBaseUrl(true);
        } else {
          // 没有自定义 baseUrl，使用服务商默认值
          const providerConfig = PROVIDERS.find(p => p.value === loadedProvider);
          setBaseUrl(providerConfig?.baseUrl || '');
        }
        setConfigured(true);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      message.warning('请输入 API Key');
      return;
    }
    if (!model.trim()) {
      message.warning('请输入模型名称');
      return;
    }

    setLoading(true);
    try {
      // 判断 baseUrl 是否为默认值
      const defaultBaseUrl = currentProvider?.baseUrl;
      const isDefaultBaseUrl = baseUrl === defaultBaseUrl;

      const config: LLMConfigRequest = {
        provider,
        apiKey,
        model,
        // 只有非默认值才保存 baseUrl
        ...(baseUrl && !isDefaultBaseUrl && { baseUrl }),
      };
      await saveLLMConfig(config);
      message.success('配置保存成功');
      setConfigured(true);
      setApiKey('');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      message.warning('请输入 API Key');
      return;
    }
    if (!model.trim()) {
      message.warning('请输入模型名称');
      return;
    }

    setTesting(true);
    try {
      // 判断 baseUrl 是否为默认值
      const defaultBaseUrl = currentProvider?.baseUrl;
      const isDefaultBaseUrl = baseUrl === defaultBaseUrl;

      const config: LLMConfigRequest = {
        provider,
        apiKey,
        model,
        ...(baseUrl && !isDefaultBaseUrl && { baseUrl }),
      };
      const result = await testLLMConfig(config);
      if (result.success) {
        message.success('连接测试成功');
      } else {
        message.error(result.error || '连接失败');
      }
    } catch (error) {
      message.error('测试失败');
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteLLMConfig();
      message.success('配置已删除');
      setConfigured(false);
      setProvider('openai');
      setModel('');
      setApiKey('');
      setBaseUrl(PROVIDERS[0].baseUrl); // 重置为 OpenAI 默认地址
      setIsCustomBaseUrl(false);
    } catch (error) {
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  const currentProvider = PROVIDERS.find(p => p.value === provider);

  return (
    <div className="page-container">
      <div className="grain-overlay" />
      <div className="cinematic-bg" />

      {/* Header with Navigation */}
      <header className="page-header" style={{ marginBottom: 'var(--space-xl)' }}>
        {/* Navigation Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-lg)',
          padding: 'var(--space-md) var(--space-lg)',
          background: 'var(--glass-bg)',
          borderRadius: '16px',
          border: '1px solid var(--glass-border)',
        }}>
          <Button
            type="text"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            style={{ color: 'var(--text-secondary)' }}
          >
            首页
          </Button>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-lg)',
            color: 'var(--text-primary)',
          }}>
            <SettingOutlined style={{ marginRight: '8px', color: 'var(--accent-primary)' }} />
            设置
          </span>
        </div>

        <h1 className="heading-large" style={{ marginBottom: 'var(--space-md)' }}>
          <span style={{ color: 'var(--accent-primary)' }}>LLM</span> 配置
        </h1>
        <p className="text-body">
          配置大语言模型 API，启用智能视频片段评分功能
        </p>
      </header>

      {/* Settings Content */}
      <div className="page-content" style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Status Alert */}
        {configured && (
          <Alert
            type="success"
            message="已配置 LLM"
            description={`当前使用 ${currentProvider?.label} - ${model}`}
            showIcon
            style={{ marginBottom: 24, background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)' }}
          />
        )}

        {/* Config Form Card */}
        <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
          {/* Provider Selection */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-sm)',
            }}>
              服务商
            </label>
            <Select
              value={provider}
              onChange={(val) => {
                setProvider(val);
                setModel('');
                // 切换服务商时更新默认地址（除非用户已自定义）
                if (!isCustomBaseUrl) {
                  const newProvider = PROVIDERS.find(p => p.value === val);
                  setBaseUrl(newProvider?.baseUrl || '');
                }
              }}
              style={{ width: '100%' }}
              options={PROVIDERS.map(p => ({ value: p.value, label: p.label }))}
            />
          </div>

          {/* API Key Input */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-sm)',
            }}>
              API Key
            </label>
            <Input.Password
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={configured ? '已保存，输入新值将覆盖' : '请输入 API Key'}
            />
            <a
              href={API_KEY_LINKS[provider]}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                marginTop: 'var(--space-sm)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--accent-primary)',
              }}
            >
              <ApiOutlined style={{ marginRight: '4px' }} />
              获取 API Key
            </a>
          </div>

          {/* Model Selection */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-sm)',
            }}>
              模型
            </label>
            <AutoComplete
              value={model}
              onChange={setModel}
              style={{ width: '100%' }}
              placeholder="选择或输入模型名称"
              options={currentProvider?.models.map(m => ({ value: m, label: m })) || []}
            />
            <span style={{
              display: 'block',
              marginTop: 'var(--space-sm)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-tertiary)',
            }}>
              可从预设列表选择，或自定义输入模型名称
            </span>
          </div>

          {/* Custom Base URL */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-sm)',
            }}>
              API 地址
            </label>
            <Input
              value={baseUrl}
              onChange={(e) => {
                setBaseUrl(e.target.value);
                setIsCustomBaseUrl(true);
              }}
              placeholder={currentProvider?.baseUrl || '自定义 API 地址'}
            />
            <span style={{
              display: 'block',
              marginTop: 'var(--space-sm)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-tertiary)',
            }}>
              默认: {currentProvider?.baseUrl}，可自定义代理或私有部署地址
            </span>
          </div>

          <Divider style={{ borderColor: 'var(--glass-border)' }} />

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleTest}
              loading={testing}
            >
              测试连接
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              保存配置
            </Button>
            {configured && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                loading={loading}
              >
                删除配置
              </Button>
            )}
          </div>
        </div>

        {/* Help Info */}
        <div className="glass-card" style={{ padding: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
          <h3 style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-md)',
          }}>
            使用说明
          </h3>
          <ul style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
            paddingLeft: 'var(--space-lg)',
          }}>
            <li>模型名称可自定义输入，支持服务商提供的新模型</li>
            <li>API Key 将加密存储在本地，不会上传到任何服务器</li>
            <li>配置完成后，处理视频时将自动调用 LLM 进行片段评分</li>
            <li>如未配置或配置错误，系统将使用模拟评分作为备用方案</li>
            <li>自定义 API 地址可用于代理访问或私有部署</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
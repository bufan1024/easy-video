import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import type { LLMConfig } from '@easy-video/shared';

const CONFIG_DIR = path.join(os.homedir(), '.easy-video');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const SALT_FILE = path.join(CONFIG_DIR, '.salt');

// 生成或加载加密 salt
async function getSalt(): Promise<Buffer> {
  try {
    return await fs.readFile(SALT_FILE);
  } catch {
    const salt = crypto.randomBytes(32);
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    await fs.writeFile(SALT_FILE, salt);
    return salt;
  }
}

// 加密函数 - AES-256-CBC
function encrypt(text: string, salt: Buffer): string {
  const key = crypto.createHash('sha256').update(salt).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// 解密函数
function decrypt(encryptedText: string, salt: Buffer): string {
  const key = crypto.createHash('sha256').update(salt).digest();
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 加载 LLM 配置
export async function loadLLMConfig(): Promise<LLMConfig | null> {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(data);
    if (config.encryptedApiKey) {
      const salt = await getSalt();
      config.apiKey = decrypt(config.encryptedApiKey, salt);
    }
    return config;
  } catch {
    return null;
  }
}

// 保存 LLM 配置
export async function saveLLMConfig(config: LLMConfig): Promise<void> {
  const salt = await getSalt();
  const configToSave = {
    provider: config.provider,
    model: config.model,
    baseUrl: config.baseUrl,
    lastUpdated: config.lastUpdated,
    encryptedApiKey: encrypt(config.apiKey, salt),
  };
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.writeFile(CONFIG_FILE, JSON.stringify(configToSave, null, 2));
}

// 删除 LLM 配置
export async function deleteLLMConfig(): Promise<void> {
  try {
    await fs.unlink(CONFIG_FILE);
  } catch {
    // 文件不存在时忽略
  }
}
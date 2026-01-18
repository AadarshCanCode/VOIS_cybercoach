import { AdminStatus } from '../models/adminModel.js';

export const ALLOWLIST = [
  'testphp.vulnweb.com',
  'juice-shop.herokuapp.com',
  'juice-shop.github.io',
  'badssl.com'
] as const;

export interface TargetValidationResult {
  isValid: boolean;
  status: number;
  message: string;
  url?: string;
}

export interface ProxySuccessResult {
  status: number;
  headers: Record<string, string>;
  body: Buffer;
}

export type ProxyRequestResult = { error: TargetValidationResult } | ProxySuccessResult;

export function getAdminStatus(): AdminStatus {
  return new AdminStatus({ allowlist: [...ALLOWLIST] });
}

export function validateTargetUrl(target: unknown): TargetValidationResult {
  if (typeof target !== 'string' || target.trim().length === 0) {
    return {
      isValid: false,
      status: 400,
      message: 'Missing url param'
    };
  }

  try {
    const urlObj = new URL(target);

    if (!ALLOWLIST.includes(urlObj.hostname as typeof ALLOWLIST[number])) {
      return {
        isValid: false,
        status: 403,
        message: 'Domain not allowed'
      };
    }

    return {
      isValid: true,
      status: 200,
      message: 'ok',
      url: urlObj.toString()
    };
  } catch (error) {
    return {
      isValid: false,
      status: 400,
      message: error instanceof Error ? error.message : 'Invalid URL'
    };
  }
}

export async function proxyRequest(targetUrl: unknown): Promise<ProxyRequestResult> {
  const validation = validateTargetUrl(targetUrl);
  if (!validation.isValid || !validation.url) {
    return { error: validation };
  }

  const upstream = await fetch(validation.url, { redirect: 'follow' });

  const headers: Record<string, string> = {};
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === 'x-frame-options' || lower === 'content-security-policy') {
      return;
    }

    headers[key] = value;
  });

  headers['X-Frame-Options'] = '';
  headers['Content-Security-Policy'] = "frame-ancestors 'self' *";

  const bodyBuffer = Buffer.from(await upstream.arrayBuffer());

  return {
    status: upstream.status,
    headers,
    body: bodyBuffer
  };
}

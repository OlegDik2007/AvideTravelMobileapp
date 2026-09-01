import type { Agent, Service } from './types';

export const API_BASE = 'https://avide.travel';

const timeoutFetch = async (url: string, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
  } finally {
    clearTimeout(timer);
  }
};

export async function getServices(): Promise<Service[]> {
  const response = await timeoutFetch(`${API_BASE}/api/services`);
  if (!response.ok) throw new Error(`Services request failed (${response.status})`);
  const json = await response.json();
  if (Array.isArray(json)) return json;
  if (json?.success && Array.isArray(json.services)) return json.services;
  if (Array.isArray(json?.services)) return json.services;
  return [];
}

export async function getAgents(): Promise<Agent[]> {
  const response = await timeoutFetch(`${API_BASE}/api/agents`);
  if (!response.ok) throw new Error(`Agents request failed (${response.status})`);
  const json = await response.json();
  if (Array.isArray(json)) return json;
  if (json?.success && Array.isArray(json.agents)) return json.agents;
  if (Array.isArray(json?.agents)) return json.agents;
  return [];
}

export function normalizeImages(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'url' in item) return String((item as { url?: unknown }).url ?? '');
        return '';
      })
      .map(normalizeUrl)
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        return normalizeImages(JSON.parse(trimmed));
      } catch {
        // continue with plain string handling
      }
    }
    if (trimmed.includes(',')) return trimmed.split(',').map(normalizeUrl).filter(Boolean);
    return [normalizeUrl(trimmed)].filter(Boolean);
  }
  if (typeof value === 'object' && value && 'url' in value) {
    return [normalizeUrl(String((value as { url?: unknown }).url ?? ''))].filter(Boolean);
  }
  return [];
}

function normalizeUrl(input: string): string {
  let url = input.trim().replace(/^['"]|['"]$/g, '');
  if (url.startsWith('//')) url = `https:${url}`;
  if (url.startsWith('http://')) url = url.replace('http://', 'https://');
  if (url.startsWith('/')) url = `${API_BASE}${url}`;
  return url;
}

export function priceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value === null || value === undefined) return null;
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatPrice(service: Service): string {
  const value = priceNumber(service.effective_price ?? service.my_price);
  if (value === null) return service.price_note?.trim() || 'Ask agent for price';
  const currency = service.currency || 'USD';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
  }
}

export function serviceWebUrl(service: Service): string {
  const slug = service.slug || String(service.title || 'deal')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${API_BASE}/services/${service.id}-${slug}`;
}

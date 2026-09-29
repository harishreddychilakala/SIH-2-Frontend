import type { Commodity, CommodityCategory } from '../types';

import { API_BASE } from './apiConfig';

export const commodityService = {
  async getAll(): Promise<Commodity[]> {
    const res = await fetch(`${API_BASE}/commodities`);
    if (!res.ok) throw new Error('Failed to fetch commodities');
    const data = await res.json();
    return data.items;
  },

  async getById(id: string): Promise<Commodity | null> {
    try {
      const res = await fetch(`${API_BASE}/commodities/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getByCategory(category: CommodityCategory): Promise<Commodity[]> {
    const res = await fetch(`${API_BASE}/commodities?category=${encodeURIComponent(category)}`);
    if (!res.ok) throw new Error('Failed to fetch commodities by category');
    const data = await res.json();
    return data.items;
  },

  async search(query: string, category?: string): Promise<Commodity[]> {
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (category && category !== 'All') params.set('category', category);

    const res = await fetch(`${API_BASE}/commodities?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to search commodities');
    const data = await res.json();
    return data.items;
  },

  async create(commodityData: Omit<Commodity, 'id'>): Promise<Commodity> {
    const res = await fetch(`${API_BASE}/commodities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commodityData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create commodity' }));
      throw new Error(err.detail || 'Failed to create commodity');
    }
    return await res.json();
  },

  async update(id: string, commodityData: Partial<Commodity>): Promise<Commodity> {
    const res = await fetch(`${API_BASE}/commodities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commodityData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update commodity' }));
      throw new Error(err.detail || 'Failed to update commodity');
    }
    return await res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/commodities/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete commodity' }));
      throw new Error(err.detail || 'Failed to delete commodity');
    }
  },

  async researchCommodityWithAI(commodityName: string, category?: string): Promise<Commodity> {
    const res = await fetch(`${API_BASE}/commodities/ai-research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commodityName, category }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'AI commodity research failed' }));
      throw new Error(err.detail || 'AI commodity research failed');
    }
    return await res.json();
  },
};

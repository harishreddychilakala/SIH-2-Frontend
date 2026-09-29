import type {
  RecommendationInput,
  RecommendationResult,
  RecommendationHistoryItem,
  ProductResearchResult,
} from '../types';

import { API_BASE } from './apiConfig';


export const recommendationService = {
  async generateRecommendation(input: RecommendationInput): Promise<RecommendationResult> {
    try {
      const res = await fetch(`${API_BASE}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...input,
          commodityId: input.commodityId || '',
        }),
      });
      if (res.ok) {
        return await res.json();
      }
      const errData = await res.json().catch(() => null);
      let errMsg = 'Recommendation processing failed';
      if (errData) {
        if (typeof errData.detail === 'string') {
          errMsg = errData.detail;
        } else if (Array.isArray(errData.detail)) {
          errMsg = errData.detail.map((d: any) => `${d.loc?.slice(-1)[0] || 'field'}: ${d.msg}`).join(', ');
        }
      }
      throw new Error(errMsg);
    } catch (e: any) {
      throw new Error(e.message || 'Recommendation service unavailable');
    }
  },

  async getById(id: string): Promise<RecommendationResult | null> {
    try {
      const res = await fetch(`${API_BASE}/recommendations/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getHistory(): Promise<RecommendationHistoryItem[]> {
    const res = await fetch(`${API_BASE}/history`);
    if (!res.ok) throw new Error('Failed to fetch history');
    const data = await res.json();
    return data.items;
  },

  async deleteHistoryItem(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete history item');
  },

  async clearAllHistory(): Promise<void> {
    const res = await fetch(`${API_BASE}/history`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear history');
  },

  async researchProduct(productName: string, userCategory?: string): Promise<ProductResearchResult> {
    try {
      const res = await fetch(`${API_BASE}/ai/research-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, userCategory }),
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Product research failed');
    } catch (e: any) {
      throw new Error(e.message || 'Product research service unavailable');
    }
  },
};

import type { PackagingMaterial, MaterialCategory } from '../types';

import { API_BASE } from './apiConfig';

export const materialService = {
  async getAll(): Promise<PackagingMaterial[]> {
    const res = await fetch(`${API_BASE}/materials`);
    if (!res.ok) throw new Error('Failed to fetch materials');
    const data = await res.json();
    return data.items;
  },

  async getCategories(): Promise<import('../types').MaterialCategoryItem[]> {
    const res = await fetch(`${API_BASE}/materials/categories`);
    if (!res.ok) throw new Error('Failed to fetch material categories');
    return await res.json();
  },

  async getById(id: string): Promise<PackagingMaterial | null> {
    try {
      const res = await fetch(`${API_BASE}/materials/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getByCategory(category: MaterialCategory): Promise<PackagingMaterial[]> {
    const res = await fetch(`${API_BASE}/materials?category=${encodeURIComponent(category)}`);
    if (!res.ok) throw new Error('Failed to fetch materials by category');
    const data = await res.json();
    return data.items;
  },

  async compare(ids: string[]): Promise<PackagingMaterial[]> {
    const all = await this.getAll();
    return all.filter((m) => ids.includes(m.id));
  },

  async search(query: string, category?: string, sustainabilityType?: string): Promise<PackagingMaterial[]> {
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (category && category !== 'All') params.set('category', category);

    const res = await fetch(`${API_BASE}/materials?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to search materials');
    const data = await res.json();

    let items: PackagingMaterial[] = data.items;
    if (sustainabilityType && sustainabilityType !== 'All') {
      items = items.filter((m) => m.sustainability.type === sustainabilityType);
    }

    return items;
  },

  async create(materialData: Omit<PackagingMaterial, 'id'>): Promise<PackagingMaterial> {
    const res = await fetch(`${API_BASE}/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(materialData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create packaging material' }));
      throw new Error(err.detail || 'Failed to create packaging material');
    }
    return await res.json();
  },

  async update(id: string, materialData: Partial<PackagingMaterial>): Promise<PackagingMaterial> {
    const res = await fetch(`${API_BASE}/materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(materialData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update packaging material' }));
      throw new Error(err.detail || 'Failed to update packaging material');
    }
    return await res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/materials/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete packaging material' }));
      throw new Error(err.detail || 'Failed to delete packaging material');
    }
  },

  async researchMaterialWithAI(materialName: string, category?: string): Promise<PackagingMaterial> {
    const res = await fetch(`${API_BASE}/materials/ai-research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materialName, category }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to research packaging material with AI' }));
      throw new Error(err.detail || 'Failed to research packaging material with AI');
    }
    return await res.json();
  },
};

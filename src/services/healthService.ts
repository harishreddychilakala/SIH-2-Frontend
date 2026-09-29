import type { SystemHealthInfo } from '../types';

import { API_BASE } from './apiConfig';

export const healthService = {
  async getHealth(): Promise<SystemHealthInfo> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return {
        status: 'degraded',
        service: 'PackSmart AI Backend Engine',
        version: '1.0.0',
        database: 'offline',
        databaseProvider: 'Neon Cloud PostgreSQL',
        sihProblemStatement: 'SIH26236',
        framework: 'FastAPI (Python Async)',
      };
    }
  },
};

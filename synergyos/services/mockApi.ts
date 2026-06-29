import { dataProvider } from '@/services';

// Backward-compatible facade. Existing modules can keep importing mockApi
// while the app migrates to domain services from services/index.ts.
export const mockApi = dataProvider;

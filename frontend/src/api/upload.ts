import { api } from './client';

export const uploadApi = {
  upload: (file: File, type: string, entityId?: string, entityType?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    if (entityId) formData.append('entityId', entityId);
    if (entityType) formData.append('entityType', entityType);
    return api.post<{ imageUrl: string; filename: string }>(`/upload/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

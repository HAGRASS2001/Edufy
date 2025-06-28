import api from './api';
import { 
  Announcement, 
  CreateAnnouncementRequest, 
  UpdateAnnouncementRequest, 
  AnnouncementFilters 
} from '../types/announcement';

export const announcementService = {
  // Get all announcements with optional filters
  getAnnouncements: async (filters?: AnnouncementFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const response = await api.get<Announcement[]>(`/announcements?${params.toString()}`);
    return response.data;
  },

  // Create new announcement
  createAnnouncement: async (data: CreateAnnouncementRequest) => {
    const response = await api.post<Announcement>('/announcements', data);
    return response.data;
  },

  // Update announcement
  updateAnnouncement: async (id: string, data: UpdateAnnouncementRequest) => {
    const response = await api.put<Announcement>(`/announcements/${id}`, data);
    return response.data;
  },

  // Delete announcement
  deleteAnnouncement: async (id: string) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  }
}; 
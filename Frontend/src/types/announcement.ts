export interface Announcement {
  _id: string;
  title: string;
  content: string;
  instructorName: string;
  course: string;
  priority: 'low' | 'medium' | 'high';
  type: 'general' | 'assignment' | 'exam' | 'event' | 'deadline';
  isActive: boolean;
  semester: string;
  attachments: Attachment[];
  tags: string[];
  publishDate: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  instructorName: string;
  course: string;
  priority: 'low' | 'medium' | 'high';
  type: 'general' | 'assignment' | 'exam' | 'event' | 'deadline';
  semester: string;
  tags: string[];
  publishDate: string;
  expiryDate?: string;
}

export interface UpdateAnnouncementRequest extends Partial<CreateAnnouncementRequest> {
  isActive?: boolean;
}

export interface AnnouncementFilters {
  priority?: string;
  type?: string;
  course?: string;
  semester?: string;
  search?: string;
} 
import api from './axios';

export const getDashboard = () => api.get('/dashboard');

export const adminGetAllClubs = () => api.get('/clubs');
export const adminGetClubById = (id) => api.get(`/clubs/${id}`);
export const adminCreateClub = (data) => api.post('/clubs', data);
export const adminUpdateClub = (id, data) => api.put(`/clubs/${id}`, data);
export const adminDeleteClub = (id) => api.delete(`/clubs/${id}`);
export const adminGetClubEvents = (clubId, page = 0) =>
  api.get('/clubs/events', { params: { id: clubId, page, size: 10 } });
export const adminGetClubMembers = (clubId, search = '', page = 0) =>
  api.get(`/clubs/${clubId}/members`, { params: { search, page, size: 10 } });

export const adminGetEvents = (search = '', page = 0) =>
  api.get('/events', { params: { search, page, size: 10, sort: 'startTime,desc' } });
export const adminDeleteEvent = (eventId) => api.delete(`/events/${eventId}`);
export const adminChangeEventStatus = (eventId, status) =>
  api.patch(`/events/${eventId}/status`, { status });

export const toggleLeadership = (clubId, userId) =>
  api.patch(`/memberships/${clubId}/${userId}`);

export const adminGetAllStudents = (department = '', search = '', page = 0) =>
  api.get('/students', { params: { department: department || undefined, search: search || undefined, page, size: 10 } });

export const adminDeleteStudent = (userId) => api.delete(`/students/${userId}`);

export const adminGetEventRegistrations = (eventId) => api.get('/event-registrations', { params: { eventId } });

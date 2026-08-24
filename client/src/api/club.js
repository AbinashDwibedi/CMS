import api from './axios';

export const getAllClubs = () => api.get('/clubs');

export const getClubById = (id) => api.get(`/clubs/${id}`);

export const getClubEvents = (clubId, page = 0) =>
  api.get('/clubs/events', { params: { id: clubId, page, size: 10, sort: 'startTime,asc' } });

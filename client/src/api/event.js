import api from './axios';

export const getEvents = (page = 0) =>
  api.get('/events', { params: { page, size: 10, sort: 'startTime,asc' } });

export const registerForEvent = (eventId) =>
  api.post(`/events/${eventId}/register`);

export const cancelRegistration = (eventId) =>
  api.delete(`/events/${eventId}/register`);

export const createEvent = (data) =>
  api.post('/events', data);

export const deleteEvent = (eventId) =>
  api.delete(`/events/${eventId}`);

export const changeEventStatus = (eventId, status) =>
  api.patch(`/events/${eventId}/status`, { status });

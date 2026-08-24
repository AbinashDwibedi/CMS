import api from './axios';

export const getMyMembership = (clubId) =>
  api.get('/memberships', { params: { clubId } });

export const joinClub = (clubId) =>
  api.post(`/memberships/${clubId}`);

export const leaveClub = (clubId) =>
  api.delete(`/memberships/${clubId}`);

import api from './axios';

export const createStudentProfile = (data) =>
  api.post('/students', data);

export const getMyProfile = () =>
  api.get('/students/me');

export const updateMyProfile = (data) =>
  api.post('/students/me', data);

export const getStudentByRoll = (roll) =>
  api.get(`/students/${roll}`);

export const getAllStudents = (params) =>
  api.get('/students', { params });

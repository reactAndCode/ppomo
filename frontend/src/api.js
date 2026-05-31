import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000';

export const getSubjects = async () => {
  const response = await axios.get(`${API_URL}/subjects`);
  return response.data;
};

export const createSubject = async (name) => {
  const response = await axios.post(`${API_URL}/subjects`, { name });
  return response.data;
};

export const deleteSubject = async (id) => {
  const response = await axios.delete(`${API_URL}/subjects/${id}`);
  return response.data;
};

export const getSessions = async (subject_id = null, range = 'all') => {
  let url = `${API_URL}/sessions?range=${range}`;
  if (subject_id) {
    url += `&subject_id=${subject_id}`;
  }
  const response = await axios.get(url);
  return response.data;
};

export const createSession = async (subject_id, duration) => {
  const response = await axios.post(`${API_URL}/sessions`, { subject_id, duration });
  return response.data;
};

export const deleteSession = async (id) => {
  const response = await axios.delete(`${API_URL}/sessions/${id}`);
  return response.data;
};

export const getStats = async () => {
  const response = await axios.get(`${API_URL}/stats`);
  return response.data;
};

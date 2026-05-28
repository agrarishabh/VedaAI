import axios from 'axios';
import type { Assignment, AssignmentFormData } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export async function createAssignment(data: AssignmentFormData): Promise<Assignment> {
  const response = await api.post<{ success: boolean; data: Assignment }>('/api/assignments', data);
  return response.data.data;
}

export async function getAssignment(id: string): Promise<Assignment> {
  const response = await api.get<{ success: boolean; data: Assignment }>(`/api/assignments/${id}`);
  return response.data.data;
}

export async function getAllAssignments(): Promise<Assignment[]> {
  const response = await api.get<{ success: boolean; data: Assignment[] }>('/api/assignments');
  return response.data.data;
}

export async function regenerateAssignment(id: string): Promise<Assignment> {
  const response = await api.post<{ success: boolean; data: Assignment }>(`/api/assignments/${id}/regenerate`);
  return response.data.data;
}

export default api;

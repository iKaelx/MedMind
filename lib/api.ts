import axios, { AxiosInstance, AxiosError } from "axios";
import Cookie from "js-cookie";
import { useAuthStore } from "./store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = Cookie.get("auth_token");
  if (token) {
    config.params = config.params || {};
    config.params.token = token;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  async register(username: string, email: string, password: string) {
    const response = await apiClient.post("/api/auth/register", {
      username,
      email,
      password,
    });
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await apiClient.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  async getCurrentUser(token: string) {
    const response = await apiClient.get("/api/auth/me", {
      params: { token },
    });
    return response.data;
  },
};

// Patients API
export const patientsAPI = {
  async createPatient(data: any, token: string) {
    const response = await apiClient.post("/api/patients/", data, {
      params: { token },
    });
    return response.data;
  },

  async getPatients(token: string) {
    const response = await apiClient.get("/api/patients/", {
      params: { token },
    });
    return response.data;
  },

  async getPatient(id: number, token: string) {
    const response = await apiClient.get(`/api/patients/${id}`, {
      params: { token },
    });
    return response.data;
  },

  async updatePatient(id: number, data: any, token: string) {
    const response = await apiClient.put(`/api/patients/${id}`, data, {
      params: { token },
    });
    return response.data;
  },

  async deletePatient(id: number, token: string) {
    const response = await apiClient.delete(`/api/patients/${id}`, {
      params: { token },
    });
    return response.data;
  },
};

// Consultations API
export const consultationsAPI = {
  async createConsultation(data: any, token: string) {
    const response = await apiClient.post("/api/consultations/", data, {
      params: { token },
    });
    return response.data;
  },

  async getConsultations(token: string, patientId?: number) {
    const params: any = { token };
    if (patientId) params.patient_id = patientId;
    const response = await apiClient.get("/api/consultations/", { params });
    return response.data;
  },

  async getConsultation(id: number, token: string) {
    const response = await apiClient.get(`/api/consultations/${id}`, {
      params: { token },
    });
    return response.data;
  },

  async updateConsultation(id: number, data: any, token: string) {
    const response = await apiClient.put(`/api/consultations/${id}`, data, {
      params: { token },
    });
    return response.data;
  },

  async deleteConsultation(id: number, token: string) {
    const response = await apiClient.delete(`/api/consultations/${id}`, {
      params: { token },
    });
    return response.data;
  },
};

// Prescriptions API
export const prescriptionsAPI = {
  async createPrescription(data: any, token: string) {
    const response = await apiClient.post("/api/prescriptions/", data, {
      params: { token },
    });
    return response.data;
  },

  async getPrescriptions(token: string, patientId?: number) {
    const params: any = { token };
    if (patientId) params.patient_id = patientId;
    const response = await apiClient.get("/api/prescriptions/", { params });
    return response.data;
  },

  async getPrescription(id: number, token: string) {
    const response = await apiClient.get(`/api/prescriptions/${id}`, {
      params: { token },
    });
    return response.data;
  },

  async updatePrescription(id: number, data: any, token: string) {
    const response = await apiClient.put(`/api/prescriptions/${id}`, data, {
      params: { token },
    });
    return response.data;
  },

  async deletePrescription(id: number, token: string) {
    const response = await apiClient.delete(`/api/prescriptions/${id}`, {
      params: { token },
    });
    return response.data;
  },
};

// AI Service API
export const aiAPI = {
  async summarizePatient(patientId: number, token: string) {
    const response = await apiClient.post(
      "/api/ai/summarize",
      { patient_id: patientId },
      { params: { token } }
    );
    return response.data;
  },

  async queryPatient(patientId: number, question: string, token: string) {
    const response = await apiClient.post(
      "/api/ai/query",
      { patient_id: patientId, question },
      { params: { token } }
    );
    return response.data;
  },
};

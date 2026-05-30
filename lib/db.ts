import Dexie, { type Table } from "dexie";

export interface Patient {
  id?: number;
  full_name: string;
  birth_date: string;
  gender: string;
  phone: string;
  email: string;
  allergies: string;
  chronic_diseases: string;
  doctor_id: number;
  created_at: string;
  updated_at: string;
  sync_status: "pending" | "synced" | "deleted";
}

export interface Consultation {
  id?: number;
  patient_id: number;
  doctor_id: number;
  symptoms: string;
  diagnosis: string;
  notes: string;
  consultation_date: string;
  created_at: string;
  updated_at: string;
  sync_status: "pending" | "synced" | "deleted";
}

export interface Prescription {
  id?: number;
  patient_id: number;
  doctor_id: number;
  medication: string;
  dosage: string;
  instructions: string;
  duration: string;
  created_at: string;
  updated_at: string;
  sync_status: "pending" | "synced" | "deleted";
}

export interface SyncQueue {
  id?: number;
  table_name: string;
  record_id: number;
  action: "create" | "update" | "delete";
  data: Record<string, any>;
  created_at: string;
  synced: boolean;
}

export class DoctorDB extends Dexie {
  patients!: Table<Patient>;
  consultations!: Table<Consultation>;
  prescriptions!: Table<Prescription>;
  sync_queue!: Table<SyncQueue>;

  constructor() {
    super("DoctorAssistantDB");
    this.version(1).stores({
      patients: "++id, doctor_id, sync_status",
      consultations: "++id, patient_id, doctor_id, sync_status",
      prescriptions: "++id, patient_id, doctor_id, sync_status",
      sync_queue: "++id, table_name, synced, created_at",
    });
  }
}

export const db = new DoctorDB();

// Helper functions for local database operations
export const PatientDB = {
  async addPatient(patient: Omit<Patient, "id">) {
    return db.patients.add(patient as any);
  },

  async getPatient(id: number) {
    return db.patients.get(id);
  },

  async getPatientsByDoctor(doctorId: number) {
    return db.patients.where("doctor_id").equals(doctorId).toArray();
  },

  async updatePatient(id: number, data: Partial<Patient>) {
    return db.patients.update(id, { ...data, updated_at: new Date().toISOString() });
  },

  async deletePatient(id: number) {
    return db.patients.update(id, { sync_status: "deleted" });
  },

  async getAllPatients() {
    return db.patients.toArray();
  },
};

export const ConsultationDB = {
  async addConsultation(consultation: Omit<Consultation, "id">) {
    return db.consultations.add(consultation as any);
  },

  async getConsultation(id: number) {
    return db.consultations.get(id);
  },

  async getConsultationsByPatient(patientId: number) {
    return db.consultations.where("patient_id").equals(patientId).toArray();
  },

  async getConsultationsByDoctor(doctorId: number) {
    return db.consultations.where("doctor_id").equals(doctorId).toArray();
  },

  async updateConsultation(id: number, data: Partial<Consultation>) {
    return db.consultations.update(id, { ...data, updated_at: new Date().toISOString() });
  },

  async deleteConsultation(id: number) {
    return db.consultations.update(id, { sync_status: "deleted" });
  },

  async getAllConsultations() {
    return db.consultations.toArray();
  },
};

export const PrescriptionDB = {
  async addPrescription(prescription: Omit<Prescription, "id">) {
    return db.prescriptions.add(prescription as any);
  },

  async getPrescription(id: number) {
    return db.prescriptions.get(id);
  },

  async getPrescriptionsByPatient(patientId: number) {
    return db.prescriptions.where("patient_id").equals(patientId).toArray();
  },

  async getPrescriptionsByDoctor(doctorId: number) {
    return db.prescriptions.where("doctor_id").equals(doctorId).toArray();
  },

  async updatePrescription(id: number, data: Partial<Prescription>) {
    return db.prescriptions.update(id, { ...data, updated_at: new Date().toISOString() });
  },

  async deletePrescription(id: number) {
    return db.prescriptions.update(id, { sync_status: "deleted" });
  },

  async getAllPrescriptions() {
    return db.prescriptions.toArray();
  },
};

export const SyncQueueDB = {
  async addToQueue(item: Omit<SyncQueue, "id">) {
    return db.sync_queue.add(item as any);
  },

  async getPendingItems() {
    return db.sync_queue.where("synced").equals(false).toArray();
  },

  async markAsSynced(id: number) {
    return db.sync_queue.update(id, { synced: true });
  },

  async clearSyncedItems() {
    return db.sync_queue.where("synced").equals(true).delete();
  },

  async getQueueItems() {
    return db.sync_queue.toArray();
  },
};

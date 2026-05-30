"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { ConsultationDB, Consultation, PatientDB } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ConsultationsPage() {
  const { user, token } = useAuthStore();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    symptoms: "",
    diagnosis: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const consultData = await ConsultationDB.getConsultationsByDoctor(user?.id || 0);
      const patientData = await PatientDB.getPatientsByDoctor(user?.id || 0);
      setConsultations(consultData);
      setPatients(patientData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.patient_id) return;

    try {
      const newConsultation: Consultation = {
        patient_id: parseInt(formData.patient_id),
        doctor_id: user.id,
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        notes: formData.notes,
        consultation_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: "pending",
      };

      const id = await ConsultationDB.addConsultation(newConsultation);
      setConsultations([...consultations, { ...newConsultation, id }]);
      setFormData({ patient_id: "", symptoms: "", diagnosis: "", notes: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding consultation:", error);
    }
  };

  const getPatientName = (patientId: number) => {
    return patients.find(p => p.id === patientId)?.full_name || "Unknown Patient";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Consultations</h1>
          <p className="text-muted-foreground">Record and manage patient consultations</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          ➕ New Consultation
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Record Consultation</h2>
          <form onSubmit={handleAddConsultation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Patient
              </label>
              <select
                value={formData.patient_id}
                onChange={(e) =>
                  setFormData({ ...formData, patient_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                required
              >
                <option value="">Select a patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Symptoms
              </label>
              <Input
                value={formData.symptoms}
                onChange={(e) =>
                  setFormData({ ...formData, symptoms: e.target.value })
                }
                placeholder="Patient symptoms"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Diagnosis
              </label>
              <Input
                value={formData.diagnosis}
                onChange={(e) =>
                  setFormData({ ...formData, diagnosis: e.target.value })
                }
                placeholder="Your diagnosis"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes
              </label>
              <Input
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save Consultation
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : consultations.length === 0 ? (
        <Card className="p-6 border border-border text-center">
          <p className="text-muted-foreground">No consultations recorded yet</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {consultations.map((consultation) => (
            <Card key={consultation.id} className="p-4 border border-border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {getPatientName(consultation.patient_id)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(consultation.consultation_date).toLocaleDateString()}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm"><span className="font-medium">Symptoms:</span> {consultation.symptoms}</p>
                    <p className="text-sm"><span className="font-medium">Diagnosis:</span> {consultation.diagnosis}</p>
                    {consultation.notes && (
                      <p className="text-sm"><span className="font-medium">Notes:</span> {consultation.notes}</p>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    consultation.sync_status === "synced"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {consultation.sync_status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

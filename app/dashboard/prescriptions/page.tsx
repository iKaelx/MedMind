"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { PrescriptionDB, Prescription, PatientDB } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PrescriptionsPage() {
  const { user, token } = useAuthStore();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    medication: "",
    dosage: "",
    instructions: "",
    duration: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const rxData = await PrescriptionDB.getPrescriptionsByDoctor(user?.id || 0);
      const patientData = await PatientDB.getPatientsByDoctor(user?.id || 0);
      setPrescriptions(rxData);
      setPatients(patientData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.patient_id) return;

    try {
      const newPrescription: Prescription = {
        patient_id: parseInt(formData.patient_id),
        doctor_id: user.id,
        medication: formData.medication,
        dosage: formData.dosage,
        instructions: formData.instructions,
        duration: formData.duration,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: "pending",
      };

      const id = await PrescriptionDB.addPrescription(newPrescription);
      setPrescriptions([...prescriptions, { ...newPrescription, id }]);
      setFormData({
        patient_id: "",
        medication: "",
        dosage: "",
        instructions: "",
        duration: "",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding prescription:", error);
    }
  };

  const getPatientName = (patientId: number) => {
    return patients.find(p => p.id === patientId)?.full_name || "Unknown Patient";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Prescriptions</h1>
          <p className="text-muted-foreground">Manage patient prescriptions and medications</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          ➕ New Prescription
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Create Prescription</h2>
          <form onSubmit={handleAddPrescription} className="space-y-4">
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
                Medication
              </label>
              <Input
                value={formData.medication}
                onChange={(e) =>
                  setFormData({ ...formData, medication: e.target.value })
                }
                placeholder="e.g., Amoxicillin"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Dosage
              </label>
              <Input
                value={formData.dosage}
                onChange={(e) =>
                  setFormData({ ...formData, dosage: e.target.value })
                }
                placeholder="e.g., 500mg, 3 times daily"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Instructions
              </label>
              <Input
                value={formData.instructions}
                onChange={(e) =>
                  setFormData({ ...formData, instructions: e.target.value })
                }
                placeholder="Special instructions for patient"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Duration
              </label>
              <Input
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="e.g., 7 days, 2 weeks"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save Prescription
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
      ) : prescriptions.length === 0 ? (
        <Card className="p-6 border border-border text-center">
          <p className="text-muted-foreground">No prescriptions created yet</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id} className="p-4 border border-border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {prescription.medication}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {getPatientName(prescription.patient_id)}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm"><span className="font-medium">Dosage:</span> {prescription.dosage}</p>
                    <p className="text-sm"><span className="font-medium">Instructions:</span> {prescription.instructions}</p>
                    <p className="text-sm"><span className="font-medium">Duration:</span> {prescription.duration}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    prescription.sync_status === "synced"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {prescription.sync_status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

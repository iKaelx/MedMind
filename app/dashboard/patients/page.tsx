"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { PatientDB, Patient } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PatientsPage() {
  const { user, token } = useAuthStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    gender: "",
    phone: "",
    email: "",
    allergies: "",
    chronic_diseases: "",
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await PatientDB.getPatientsByDoctor(user?.id || 0);
      setPatients(data);
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const newPatient: Patient = {
        ...formData,
        doctor_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: "pending",
      };

      const id = await PatientDB.addPatient(newPatient);
      setPatients([...patients, { ...newPatient, id }]);
      setFormData({
        full_name: "",
        birth_date: "",
        gender: "",
        phone: "",
        email: "",
        allergies: "",
        chronic_diseases: "",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding patient:", error);
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Patients</h1>
          <p className="text-muted-foreground">Manage your patient records</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          ➕ Add Patient
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            New Patient
          </h2>
          <form onSubmit={handleAddPatient} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Date of Birth
              </label>
              <Input
                type="date"
                value={formData.birth_date}
                onChange={(e) =>
                  setFormData({ ...formData, birth_date: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                required
              >
                <option value="">Select...</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Allergies
              </label>
              <Input
                value={formData.allergies}
                onChange={(e) =>
                  setFormData({ ...formData, allergies: e.target.value })
                }
                placeholder="Enter allergies if any"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Chronic Diseases
              </label>
              <Input
                value={formData.chronic_diseases}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    chronic_diseases: e.target.value,
                  })
                }
                placeholder="Enter chronic diseases if any"
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save Patient
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

      <div>
        <Input
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : filteredPatients.length === 0 ? (
          <Card className="p-6 border border-border text-center">
            <p className="text-muted-foreground">No patients found</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPatients.map((patient) => (
              <Card
                key={patient.id}
                className="p-4 border border-border hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {patient.full_name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      DOB: {patient.birth_date} • {patient.gender}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {patient.phone} • {patient.email}
                    </p>
                    {patient.allergies && (
                      <p className="text-xs text-red-600 mt-2">
                        Allergies: {patient.allergies}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        patient.sync_status === "synced"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {patient.sync_status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

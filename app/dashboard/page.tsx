"use client";

import { useEffect, useState } from "react";
import { useAuthStore, useSyncStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PatientDB, ConsultationDB, PrescriptionDB } from "@/lib/db";
import Link from "next/link";

export default function DashboardPage() {
  const { user, token } = useAuthStore();
  const { lastSyncTime, pendingChanges, setSyncStatus } = useSyncStore();
  const [stats, setStats] = useState({
    totalPatients: 0,
    recentConsultations: 0,
    activePrescriptions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const patients = await PatientDB.getAllPatients();
        const consultations = await ConsultationDB.getAllConsultations();
        const prescriptions = await PrescriptionDB.getAllPrescriptions();

        setStats({
          totalPatients: patients.length,
          recentConsultations: consultations.length,
          activePrescriptions: prescriptions.length,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const handleSync = async () => {
    setSyncStatus("syncing");
    // Sync logic will be implemented in Phase 5
    setTimeout(() => setSyncStatus("success"), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your medical practice
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSync}
            variant="outline"
            size="sm"
            className="text-sm"
          >
            🔄 Sync Data
          </Button>
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm" className="text-sm">
              ⚙️ Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Last sync: </span>
            <span className="text-foreground font-medium">
              {lastSyncTime || "Never"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Pending changes: </span>
            <span className="text-foreground font-medium">{pendingChanges}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            ✓ Offline mode enabled
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="text-3xl font-bold text-primary mt-2">
                {loading ? "..." : stats.totalPatients}
              </p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Recent Consultations
              </p>
              <p className="text-3xl font-bold text-primary mt-2">
                {loading ? "..." : stats.recentConsultations}
              </p>
            </div>
            <span className="text-3xl">📋</span>
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Active Prescriptions
              </p>
              <p className="text-3xl font-bold text-primary mt-2">
                {loading ? "..." : stats.activePrescriptions}
              </p>
            </div>
            <span className="text-3xl">💊</span>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 border border-border">
          <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/dashboard/patients?new=true">
              <Button variant="outline" className="w-full justify-start">
                ➕ Add New Patient
              </Button>
            </Link>
            <Link href="/dashboard/consultations?new=true">
              <Button variant="outline" className="w-full justify-start">
                📝 Record Consultation
              </Button>
            </Link>
            <Link href="/dashboard/prescriptions?new=true">
              <Button variant="outline" className="w-full justify-start">
                💊 Create Prescription
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <h3 className="font-semibold text-foreground mb-4">
            System Information
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="text-green-600">✓ Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Offline Mode</span>
              <span className="text-foreground">Enabled</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">AI Service</span>
              <span className="text-foreground">Ready</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

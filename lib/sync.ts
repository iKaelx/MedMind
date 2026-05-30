import { SyncQueueDB, PatientDB, ConsultationDB, PrescriptionDB } from "./db";
import { patientsAPI, consultationsAPI, prescriptionsAPI } from "./api";
import { useSyncStore } from "./store";

export class SyncEngine {
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL = 30000; // 30 seconds

  async start(token: string) {
    console.log("[v0] Sync engine started");
    await this.sync(token);

    this.syncInterval = setInterval(async () => {
      await this.sync(token);
    }, this.SYNC_INTERVAL);
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log("[v0] Sync engine stopped");
  }

  async sync(token: string) {
    const syncStore = useSyncStore.getState();
    const pendingItems = await SyncQueueDB.getPendingItems();

    if (pendingItems.length === 0) {
      return; // Nothing to sync
    }

    syncStore.setIsSyncing(true);
    syncStore.setSyncStatus("syncing");

    try {
      for (const item of pendingItems) {
        try {
          await this.syncItem(item, token);
          await SyncQueueDB.markAsSynced(item.id!);
        } catch (error: any) {
          console.error(`[v0] Failed to sync ${item.table_name}:`, error);
          // Continue with next item, don't throw
        }
      }

      syncStore.setLastSyncTime(new Date().toLocaleTimeString());
      syncStore.setSyncStatus("success");
      syncStore.setPendingChanges(0);

      // Clear synced items
      await SyncQueueDB.clearSyncedItems();
    } catch (error) {
      console.error("[v0] Sync error:", error);
      syncStore.setSyncStatus("error");
    } finally {
      syncStore.setIsSyncing(false);
    }
  }

  private async syncItem(item: any, token: string) {
    const { table_name, record_id, action, data } = item;

    switch (table_name) {
      case "patients":
        await this.syncPatient(record_id, action, data, token);
        break;
      case "consultations":
        await this.syncConsultation(record_id, action, data, token);
        break;
      case "prescriptions":
        await this.syncPrescription(record_id, action, data, token);
        break;
    }
  }

  private async syncPatient(id: number, action: string, data: any, token: string) {
    switch (action) {
      case "create":
        const createdPatient = await patientsAPI.createPatient(data, token);
        // Update local record with server ID
        await PatientDB.updatePatient(id, {
          id: createdPatient.id,
          sync_status: "synced",
        });
        break;
      case "update":
        await patientsAPI.updatePatient(id, data, token);
        await PatientDB.updatePatient(id, { sync_status: "synced" });
        break;
      case "delete":
        await patientsAPI.deletePatient(id, token);
        break;
    }
  }

  private async syncConsultation(id: number, action: string, data: any, token: string) {
    switch (action) {
      case "create":
        const createdConsult = await consultationsAPI.createConsultation(data, token);
        await ConsultationDB.updateConsultation(id, {
          id: createdConsult.id,
          sync_status: "synced",
        });
        break;
      case "update":
        await consultationsAPI.updateConsultation(id, data, token);
        await ConsultationDB.updateConsultation(id, { sync_status: "synced" });
        break;
      case "delete":
        await consultationsAPI.deleteConsultation(id, token);
        break;
    }
  }

  private async syncPrescription(id: number, action: string, data: any, token: string) {
    switch (action) {
      case "create":
        const createdRx = await prescriptionsAPI.createPrescription(data, token);
        await PrescriptionDB.updatePrescription(id, {
          id: createdRx.id,
          sync_status: "synced",
        });
        break;
      case "update":
        await prescriptionsAPI.updatePrescription(id, data, token);
        await PrescriptionDB.updatePrescription(id, { sync_status: "synced" });
        break;
      case "delete":
        await prescriptionsAPI.deletePrescription(id, token);
        break;
    }
  }
}

export const syncEngine = new SyncEngine();

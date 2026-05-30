"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [apiKey, setApiKey] = useState("");
  const [databaseUrl, setDatabaseUrl] = useState("");
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(30);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem("doctor_settings");
    if (saved) {
      const settings = JSON.parse(saved);
      setApiKey(settings.apiKey || "");
      setDatabaseUrl(settings.databaseUrl || "");
      setAutoSync(settings.autoSync ?? true);
      setSyncInterval(settings.syncInterval || 30);
    }
  }, []);

  const handleSaveSettings = () => {
    const settings = {
      apiKey,
      databaseUrl,
      autoSync,
      syncInterval,
    };
    localStorage.setItem("doctor_settings", JSON.stringify(settings));
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings</p>
      </div>

      {/* Profile Settings */}
      <Card className="p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Username
            </label>
            <Input value={user?.username} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <Input value={user?.email} disabled />
          </div>
        </div>
      </Card>

      {/* API Settings */}
      <Card className="p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">API Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Backend API URL
            </label>
            <Input
              value={databaseUrl}
              onChange={(e) => setDatabaseUrl(e.target.value)}
              placeholder="http://localhost:8000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Groq API Key
            </label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Groq API key"
            />
          </div>
        </div>
      </Card>

      {/* Sync Settings */}
      <Card className="p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Sync Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Enable Auto Sync
            </label>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="w-4 h-4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Sync Interval (seconds)
            </label>
            <Input
              type="number"
              min="10"
              max="300"
              value={syncInterval}
              onChange={(e) => setSyncInterval(parseInt(e.target.value))}
            />
          </div>
        </div>
      </Card>

      {/* Backup & Restore */}
      <Card className="p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Backup & Restore</h2>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            ⬇️ Backup Data
          </Button>
          <Button variant="outline" className="w-full justify-start">
            ⬆️ Restore Data
          </Button>
        </div>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSaveSettings}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Save Settings
      </Button>
    </div>
  );
}

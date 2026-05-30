"use client";

import { Card } from "@/components/ui/card";

export default function AIAssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Assistant</h1>
        <p className="text-muted-foreground">Get AI-powered insights about your patients</p>
      </div>
      <Card className="p-8 border border-border text-center">
        <p className="text-muted-foreground text-lg">
          AI assistant features coming soon...
        </p>
      </Card>
    </div>
  );
}

import { Card } from '@/components/ui/Card';
import { Form, FormField, FormRow } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function SettingsPage() {
  return (
    <Card
      title="Settings"
      subtitle="Global defaults for operations, notifications, and profile preferences."
      action={<StatusBadge label="Configuration" tone="amber" />}
    >
      <Form title="Workspace profile" description="Example form primitives from the global design system.">
        <FormRow columns={2}>
          <FormField label="Workspace name">
            <Input placeholder="Synergy Fulfillment" />
          </FormField>
          <FormField label="Default locale">
            <Input placeholder="en-US" />
          </FormField>
        </FormRow>
        <FormRow columns={2}>
          <FormField label="Operations email" hint="Used for system alerts and escalations.">
            <Input type="email" placeholder="ops@synergyos.com" />
          </FormField>
          <FormField label="Daily cut-off time">
            <Input type="time" defaultValue="16:00" />
          </FormField>
        </FormRow>
        <div className="flex gap-3">
          <Button type="button">Save changes</Button>
          <Button type="button" variant="ghost">
            Cancel
          </Button>
        </div>
      </Form>
    </Card>
  );
}

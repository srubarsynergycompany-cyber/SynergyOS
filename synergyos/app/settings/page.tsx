import { Card } from '@/components/ui/Card';
import { Form, FormField, FormRow } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function SettingsPage() {
  return (
    <Card
      title="Nastavení"
      subtitle="Globální výchozí hodnoty pro provoz, upozornění a profil."
      action={<StatusBadge label="Konfigurace" tone="amber" />}
    >
      <Form title="Profil workspace" description="Ukázka formulářových prvků z globálního design systému.">
        <FormRow columns={2}>
          <FormField label="Název workspace">
            <Input placeholder="Synergy Fulfillment" />
          </FormField>
          <FormField label="Výchozí jazyk">
            <Input placeholder="cs-CZ" />
          </FormField>
        </FormRow>
        <FormRow columns={2}>
          <FormField label="Provozní email" hint="Používá se pro systémová upozornění a eskalace.">
            <Input type="email" placeholder="ops@synergyos.com" />
          </FormField>
          <FormField label="Denní uzávěrka">
            <Input type="time" defaultValue="16:00" />
          </FormField>
        </FormRow>
        <div className="flex gap-3">
          <Button type="button">Uložit změny</Button>
          <Button type="button" variant="ghost">
            Zrušit
          </Button>
        </div>
      </Form>
    </Card>
  );
}

import { Card } from '@/components/ui/Card';
import { Form, FormField, FormRow } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleSettingsPage({ params }: LocalePageProps) {
  const locale = await getLocaleFromParams(params);
  const dictionary = getDictionary(locale);

  return (
    <Card
      title={dictionary.modules.settings.title}
      subtitle={dictionary.modules.settings.subtitle}
      action={<StatusBadge label={dictionary.modules.settings.badge} tone="amber" />}
    >
      <Form title={dictionary.modules.settings.form.title} description={dictionary.modules.settings.form.description}>
        <FormRow columns={2}>
          <FormField label={dictionary.modules.settings.form.workspaceName}>
            <Input placeholder={dictionary.modules.settings.form.workspaceNamePlaceholder} />
          </FormField>
          <FormField label={dictionary.modules.settings.form.defaultLocale}>
            <Input placeholder={dictionary.modules.settings.form.defaultLocalePlaceholder} />
          </FormField>
        </FormRow>
        <FormRow columns={2}>
          <FormField label={dictionary.modules.settings.form.operationsEmail} hint={dictionary.modules.settings.form.operationsEmailHint}>
            <Input type="email" placeholder={dictionary.modules.settings.form.operationsEmailPlaceholder} />
          </FormField>
          <FormField label={dictionary.modules.settings.form.dailyCutoffTime}>
            <Input type="time" defaultValue="16:00" />
          </FormField>
        </FormRow>
        <div className="flex gap-3">
          <Button type="button">{dictionary.modules.settings.form.saveChanges}</Button>
          <Button type="button" variant="ghost">
            {dictionary.modules.settings.form.cancel}
          </Button>
        </div>
      </Form>
    </Card>
  );
}

export const dynamicParams = false;

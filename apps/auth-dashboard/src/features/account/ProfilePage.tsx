import { useEffect, useState, type FormEvent } from 'react';
import { Button, Card, CardBody, Notice, TextInput, useResource } from '@ecom/ui';
import { apiErrorMessage, profileApi, type Profile } from '@ecom/utils';

const EMPTY = { givenName: '', familyName: '', phoneNumber: '', preferredLocale: '', timeZone: '' };

export function ProfilePage() {
  const profile = useResource(() => profileApi.get(), []);
  const [form, setForm] = useState(EMPTY);
  const [version, setVersion] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const adopt = (data: Profile) => {
    setForm({
      givenName: data.givenName ?? '',
      familyName: data.familyName ?? '',
      phoneNumber: data.phoneNumber ?? '',
      preferredLocale: data.preferredLocale ?? '',
      timeZone: data.timeZone ?? '',
    });
    setVersion(data.version);
  };

  useEffect(() => {
    if (profile.data) adopt(profile.data);
  }, [profile.data]);

  const field = (name: keyof typeof EMPTY, label: string, placeholder?: string) => (
    <TextInput
      label={label}
      placeholder={placeholder}
      value={form[name]}
      onChange={(event) => {
        setSaved(false);
        setForm({ ...form, [name]: event.target.value });
      }}
    />
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      adopt(
        await profileApi.update({
          givenName: form.givenName || null,
          familyName: form.familyName || null,
          phoneNumber: form.phoneNumber || null,
          preferredLocale: form.preferredLocale || null,
          timeZone: form.timeZone || null,
          version,
        }),
      );
      setSaved(true);
    } catch (failure) {
      setError(apiErrorMessage(failure, 'Could not save your profile.'));
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardBody className="space-y-4 px-6 py-6">
        <h1 className="text-xl font-bold text-slate-900">Profile</h1>
        <Notice>{profile.error ? apiErrorMessage(profile.error) : error}</Notice>
        <Notice tone="success">{saved ? 'Saved.' : ''}</Notice>
        <form onSubmit={(event) => void submit(event)} className="grid gap-4 sm:grid-cols-2">
          {field('givenName', 'First name')}
          {field('familyName', 'Last name')}
          {field('phoneNumber', 'Phone', '+493012345678')}
          {field('preferredLocale', 'Language', 'en-GB')}
          {field('timeZone', 'Time zone', 'Europe/Berlin')}
          <div className="flex items-end">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

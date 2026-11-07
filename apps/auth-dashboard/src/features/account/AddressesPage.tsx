import { useState, type FormEvent } from 'react';
import { Badge, Button, Card, CardBody, Notice, Spinner, TextInput, useResource } from '@ecom/ui';
import { apiErrorMessage, profileApi, type Address, type AddressInput } from '@ecom/utils';

const EMPTY: AddressInput = {
  label: '',
  recipientName: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postalCode: '',
  countryCode: '',
  phoneNumber: '',
  defaultShipping: false,
  defaultBilling: false,
};

function AddressForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: AddressInput;
  onSubmit: (address: AddressInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const text = (name: keyof AddressInput, label: string, required = false) => (
    <TextInput
      label={label}
      required={required}
      value={String(form[name] ?? '')}
      onChange={(event) => setForm({ ...form, [name]: event.target.value })}
    />
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({
      ...form,
      label: form.label || null,
      line2: form.line2 || null,
      region: form.region || null,
      phoneNumber: form.phoneNumber || null,
      countryCode: form.countryCode.toUpperCase(),
    });
  };

  return (
    <form onSubmit={(event) => void submit(event)} className="grid gap-3 rounded-card border border-slate-200 bg-surface p-4 sm:grid-cols-2">
      {text('label', 'Label (e.g. Home)')}
      {text('recipientName', 'Recipient', true)}
      {text('line1', 'Street and number', true)}
      {text('line2', 'Address line 2')}
      {text('city', 'City', true)}
      {text('region', 'Region')}
      {text('postalCode', 'Postal code', true)}
      {text('countryCode', 'Country code (e.g. DE)', true)}
      {text('phoneNumber', 'Phone')}
      <div className="flex flex-col justify-end gap-1 text-sm text-slate-600">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(form.defaultShipping)}
            onChange={(event) => setForm({ ...form, defaultShipping: event.target.checked })}
          />
          Default for shipping
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(form.defaultBilling)}
            onChange={(event) => setForm({ ...form, defaultBilling: event.target.checked })}
          />
          Default for billing
        </label>
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AddressesPage() {
  const addresses = useResource(() => profileApi.addresses(), []);
  const [editing, setEditing] = useState<Address | 'new' | null>(null);
  const [error, setError] = useState('');

  const run = async (call: () => Promise<unknown>) => {
    setError('');
    try {
      await call();
      setEditing(null);
      await addresses.reload();
    } catch (failure) {
      setError(apiErrorMessage(failure, 'Could not save this address.'));
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Addresses</h1>
        <Button size="sm" onClick={() => setEditing('new')}>
          Add address
        </Button>
      </div>
      <Notice>{addresses.error ? apiErrorMessage(addresses.error) : error}</Notice>
      {editing ? (
        <AddressForm
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? EMPTY : editing}
          onCancel={() => setEditing(null)}
          onSubmit={(address) =>
            run(() =>
              editing === 'new'
                ? profileApi.createAddress(address)
                : profileApi.updateAddress(editing.id, {
                    label: address.label,
                    recipientName: address.recipientName,
                    company: address.company,
                    line1: address.line1,
                    line2: address.line2,
                    city: address.city,
                    region: address.region,
                    postalCode: address.postalCode,
                    countryCode: address.countryCode,
                    phoneNumber: address.phoneNumber,
                    defaultShipping: address.defaultShipping,
                    defaultBilling: address.defaultBilling,
                    version: editing.version,
                  }),
            )
          }
        />
      ) : null}
      {addresses.loading && !addresses.data ? <Spinner /> : null}
      {addresses.data?.length === 0 ? <p className="text-sm text-slate-500">No addresses yet.</p> : null}
      {addresses.data?.map((address) => (
        <Card key={address.id}>
          <CardBody className="flex items-start justify-between gap-4 text-sm">
            <div>
              <p className="flex flex-wrap items-center gap-2 font-semibold text-slate-900">
                {address.label ?? address.recipientName}
                {address.defaultShipping ? <Badge tone="brand">Shipping</Badge> : null}
                {address.defaultBilling ? <Badge tone="brand">Billing</Badge> : null}
              </p>
              <p className="text-slate-600">
                {address.recipientName}, {address.line1}
                {address.line2 ? `, ${address.line2}` : ''}, {address.postalCode} {address.city}, {address.countryCode}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditing(address)}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => void run(() => profileApi.deleteAddress(address.id))}>
                Delete
              </Button>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

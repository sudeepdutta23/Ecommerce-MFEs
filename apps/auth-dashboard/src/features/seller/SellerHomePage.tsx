import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, CardBody, Notice, Spinner, TextInput, useResource } from '@ecom/ui';
import { apiErrorMessage, organizationsApi } from '@ecom/utils';

/** The shops the caller belongs to, and opening a new one (which an administrator then approves). */
export function SellerHomePage() {
  const shops = useResource(() => organizationsApi.mine({ size: 50 }), []);
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [created, setCreated] = useState('');

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setCreated('');
    try {
      const shop = await organizationsApi.create(slug, name);
      setCreated(`${shop.name} is waiting for approval by an administrator. It can sell once approved.`);
      setSlug('');
      setName('');
      await shops.reload();
    } catch (failure) {
      setError(apiErrorMessage(failure, 'Could not create this shop.'));
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Your shops</h1>
      <Notice>{shops.error ? apiErrorMessage(shops.error) : error}</Notice>
      <Notice tone="success">{created}</Notice>
      {shops.loading && !shops.data ? <Spinner /> : null}
      {shops.data?.content.length === 0 ? <p className="text-sm text-slate-500">You have no shop yet.</p> : null}
      <ul className="space-y-2">
        {shops.data?.content.map((shop) => (
          <li key={shop.id}>
            <Link to={shop.id} className="block">
              <Card className="transition-colors hover:border-brand-200">
                <CardBody className="flex items-center justify-between gap-4 text-sm">
                  <span>
                    <b className="font-semibold text-slate-900">{shop.name}</b>
                    <span className="ml-2 text-slate-400">{shop.slug}</span>
                  </span>
                  <span className="flex gap-2">
                    <Badge tone="neutral">{shop.myRole}</Badge>
                    <Badge tone={shop.status === 'ACTIVE' ? 'positive' : 'warning'}>{shop.status}</Badge>
                  </span>
                </CardBody>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      <Card>
        <CardBody className="space-y-4 px-6 py-6">
          <h2 className="text-base font-semibold text-slate-900">Open a shop</h2>
          <form onSubmit={(event) => void create(event)} className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Shop name" value={name} onChange={(event) => setName(event.target.value)} required />
            <TextInput
              label="Web address (lower case, digits, hyphens)"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              required
            />
            <div>
              <Button type="submit">Create shop</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

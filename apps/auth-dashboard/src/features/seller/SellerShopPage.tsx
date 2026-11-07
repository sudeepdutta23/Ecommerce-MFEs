import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Card, CardBody, Notice, Pager, Spinner, TextInput, cn, useResource } from '@ecom/ui';
import {
  apiErrorMessage,
  catalogApi,
  formatCurrency,
  formatDateTime,
  organizationsApi,
  sellerOrdersApi,
  sellerProductsApi,
  type BackendOrderStatus,
  type OrgRole,
  type ProductInput,
  type SellerProduct,
} from '@ecom/utils';

const ROLES: OrgRole[] = ['OWNER', 'MANAGER', 'STAFF'];

/** Runs a change, showing a failure, then reloads. */
function useAction(reload: () => Promise<void>) {
  const [error, setError] = useState('');
  const run = async (call: () => Promise<unknown>) => {
    setError('');
    try {
      await call();
      await reload();
    } catch (failure) {
      setError(apiErrorMessage(failure));
    }
  };
  return { error, run };
}

export function SellerShopPage() {
  const { orgId = '' } = useParams();
  const shop = useResource(() => organizationsApi.get(orgId), [orgId]);

  if (shop.loading && !shop.data) return <Spinner />;
  if (!shop.data) return <Notice>{apiErrorMessage(shop.error, 'Could not load this shop.')}</Notice>;

  const tabs = ['products', 'orders', 'team', 'settings'];
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to=".." className="text-sm font-semibold text-brand-600">
            ← Your shops
          </Link>
          <h1 className="text-xl font-bold text-slate-900">{shop.data.name}</h1>
        </div>
        <Badge tone={shop.data.status === 'ACTIVE' ? 'positive' : 'warning'}>{shop.data.status}</Badge>
      </header>
      {shop.data.status === 'PENDING_APPROVAL' ? (
        <Notice tone="warning">Nothing is on sale until an administrator approves this shop.</Notice>
      ) : null}
      <nav className="flex gap-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab}
            to={tab}
            className={({ isActive }) =>
              cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium capitalize',
                isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-surface-sunken',
              )
            }
          >
            {tab}
          </NavLink>
        ))}
      </nav>
      <Routes>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<ProductsTab orgId={orgId} />} />
        <Route path="orders" element={<OrdersTab orgId={orgId} />} />
        <Route path="orders/:orderId" element={<OrdersTab orgId={orgId} />} />
        <Route path="team" element={<TeamTab orgId={orgId} />} />
        <Route
          path="settings"
          element={<SettingsTab orgId={orgId} name={shop.data.name} version={shop.data.version} reload={shop.reload} />}
        />
      </Routes>
    </div>
  );
}

// ------------------------------------------------------------------ products

function ProductForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: SellerProduct;
  onSubmit: (input: ProductInput) => Promise<void>;
  onCancel: () => void;
}) {
  const categories = useResource(() => catalogApi.categoriesFresh(), []);
  const [sku, setSku] = useState(initial?.sku ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({
      sku: sku.toUpperCase(),
      name,
      description: description || null,
      price: Number(price),
      categoryId: categoryId || null,
      version: initial?.version,
    });
  };

  return (
    <form onSubmit={(event) => void submit(event)} className="grid gap-3 rounded-card border border-slate-200 bg-surface p-4 sm:grid-cols-2">
      <TextInput label="SKU" value={sku} onChange={(event) => setSku(event.target.value)} required />
      <TextInput label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
      <TextInput
        label="Price"
        type="number"
        min="0.01"
        step="0.01"
        value={price}
        onChange={(event) => setPrice(event.target.value)}
        required
      />
      <label className="block text-sm font-medium text-slate-700">
        Category
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="mt-1 block w-full rounded-lg border-0 py-2 pl-3 text-sm ring-1 ring-inset ring-slate-300"
        >
          <option value="">None</option>
          {categories.data?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
        Description
        <textarea
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 block w-full rounded-lg border-0 p-3 text-sm ring-1 ring-inset ring-slate-300"
        />
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function SellerImage({ orgId, productId, imageId }: { orgId: string; productId: string; imageId: string }) {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    let objectUrl: string | undefined;
    let cancelled = false;
    void sellerProductsApi.imageContent(orgId, productId, imageId).then((blob) => {
      if (cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [orgId, productId, imageId]);

  return url ? (
    <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200" />
  ) : (
    <span className="block h-16 w-16 animate-pulse rounded-lg bg-slate-100" />
  );
}

function ImagesPanel({ orgId, productId }: { orgId: string; productId: string }) {
  const images = useResource(() => sellerProductsApi.images(orgId, productId), [orgId, productId]);
  const { error, run } = useAction(images.reload);

  return (
    <div className="space-y-2 border-t border-slate-100 pt-3">
      <Notice>{error}</Notice>
      <div className="flex flex-wrap gap-2">
        {images.data?.map((image) => (
          <span key={image.id} className="relative">
            <SellerImage orgId={orgId} productId={productId} imageId={image.id} />
            <button
              type="button"
              aria-label="Delete image"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-white text-xs shadow ring-1 ring-slate-300"
              onClick={() => void run(() => sellerProductsApi.deleteImage(orgId, productId, image.id))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png"
        aria-label="Upload an image"
        className="text-xs"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void run(() => sellerProductsApi.uploadImage(orgId, productId, file));
        }}
      />
      <p className="text-xs text-slate-400">JPEG or PNG, at most 5 MB. Customers see them once the product is on sale.</p>
    </div>
  );
}

function ProductsTab({ orgId }: { orgId: string }) {
  const [page, setPage] = useState(0);
  const products = useResource(() => sellerProductsApi.list(orgId, { page, size: 20 }), [orgId, page]);
  const { error, run } = useAction(products.reload);
  const [editing, setEditing] = useState<SellerProduct | 'new' | null>(null);
  const [imagesOf, setImagesOf] = useState<string | null>(null);
  const [delta, setDelta] = useState<Record<string, string>>({});

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing('new')}>
          Add product
        </Button>
      </div>
      <Notice>{products.error ? apiErrorMessage(products.error) : error}</Notice>
      {editing ? (
        <ProductForm
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSubmit={async (input) => {
            await run(() =>
              editing === 'new'
                ? sellerProductsApi.create(orgId, input)
                : sellerProductsApi.update(orgId, editing.id, input),
            );
            setEditing(null);
          }}
        />
      ) : null}
      {products.loading && !products.data ? <Spinner /> : null}
      {products.data?.content.length === 0 ? <p className="text-sm text-slate-500">No products yet.</p> : null}
      {products.data?.content.map((product) => (
        <Card key={product.id}>
          <CardBody className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-slate-900">
                  {product.name}
                  <Badge tone={product.status === 'ACTIVE' ? 'positive' : 'neutral'}>{product.status}</Badge>
                  {product.onSale ? <Badge tone="brand">On sale</Badge> : null}
                </p>
                <p className="text-slate-500">
                  {product.sku} · {formatCurrency(product.price, product.currency)} · {product.stock} in stock
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(product)}>
                  Edit
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setImagesOf(imagesOf === product.id ? null : product.id)}>
                  Images
                </Button>
                {product.status === 'ACTIVE' ? (
                  <Button variant="secondary" size="sm" onClick={() => void run(() => sellerProductsApi.archive(orgId, product.id))}>
                    Archive
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => void run(() => sellerProductsApi.publish(orgId, product.id))}>
                    Publish
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="+10 or -2"
                aria-label={`Stock change for ${product.name}`}
                value={delta[product.id] ?? ''}
                onChange={(event) => setDelta({ ...delta, [product.id]: event.target.value })}
                className="w-28 rounded-lg border-0 px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300"
              />
              <Button
                variant="secondary"
                size="sm"
                disabled={!Number(delta[product.id])}
                onClick={() =>
                  void run(async () => {
                    await sellerProductsApi.adjustStock(orgId, product.id, Number(delta[product.id]));
                    setDelta({ ...delta, [product.id]: '' });
                  })
                }
              >
                Adjust stock
              </Button>
            </div>
            {imagesOf === product.id ? <ImagesPanel orgId={orgId} productId={product.id} /> : null}
          </CardBody>
        </Card>
      ))}
      <Pager page={page} totalPages={products.data?.totalPages ?? 1} onPage={setPage} />
    </div>
  );
}

// ------------------------------------------------------------------ orders

function OrderPanel({ orgId, orderId, onChanged }: { orgId: string; orderId: string; onChanged: () => Promise<void> }) {
  const order = useResource(() => sellerOrdersApi.get(orgId, orderId), [orgId, orderId]);
  const { error, run } = useAction(async () => {
    await order.reload();
    await onChanged();
  });
  const [tracking, setTracking] = useState('');
  const [reason, setReason] = useState('');
  const data = order.data;

  if (!data) return order.loading ? <Spinner /> : <Notice>{apiErrorMessage(order.error)}</Notice>;

  return (
    <Card>
      <CardBody className="space-y-3 text-sm">
        <Notice>{error}</Notice>
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-slate-400">{data.id}</p>
          <Badge tone="brand">{data.status}</Badge>
        </div>
        <ul className="divide-y divide-slate-100">
          {data.lines.map((line) => (
            <li key={line.productId} className="flex justify-between py-2">
              <span>
                {line.quantity} × {line.name} <span className="text-slate-400">({line.sku})</span>
              </span>
              <span className="font-semibold">{formatCurrency(line.lineTotal, data.currency)}</span>
            </li>
          ))}
        </ul>
        {data.shippingAddress ? (
          <p className="text-slate-600">
            Ship to: {data.shippingAddress.recipientName}, {data.shippingAddress.line1}, {data.shippingAddress.postalCode}{' '}
            {data.shippingAddress.city}, {data.shippingAddress.countryCode}
          </p>
        ) : null}
        {data.trackingNumber ? <p className="text-slate-600">Tracking: {data.trackingNumber}</p> : null}
        {data.status === 'PAID' ? (
          <div className="flex flex-wrap items-end gap-2">
            <TextInput label="Tracking number" value={tracking} onChange={(event) => setTracking(event.target.value)} />
            <Button onClick={() => void run(() => sellerOrdersApi.ship(orgId, orderId, tracking || undefined))}>
              Mark shipped
            </Button>
          </div>
        ) : null}
        {data.status === 'SHIPPED' ? (
          <Button onClick={() => void run(() => sellerOrdersApi.deliver(orgId, orderId))}>Mark delivered</Button>
        ) : null}
        {data.status === 'PAID' || data.status === 'PENDING_PAYMENT' ? (
          <div className="flex flex-wrap items-end gap-2">
            <TextInput label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
            <Button variant="danger" onClick={() => void run(() => sellerOrdersApi.cancel(orgId, orderId, reason || undefined))}>
              Cancel order
            </Button>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

const ORDER_FILTERS: Array<BackendOrderStatus | ''> = ['', 'PENDING_PAYMENT', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function OrdersTab({ orgId }: { orgId: string }) {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<BackendOrderStatus | ''>('');
  const orders = useResource(
    () => sellerOrdersApi.list(orgId, { page, size: 20, status: status || undefined }),
    [orgId, page, status],
  );

  return (
    <div className="space-y-4">
      <select
        value={status}
        aria-label="Filter by status"
        onChange={(event) => {
          setPage(0);
          setStatus(event.target.value as BackendOrderStatus | '');
        }}
        className="rounded-lg border-0 py-2 pl-3 pr-8 text-sm ring-1 ring-inset ring-slate-300"
      >
        {ORDER_FILTERS.map((option) => (
          <option key={option} value={option}>
            {option || 'All orders'}
          </option>
        ))}
      </select>
      <Notice>{orders.error ? apiErrorMessage(orders.error) : ''}</Notice>
      {orders.loading && !orders.data ? <Spinner /> : null}
      {orders.data?.content.length === 0 ? <p className="text-sm text-slate-500">No orders.</p> : null}
      {orderId ? <OrderPanel orgId={orgId} orderId={orderId} onChanged={orders.reload} /> : null}
      <ul className="divide-y divide-slate-100 rounded-card border border-slate-200 bg-surface">
        {orders.data?.content.map((order) => (
          <li key={order.id}>
            <button
              type="button"
              onClick={() => navigate(orderId ? `../orders/${order.id}` : order.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm hover:bg-surface-sunken"
            >
              <span>
                <span className="font-mono text-xs text-slate-400">{order.id.slice(0, 8)}</span>
                <span className="ml-3 text-slate-500">{formatDateTime(order.createdAt)}</span>
              </span>
              <span className="flex items-center gap-3">
                <Badge tone="brand">{order.status}</Badge>
                <b className="font-semibold">{formatCurrency(order.total, order.currency)}</b>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Pager page={page} totalPages={orders.data?.totalPages ?? 1} onPage={setPage} />
    </div>
  );
}

// ------------------------------------------------------------------ team

function TeamTab({ orgId }: { orgId: string }) {
  const members = useResource(() => organizationsApi.members(orgId, { size: 100 }), [orgId]);
  const invitations = useResource(() => organizationsApi.invitations(orgId, { size: 100 }), [orgId]);
  const { error, run } = useAction(async () => {
    await members.reload();
    await invitations.reload();
  });
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrgRole>('STAFF');

  return (
    <div className="max-w-3xl space-y-5">
      <Notice>{members.error ? apiErrorMessage(members.error) : error}</Notice>
      <ul className="divide-y divide-slate-100 rounded-card border border-slate-200 bg-surface text-sm">
        {members.data?.content.map((member) => (
          <li key={member.userId} className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="min-w-0 truncate text-slate-900">{member.email}</span>
            <span className="flex shrink-0 items-center gap-2">
              <select
                value={member.role}
                aria-label={`Role of ${member.email}`}
                onChange={(event) => void run(() => organizationsApi.changeRole(orgId, member.userId, event.target.value as OrgRole))}
                className="rounded-lg border-0 py-1 pl-2 pr-7 text-xs ring-1 ring-inset ring-slate-300"
              >
                {ROLES.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <Button variant="secondary" size="sm" onClick={() => void run(() => organizationsApi.removeMember(orgId, member.userId))}>
                Remove
              </Button>
            </span>
          </li>
        ))}
      </ul>

      <h2 className="text-base font-semibold text-slate-900">Invitations</h2>
      <Notice>{invitations.error ? apiErrorMessage(invitations.error) : ''}</Notice>
      <ul className="divide-y divide-slate-100 text-sm">
        {invitations.data?.content.map((invitation) => (
          <li key={invitation.id} className="flex items-center justify-between gap-3 py-2">
            <span>
              {invitation.email} <Badge tone="neutral">{invitation.role}</Badge>
            </span>
            <Button variant="secondary" size="sm" onClick={() => void run(() => organizationsApi.revokeInvitation(orgId, invitation.id))}>
              Revoke
            </Button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void run(async () => {
            await organizationsApi.invite(orgId, email, role);
            setEmail('');
          });
        }}
        className="flex flex-wrap items-end gap-2"
      >
        <TextInput label="Invite by email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <select
          value={role}
          aria-label="Role"
          onChange={(event) => setRole(event.target.value as OrgRole)}
          className="rounded-lg border-0 py-2 pl-3 pr-8 text-sm ring-1 ring-inset ring-slate-300"
        >
          {ROLES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <Button type="submit">Invite</Button>
      </form>
    </div>
  );
}

// ------------------------------------------------------------------ settings

function SettingsTab({
  orgId,
  name: currentName,
  version,
  reload,
}: {
  orgId: string;
  name: string;
  version: number;
  reload: () => Promise<void>;
}) {
  const navigate = useNavigate();
  const { error, run } = useAction(reload);
  const [name, setName] = useState(currentName);
  const [confirmClose, setConfirmClose] = useState(false);

  return (
    <div className="max-w-xl space-y-5">
      <Notice>{error}</Notice>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void run(() => organizationsApi.update(orgId, name, version));
        }}
        className="flex items-end gap-2"
      >
        <TextInput label="Shop name" value={name} onChange={(event) => setName(event.target.value)} required />
        <Button type="submit">Rename</Button>
      </form>
      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Button
          variant="secondary"
          onClick={() =>
            void run(async () => {
              await organizationsApi.leave(orgId);
              navigate('../..');
            })
          }
        >
          Leave this shop
        </Button>
        {confirmClose ? (
          <Button variant="danger" onClick={() => void run(() => organizationsApi.close(orgId))}>
            Yes, close it for good
          </Button>
        ) : (
          <Button variant="danger" onClick={() => setConfirmClose(true)}>
            Close this shop
          </Button>
        )}
      </div>
    </div>
  );
}

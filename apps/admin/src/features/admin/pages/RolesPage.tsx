import { useState, type FormEvent } from 'react';
import { Badge, Button, Card, CardBody, Notice, SectionHeader, Spinner, TextInput, useResource } from '@ecom/ui';
import { adminApi, apiErrorMessage, type Permission, type Role } from '@ecom/utils';
import { useAdminAction } from '../useAdminAction';

function PermissionPicker({
  permissions,
  selected,
  disabled,
  onChange,
}: {
  permissions: Permission[];
  selected: string[];
  disabled?: boolean;
  onChange: (selected: string[]) => void;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-2">
      {permissions.map((permission) => (
        <label key={permission.code} className="flex items-center gap-2 text-xs text-slate-600" title={permission.description}>
          <input
            type="checkbox"
            disabled={disabled}
            checked={selected.includes(permission.code)}
            onChange={(event) =>
              onChange(
                event.target.checked
                  ? [...selected, permission.code]
                  : selected.filter((code) => code !== permission.code),
              )
            }
          />
          {permission.code}
        </label>
      ))}
    </div>
  );
}

function RoleCard({ role, permissions, onChanged }: { role: Role; permissions: Permission[]; onChanged: () => Promise<void> }) {
  const { error, run } = useAdminAction(onChanged);
  const [selected, setSelected] = useState(role.permissions);
  const changed = selected.slice().sort().join() !== role.permissions.slice().sort().join();

  return (
    <Card>
      <CardBody className="space-y-3 text-sm">
        <p className="flex flex-wrap items-center gap-2 font-semibold text-slate-900">
          {role.name} <span className="font-mono text-xs font-normal text-slate-400">{role.code}</span>
          {role.systemRole ? <Badge tone="neutral">System, read-only</Badge> : null}
        </p>
        {role.description ? <p className="text-slate-600">{role.description}</p> : null}
        <Notice>{error}</Notice>
        <PermissionPicker permissions={permissions} selected={selected} disabled={role.systemRole} onChange={setSelected} />
        {role.systemRole ? null : (
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={!changed}
              onClick={() =>
                void run(() =>
                  adminApi.updateRole(role.id, {
                    name: role.name,
                    description: role.description ?? undefined,
                    permissions: selected,
                    version: role.version,
                  }),
                )
              }
            >
              Save
            </Button>
            <Button variant="danger" size="sm" onClick={() => void run(() => adminApi.deleteRole(role.id))}>
              Delete
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export function RolesPage() {
  const roles = useResource(() => adminApi.roles(), []);
  const permissions = useResource(() => adminApi.permissions(), []);
  const { error, run } = useAdminAction(roles.reload);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const create = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      await adminApi.createRole({ code: code.toUpperCase(), name, permissions: selected });
      setCode('');
      setName('');
      setSelected([]);
    });
  };

  return (
    <div className="max-w-3xl space-y-5">
      <SectionHeader
        title={
          <>
            Roles and <span className="text-brand-500">permissions</span>
          </>
        }
      />
      <Notice>{roles.error ? apiErrorMessage(roles.error) : error}</Notice>
      {roles.loading && !roles.data ? <Spinner /> : null}
      {roles.data?.map((role) => (
        <RoleCard
          key={`${role.id}-${role.version}`}
          role={role}
          permissions={permissions.data ?? []}
          onChanged={roles.reload}
        />
      ))}
      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900">New role</h2>
          <form onSubmit={create} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput label="Code" value={code} onChange={(event) => setCode(event.target.value)} required />
              <TextInput label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <PermissionPicker permissions={permissions.data ?? []} selected={selected} onChange={setSelected} />
            <Button type="submit">Create role</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

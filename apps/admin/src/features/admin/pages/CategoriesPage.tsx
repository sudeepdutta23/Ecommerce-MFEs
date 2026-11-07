import { useState, type FormEvent } from 'react';
import { Button, Notice, SectionHeader, Spinner, TextInput, useResource } from '@ecom/ui';
import { adminApi, apiErrorMessage, catalogApi, type Category } from '@ecom/utils';
import { useAdminAction } from '../useAdminAction';

function Row({ category, onChanged }: { category: Category; onChanged: () => Promise<void> }) {
  const { error, run } = useAdminAction(onChanged);
  const [name, setName] = useState(category.name);

  return (
    <li className="space-y-2 px-5 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-40 truncate font-mono text-xs text-slate-500">{category.slug}</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-label={`Name of ${category.slug}`}
          className="flex-1 rounded-lg border-0 px-3 py-1.5 ring-1 ring-inset ring-slate-300"
        />
        <Button
          variant="secondary"
          size="sm"
          disabled={!name.trim() || name === category.name}
          onClick={() => void run(() => adminApi.updateCategory(category.id, name, category.version))}
        >
          Rename
        </Button>
        <Button variant="danger" size="sm" onClick={() => void run(() => adminApi.deleteCategory(category.id))}>
          Delete
        </Button>
      </div>
      <Notice>{error}</Notice>
    </li>
  );
}

export function CategoriesPage() {
  const categories = useResource(() => catalogApi.categoriesFresh(), []);
  const { error, run } = useAdminAction(categories.reload);
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');

  const create = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      await adminApi.createCategory(slug, name);
      setSlug('');
      setName('');
    });
  };

  return (
    <div className="max-w-3xl space-y-5">
      <SectionHeader
        title={
          <>
            Product <span className="text-brand-500">categories</span>
          </>
        }
      />
      <Notice>{categories.error ? apiErrorMessage(categories.error) : error}</Notice>
      <form onSubmit={create} className="flex flex-wrap items-end gap-3">
        <TextInput label="Slug" value={slug} onChange={(event) => setSlug(event.target.value)} required />
        <TextInput label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
        <Button type="submit">Add category</Button>
      </form>
      {categories.loading && !categories.data ? <Spinner /> : null}
      <ul className="divide-y divide-slate-100 rounded-card border border-slate-200 bg-surface shadow-card">
        {categories.data?.map((category) => (
          <Row key={`${category.id}-${category.version}`} category={category} onChanged={categories.reload} />
        ))}
      </ul>
    </div>
  );
}

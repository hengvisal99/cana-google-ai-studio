'use client';

import React, { useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MASTER_DATA_CATEGORIES,
  MASTER_DATA_GROUPS,
  getMasterDataCategory,
  hasStaffId,
  type MasterDataCategoryId,
  type MasterDataItem,
} from '@/lib/master-data';

const CARD = 'rounded-[20px] border border-slate-200/60 bg-white shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]';
const INPUT =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10';

type Draft = Pick<MasterDataItem, 'name' | 'nameKh' | 'staffId' | 'active'>;

interface MasterDataScreenProps {
  items: MasterDataItem[];
  setItems: React.Dispatch<React.SetStateAction<MasterDataItem[]>>;
}

/** Settings → Master Data: the reference lists (nationality, occupation, bank…) other forms pick from */
export function MasterDataScreen({ items, setItems }: MasterDataScreenProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<MasterDataCategoryId>(MASTER_DATA_CATEGORIES[0].id);
  const [search, setSearch] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  // null = closed; an item = editing it; 'new' = inserting into the active category
  const [editing, setEditing] = useState<MasterDataItem | 'new' | null>(null);
  const [deleting, setDeleting] = useState<MasterDataItem | null>(null);

  const activeCategory = getMasterDataCategory(activeCategoryId);
  const ActiveIcon = activeCategory.icon;
  // Assigned Reviewer / Approved By hold staff, so they carry a Staff ID on top of the name
  const showStaffId = hasStaffId(activeCategoryId);

  const counts = useMemo(() => {
    const result: Partial<Record<MasterDataCategoryId, number>> = {};
    items.forEach((item) => {
      result[item.categoryId] = (result[item.categoryId] ?? 0) + 1;
    });
    return result;
  }, [items]);

  const groupedCategories = useMemo(() => {
    const query = categoryQuery.trim().toLowerCase();
    return MASTER_DATA_GROUPS.map((group) => ({
      ...group,
      categories: MASTER_DATA_CATEGORIES.filter(
        (category) => category.groupId === group.id && (!query || category.label.toLowerCase().includes(query))
      ),
    })).filter((group) => group.categories.length > 0);
  }, [categoryQuery]);

  const selectCategory = (id: MasterDataCategoryId) => {
    setActiveCategoryId(id);
    setSearch('');
  };

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items
      .filter((item) => item.categoryId === activeCategoryId)
      .filter(
        (item) => !query || [item.name, item.nameKh, item.staffId ?? ''].join(' ').toLowerCase().includes(query)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, activeCategoryId, search]);

  const toggleActive = (id: string) => {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, active: !item.active, updatedAt: now } : item)));
  };

  const handleSave = (draft: Draft) => {
    const now = new Date().toISOString();
    const next = { ...draft, staffId: showStaffId ? draft.staffId : undefined };
    if (editing === 'new') {
      setItems((prev) => [
        { ...next, id: `${activeCategoryId}-${Date.now()}`, categoryId: activeCategoryId, updatedAt: now },
        ...prev,
      ]);
    } else if (editing) {
      setItems((prev) => prev.map((item) => (item.id === editing.id ? { ...item, ...next, updatedAt: now } : item)));
    }
    setEditing(null);
  };

  return (
    <div className="space-y-4 lg:h-full lg:space-y-0">
      <h1 className="text-[22px] font-semibold tracking-tight text-slate-900 lg:hidden">Master Data</h1>

      <div className="grid items-start gap-5 lg:h-full lg:grid-cols-[260px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:items-stretch">
        <aside id="master-data-categories" className={cn(CARD, 'hidden p-3 lg:flex lg:min-h-0 lg:flex-col')}>
          <div className="px-1.5 pb-3 pt-1">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">Master Data</h1>
          </div>
          <div className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 transition focus-within:border-slate-400 focus-within:bg-white">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <input
              id="input-master-data-category-search"
              type="text"
              value={categoryQuery}
              onChange={(e) => setCategoryQuery(e.target.value)}
              placeholder="Find category"
              className="min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <nav className="mt-3 min-h-0 flex-1 space-y-4 overflow-y-auto pr-0.5 [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:#cbd5e1_transparent]">
            {groupedCategories.length === 0 && (
              <p className="px-2 py-6 text-center text-xs text-slate-400">No category found</p>
            )}
            {groupedCategories.map((group) => (
              <div key={group.id}>
                <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.categories.map((category) => {
                    const isActive = category.id === activeCategoryId;
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        id={`tab-master-data-${category.id}`}
                        type="button"
                        aria-current={isActive ? 'true' : undefined}
                        onClick={() => selectCategory(category.id)}
                        className={cn(
                          'relative flex w-full cursor-pointer select-none items-center gap-2.5 rounded-xl py-1.5 pl-2.5 pr-2 text-left transition',
                          isActive ? 'bg-white shadow-sm ring-1 ring-blue-200' : 'hover:bg-slate-50'
                        )}
                      >
                        {isActive && <span className="absolute inset-y-2.5 left-0 w-[3px] rounded-full bg-blue-500" />}
                        <span
                          className={cn(
                            'grid h-8 w-8 shrink-0 place-items-center rounded-lg transition',
                            isActive
                              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                              : 'bg-white text-slate-500 ring-1 ring-inset ring-slate-200'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span
                          className={cn(
                            'min-w-0 flex-1 truncate text-xs font-semibold',
                            isActive ? 'text-slate-900' : 'text-slate-700'
                          )}
                        >
                          {category.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <div className={cn(CARD, 'overflow-hidden lg:flex lg:max-h-full lg:min-h-0 lg:flex-col lg:self-start')}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 lg:grid">
                <ActiveIcon className="h-4 w-4" />
              </span>
              <select
                id="select-master-data-category"
                value={activeCategoryId}
                onChange={(e) => selectCategory(e.target.value as MasterDataCategoryId)}
                aria-label="Category"
                className={cn(INPUT, 'cursor-pointer text-[13px] lg:hidden')}
              >
                {MASTER_DATA_GROUPS.map((group) => (
                  <optgroup key={group.id} label={group.label}>
                    {MASTER_DATA_CATEGORIES.filter((category) => category.groupId === group.id).map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="hidden min-w-0 lg:block">
                <h2 className="truncate text-sm font-semibold text-slate-900">{activeCategory.label}</h2>
                <p className="text-[11px] text-slate-500">
                  {counts[activeCategoryId] ?? 0} {(counts[activeCategoryId] ?? 0) === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <div className="flex max-w-lg flex-1 basis-80 items-center gap-2">
              <div className="flex h-11 min-w-0 flex-1 items-center gap-1.5 rounded-xl border border-slate-200 bg-white pl-3 pr-1.5 transition focus-within:border-slate-400">
                <input
                  id="input-master-data-search"
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="SEARCH NAME"
                  enterKeyHint="search"
                  className="min-w-0 flex-1 bg-transparent text-xs font-semibold uppercase tracking-wide text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      searchInputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    title="Clear search"
                    className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => searchInputRef.current?.focus()}
                  aria-label="Search"
                  title="Search"
                  className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
              <button
                id="btn-master-data-add"
                type="button"
                onClick={() => setEditing('new')}
                className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-blue-500 px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition hover:bg-blue-600"
              >
                <Plus className="h-5 w-5" />
                <span>Add New</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <table id="master-data-table" className="w-full border-collapse text-left text-xs">
              <thead className="lg:sticky lg:top-0 lg:z-10">
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {showStaffId && <th className="whitespace-nowrap px-4 py-3">Staff ID</th>}
                  <th className="whitespace-nowrap px-4 py-3">Name (EN)</th>
                  <th className="whitespace-nowrap px-4 py-3">Name (KH)</th>
                  <th className="whitespace-nowrap px-4 py-3">Status</th>
                  <th className="whitespace-nowrap px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={showStaffId ? 6 : 5} className="py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-400">
                          <ActiveIcon className="h-5 w-5" />
                        </span>
                        <p className="text-sm font-semibold text-slate-700">No record found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((item) => (
                    <tr key={item.id} id={`master-data-row-${item.id}`} className="transition-[background-color] hover:bg-slate-50">
                      {showStaffId && (
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono font-medium text-slate-600">
                          {item.staffId || '—'}
                        </td>
                      )}
                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-900">{item.name}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-900">{item.nameKh}</td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={item.active}
                          aria-label={`${item.name} active`}
                          title={item.active ? 'Active' : 'Inactive'}
                          onClick={() => toggleActive(item.id)}
                          className={cn(
                            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors',
                            item.active ? 'bg-blue-500' : 'bg-slate-200'
                          )}
                        >
                          <span
                            className={cn(
                              'h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                              item.active ? 'translate-x-[18px]' : 'translate-x-0.5'
                            )}
                          />
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">
                        {format(new Date(item.updatedAt), 'dd MMM yyyy')}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditing(item)}
                            aria-label={`Edit ${item.name}`}
                            title="Edit"
                            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(item)}
                            aria-label={`Delete ${item.name}`}
                            title="Delete"
                            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editing && (
        <MasterDataDialog
          key={editing === 'new' ? 'new' : editing.id}
          title={`${editing === 'new' ? 'Add' : 'Edit'} ${activeCategory.label}`}
          initial={editing === 'new' ? { name: '', nameKh: '', staffId: '', active: true } : editing}
          showStaffId={showStaffId}
          takenNames={items
            .filter((item) => item.categoryId === activeCategoryId && (editing === 'new' || item.id !== editing.id))
            .map((item) => item.name.trim().toLowerCase())}
          takenStaffIds={items
            .filter((item) => item.categoryId === activeCategoryId && (editing === 'new' || item.id !== editing.id))
            .map((item) => (item.staffId ?? '').trim().toLowerCase())
            .filter(Boolean)}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      {deleting && (
        <Overlay onClose={() => setDeleting(null)}>
          <h2 className="text-base font-semibold text-slate-900">Delete {deleting.name}?</h2>
          <p className="mt-1.5 text-xs text-slate-500">
            It will be removed from {getMasterDataCategory(deleting.categoryId).label}. Records that already use it keep their value.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="h-10 cursor-pointer rounded-xl px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setItems((prev) => prev.filter((item) => item.id !== deleting.id));
                setDeleting(null);
              }}
              className="h-10 cursor-pointer rounded-xl bg-rose-500 px-4 text-xs font-semibold text-white shadow-md shadow-rose-500/30 transition hover:bg-rose-600"
            >
              Delete
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
}

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-[20px] bg-white p-6 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function MasterDataDialog({
  title,
  initial,
  showStaffId,
  takenNames,
  takenStaffIds,
  onCancel,
  onSave,
}: {
  title: string;
  initial: Draft;
  showStaffId: boolean;
  takenNames: string[];
  takenStaffIds: string[];
  onCancel: () => void;
  onSave: (draft: Draft) => void;
}) {
  const [draft, setDraft] = useState<Draft>({
    name: initial.name,
    nameKh: initial.nameKh,
    staffId: initial.staffId ?? '',
    active: initial.active,
  });
  const name = draft.name.trim();
  const nameTaken = takenNames.includes(name.toLowerCase());
  const staffId = (draft.staffId ?? '').trim();
  const staffIdTaken = showStaffId && staffId !== '' && takenStaffIds.includes(staffId.toLowerCase());
  const canSave = name !== '' && !nameTaken && (!showStaffId || (staffId !== '' && !staffIdTaken));

  return (
    <Overlay onClose={onCancel}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave) onSave({ ...draft, name, nameKh: draft.nameKh.trim(), staffId });
        }}
      >
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <div className="mt-5 space-y-4">
          {showStaffId && (
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">
                Staff ID <span className="text-rose-500">*</span>
              </span>
              <input
                autoFocus
                value={draft.staffId ?? ''}
                onChange={(e) => setDraft({ ...draft, staffId: e.target.value })}
                placeholder="e.g. STF-1042"
                className={cn(INPUT, 'font-mono', staffIdTaken && 'border-rose-400')}
              />
              {staffIdTaken && (
                <span className="mt-1 block text-[11px] text-rose-600">This staff ID already exists.</span>
              )}
            </label>
          )}
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">
              Name (EN) <span className="text-rose-500">*</span>
            </span>
            <input
              autoFocus={!showStaffId}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className={cn(INPUT, nameTaken && 'border-rose-400')}
            />
            {nameTaken && <span className="mt-1 block text-[11px] text-rose-600">This name already exists.</span>}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">Name (KH)</span>
            <input value={draft.nameKh} onChange={(e) => setDraft({ ...draft, nameKh: e.target.value })} className={INPUT} />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 cursor-pointer rounded-xl px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="h-10 cursor-pointer rounded-xl bg-blue-500 px-4 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </form>
    </Overlay>
  );
}

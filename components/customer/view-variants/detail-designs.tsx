'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { CustomerTypeDefinition, CustomerTypeField } from '@/lib/customer-types';
import type { CustomerTypeRecord } from '@/types';
import { fieldDisplay, valueClassFor } from './shared';

interface DetailProps {
  type: CustomerTypeDefinition;
  item: CustomerTypeRecord;
}

const LABEL = 'text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400';

function detailFields(type: CustomerTypeDefinition): CustomerTypeField[] {
  return type.fields.filter((field) => field.type !== 'customer');
}

interface FieldSection {
  /** null for the fields that belong to no group */
  caption: string | null;
  fields: CustomerTypeField[];
}

/**
 * Ungrouped fields first, then one section per `group` in definition order, so
 * related values (Purchase, Subscription) start their own row and read across together.
 */
function sectionsOf(fields: CustomerTypeField[]): FieldSection[] {
  const loose = fields.filter((field) => !field.group);
  const sections: FieldSection[] = loose.length > 0 ? [{ caption: null, fields: loose }] : [];

  const seen = new Set<string>();
  fields.forEach((field) => {
    if (!field.group || seen.has(field.group)) return;
    seen.add(field.group);
    sections.push({ caption: field.group, fields: fields.filter((other) => other.group === field.group) });
  });

  return sections;
}

// Column count follows the field count, so a short record never leaves a hole
const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
};

/** One record's fields: no boxes, no lines, just an airy label/value grid */
export function RecordDetail({ type, item }: DetailProps) {
  const fields = detailFields(type);
  const notes = fields.filter((field) => field.type === 'textarea');
  const sections = sectionsOf(fields.filter((field) => field.type !== 'textarea'));

  return (
    <div className="space-y-6 px-0.5">
      {sections.map((section) => (
        <section key={section.caption ?? 'main'}>
          <div className={cn('grid gap-x-8 gap-y-5', GRID_COLS[Math.min(section.fields.length, 3)])}>
            {section.fields.map((field) => (
              <div key={field.key} className="min-w-0">
                <p className={LABEL}>{field.label}</p>
                <div className={cn('mt-1.5 break-words text-[14px] text-slate-900', valueClassFor(field))}>
                  {fieldDisplay(field, item.values[field.key])}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {notes.map((field) => (
        <div key={field.key}>
          <p className={LABEL}>{field.label}</p>
          <p className="mt-1.5 max-w-2xl whitespace-pre-wrap text-[14px] leading-relaxed text-slate-700">
            {fieldDisplay(field, item.values[field.key])}
          </p>
        </div>
      ))}

    </div>
  );
}

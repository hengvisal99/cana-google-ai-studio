'use client';

import React from 'react';
import { FileText, Eye, Download } from 'lucide-react';
import { SupportingDocument } from '@/types';
import { DossierCard } from '@/components/shared/DossierCard';

interface SupportingDocumentsSectionProps {
  documents?: SupportingDocument[];
  onView: (doc: SupportingDocument) => void;
  onDownload: (doc: SupportingDocument) => void;
}

/** Supporting documents as a stack of rows: file icon, name over type, and actions. */
export function SupportingDocumentsSection({
  documents,
  onView,
  onDownload,
}: SupportingDocumentsSectionProps) {
  const docs = documents || [];

  return (
    <DossierCard title={`Supporting Documents (${docs.length})`} plain>
      {docs.length === 0 ? (
        <p className="text-sm text-slate-500">No supporting documents attached.</p>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate" title={doc.fileName}>
                    {doc.fileName}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">{doc.type}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onView(doc)}
                  title={`View ${doc.fileName}`}
                  className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 text-xs font-medium transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">View</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDownload(doc)}
                  title={`Download ${doc.fileName}`}
                  className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 text-xs font-medium transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DossierCard>
  );
}

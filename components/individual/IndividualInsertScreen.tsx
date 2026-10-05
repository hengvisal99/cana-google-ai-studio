'use client';

import React, { useState } from 'react';
import { Individual, SupportingDocument } from '@/types';
import { User, ShieldCheck, Briefcase, Users, CreditCard } from 'lucide-react';
import { buildIndividualRecord } from '@/components/individual/form/buildIndividual';
import { IndividualFormShell } from '@/components/individual/IndividualFormShell';
import {
  IndividualFormFields,
  createEmptyFormValues,
  type IndividualFormValues,
} from '@/components/individual/form/IndividualFormFields';

interface IndividualInsertScreenProps {
  onCancel: () => void;
  onSubmitSuccess: (newIndividual: Individual) => void;
  initialLead?: import('@/types').Lead;
}

type TabKey = 'personal' | 'identification' | 'employment' | 'family' | 'account';

export function IndividualInsertScreen({
  onCancel,
  onSubmitSuccess,
  initialLead,
}: IndividualInsertScreenProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [values, setValues] = useState<IndividualFormValues>(() => {
    const base = createEmptyFormValues();
    if (initialLead) {
      const parts = initialLead.name.split(' ');
      const given = parts[0] || '';
      const sur = parts.slice(1).join(' ') || '';
      return {
        ...base,
        givenNameEN: given,
        surnameEN: sur,
        email: initialLead.email || '',
        mainPhoneNumber: initialLead.phone || '',
      };
    }
    return base;
  });

  function setValue<K extends keyof IndividualFormValues>(key: K, value: IndividualFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  // Tab 1: Personal Information

  // Tab 2: Identification & Residency
  const [documents, setDocuments] = useState<SupportingDocument[]>([]);

  // Tab 2: Supporting Documents Dropzone states & inputs

  // Contact channels and residential address (tab 1)

  // Tab 4: Employment & Banking

  // Tab 5: Family & Related Persons (No checkbox required - always editable)

  // Tab 6: Account Information

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!values.givenNameEN.trim()) newErrors.givenNameEN = 'Given Name in English is required';
    if (!values.surnameEN.trim()) newErrors.surnameEN = 'Surname in English is required';
    if (!values.email.trim()) newErrors.email = 'Email address is required';
    if (!values.idNumber.trim()) newErrors.idNumber = 'ID Number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Auto switch to personal tab if error is there
      if (newErrors.givenNameEN || newErrors.surnameEN) {
        setActiveTab('personal');
      } else if (newErrors.idNumber) {
        setActiveTab('identification');
      } else if (newErrors.email) {
        setActiveTab('personal');
      }
      return;
    }

    setIsSubmitting(true);

    const newRecord = buildIndividualRecord(values, documents);

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess(newRecord);
    }, 400);
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'personal', label: 'Personal Information', icon: <User className="w-4 h-4" /> },
    { key: 'identification', label: 'Identification & Docs', icon: <ShieldCheck className="w-4 h-4" /> },
    { key: 'employment', label: 'Employment & Banking', icon: <Briefcase className="w-4 h-4" /> },
    { key: 'family', label: 'Family & Related Persons', icon: <Users className="w-4 h-4" /> },
    { key: 'account', label: 'Account Information', icon: <CreditCard className="w-4 h-4" /> },
  ];

  const isTabComplete = (tabKey: TabKey): boolean => {
    switch (tabKey) {
      case 'personal':
        return Boolean(
          values.givenNameEN.trim() && values.surnameEN.trim() && values.email.trim() && values.city.trim()
        );
      case 'identification':
        return Boolean(values.idNumber.trim());
      case 'employment':
        return Boolean(values.occupation.trim() || values.organizationName.trim() || values.accountNumber.trim());
      case 'family':
        return Boolean(values.spouseName.trim() || values.relName.trim());
      case 'account':
        return Boolean(values.investorIdNumber.trim() || values.tradingAccountNumber.trim());
      default:
        return false;
    }
  };

  const completedTabsCount = tabs.filter((t) => isTabComplete(t.key)).length;
  const completionPercentage = Math.round((completedTabsCount / tabs.length) * 100);

  // Render the inner form fields for active tab
  return (
    <IndividualFormShell
      screenId="individual-insert-screen"
      backLabel="Back to Directory"
      onBack={onCancel}
      title="New Customer Onboarding"
      steps={tabs}
      activeStep={activeTab}
      onStepChange={setActiveTab}
      submitLabel="Submit"
      submittingLabel="Submitting..."
      isSubmitting={isSubmitting}
      onSubmit={handleFormSubmit}
    >
      <IndividualFormFields
        step={activeTab}
        values={values}
        setValue={setValue}
        errors={errors}
        documents={documents}
        setDocuments={setDocuments}
      />
    </IndividualFormShell>
  );
}

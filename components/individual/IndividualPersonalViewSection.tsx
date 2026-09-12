'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Individual, DesignTheme } from '@/types';
import { DossierCard, Field } from '@/components/shared/DossierCard';

interface IndividualPersonalViewSectionProps {
  individual: Individual;
  theme?: DesignTheme;
  className?: string;
}

export function IndividualPersonalViewSection({
  individual,
  className,
}: IndividualPersonalViewSectionProps) {
  const fullNameEN =
    individual.fullNameEN ||
    [individual.givenNameEN || individual.firstName, individual.surnameEN || individual.lastName]
      .filter(Boolean)
      .join(' ');
  const fullNameKH =
    individual.fullNameKH ||
    [individual.givenNameKH, individual.surnameKH].filter(Boolean).join(' ');

  const addressStr = individual.address
    ? [
        individual.address.street,
        individual.address.city,
        individual.address.state,
        individual.address.country,
      ]
        .filter(Boolean)
        .join(', ')
    : '';

  const mobile = individual.mobile || individual.phone;
  const telephone = individual.telephone || individual.employment?.officeTelephone;

  return (
    <div
      className={cn(
        'grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch animate-in fade-in duration-200',
        className
      )}
    >
      <DossierCard title="General Information">
        <Field label="Full Name EN" value={fullNameEN} />
        <Field label="Full Name KH" value={fullNameKH} valueClassName="font-khmer" />

        <Field label="Date of Birth" value={individual.dateOfBirth} />
        <Field label="Gender" value={individual.gender} />

        <Field label="Marital Status" value={individual.maritalStatus} />
        <Field label="Nationality" value={individual.nationality} />

        <Field label="Address" value={addressStr} />
        <Field label="Email" value={individual.email} />

        <Field label="Mobile" value={mobile} />
        <Field label="Telephone" value={telephone} />
      </DossierCard>

      <DossierCard title="Classification & Standing">
        <Field label="Customer Type" value={individual.customerType} />
        <Field label="Securities Knowledge" value={individual.securitiesKnowledge} />

        <Field
          label="Risk Category"
          value={individual.riskCategory || individual.riskRating}
          valueClassName="capitalize"
        />
        <Field label="Investment Experience" value={individual.investmentExperience} />

        <Field label="Education Background" value={individual.educationBackground} />
        <Field label="Customer Status" value={individual.profileStatus} />

        <Field label="Application Date" value={individual.investorIdInfo?.applicationDate} />
        <Field
          label="Trading Account"
          value={individual.tradingAccountInfo?.tradingAccountNumber}
        />
      </DossierCard>
    </div>
  );
}

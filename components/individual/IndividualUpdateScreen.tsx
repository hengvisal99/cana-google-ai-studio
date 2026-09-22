'use client';

import React, { useState } from 'react';
import { Individual, SupportingDocument } from '@/types';
import { User, ShieldCheck, Briefcase, Users, CreditCard } from 'lucide-react';
import { formatAddressParts } from '@/components/ui/form';
import { IndividualFormShell } from '@/components/individual/IndividualFormShell';
import {
  IndividualFormFields,
  formValuesFromIndividual,
  type IndividualFormValues,
} from '@/components/individual/form/IndividualFormFields';

interface IndividualUpdateScreenProps {
  individual: Individual;
  onCancel: () => void;
  onSubmitSuccess: (updated: Individual) => void;
}

type TabKey = 'personal' | 'identification' | 'employment' | 'family' | 'account';

export function IndividualUpdateScreen({
  individual,
  onCancel,
  onSubmitSuccess,
}: IndividualUpdateScreenProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [values, setValues] = useState<IndividualFormValues>(() => formValuesFromIndividual(individual));

  function setValue<K extends keyof IndividualFormValues>(key: K, value: IndividualFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  // Tab 1: Personal Information

  // Tab 2: Identification & Residency
  const [documents, setDocuments] = useState<SupportingDocument[]>(individual.supportingDocuments || []);

  // Contact channels and residential address (tab 1)

  // Tab 4: Employment & Banking

  // Tab 5: Family & Related Persons

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
      if (newErrors.givenNameEN || newErrors.surnameEN) setActiveTab('personal');
      else if (newErrors.idNumber) setActiveTab('identification');
      else if (newErrors.email) setActiveTab('personal');
      return;
    }

    setIsSubmitting(true);

    const fullEN = `${values.givenNameEN.trim()} ${values.surnameEN.trim()}`;
    const fullKH = values.surnameKH.trim() && values.givenNameKH.trim() ? `${values.givenNameKH.trim()} ${values.surnameKH.trim()}` : (individual.fullNameKH || fullEN);

    // Spouse and related person are kept only when their fields hold something
    const hasSpouseData = !!(
      values.spouseName.trim() ||
      values.spouseLatin.trim() ||
      values.spouseEmail.trim() ||
      values.spouseOccupation.trim() ||
      values.spousePosition.trim() ||
      values.spouseBusiness.trim() ||
      values.spouseMobile.trim() ||
      values.spouseHomeNo.trim() ||
      values.spouseStreetNo.trim() ||
      values.spouseCity.trim()
    );

    const hasRelatedPersonData = !!(
      values.relName.trim() ||
      values.relLatin.trim() ||
      values.relEmail.trim() ||
      values.relMobile.trim() ||
      values.relHomeNo.trim() ||
      values.relStreetNo.trim() ||
      values.relCity.trim()
    );

    const updated: Individual = {
      ...individual,
      firstName: values.givenNameEN.trim(),
      lastName: values.surnameEN.trim(),
      surnameEN: values.surnameEN.trim(),
      givenNameEN: values.givenNameEN.trim(),
      surnameKH: values.surnameKH.trim(),
      givenNameKH: values.givenNameKH.trim(),
      fullNameEN: fullEN,
      fullNameKH: fullKH,
      email: values.email.trim(),
      phone: values.mobile.trim() || individual.phone,
      mobile: values.mobile.trim() || individual.mobile,
      telephone: values.telephone.trim(),
      avatarUrl: values.avatarUrl || individual.avatarUrl,
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      maritalStatus: values.maritalStatus,
      nationality: values.nationality,

      securitiesKnowledge: values.securitiesKnowledge,
      riskCategory: values.riskCategory,
      investmentExperience: values.investmentExperience,
      customerType: values.customerType,
      educationBackground: values.educationBackground,

      residency: values.residency,
      idType: values.idType,
      idNumber: values.idNumber.trim(),
      issuedBy: values.issuedBy.trim(),
      issuedDate: values.issuedDate,
      expiredDate: values.expiredDate,
      idExpiryDate: values.expiredDate,
      taxpayerIdNumber: values.taxpayerIdNumber.trim() || individual.taxpayerIdNumber,
      note: values.note.trim(),
      supportingDocuments: documents,

      employment: {
        occupation: values.occupation.trim() || individual.employment?.occupation || 'Professional',
        position: values.position.trim() || individual.employment?.position || 'Officer',
        typeOfBusiness: values.typeOfBusiness.trim() || individual.employment?.typeOfBusiness || 'Services',
        levelOfPosition: values.levelOfPosition,
        organizationName: values.organizationName.trim() || individual.employment?.organizationName || 'Company',
        lengthOfWork: values.lengthOfWork,
        officeTelephone: values.officeTelephone,
        // `organizationAddress` stays the composed one-line address the read-only views render.
        organizationAddress:
          formatAddressParts({
            homeNo: values.orgHomeNo,
            streetNo: values.orgStreetNo,
            commune: values.orgCommune,
            district: values.orgDistrict,
            city: values.orgCity,
            country: values.orgCountry,
          }) ||
          individual.employment?.organizationAddress ||
          '',
        organizationCountry: values.orgCountry,
        organizationCity: values.orgCity,
        organizationDistrict: values.orgDistrict,
        organizationCommune: values.orgCommune,
        organizationHomeNo: values.orgHomeNo,
        organizationStreetNo: values.orgStreetNo,
      },

      banking: {
        bankName: values.bankName,
        accountOwner: values.accountOwner.trim() || fullEN.toUpperCase(),
        savingAccount: values.savingAccount,
        accountNumber: values.accountNumber.trim() || individual.banking?.accountNumber || '001 000 000 000',
      },

      spouse: hasSpouseData ? {
        fullName: values.spouseName,
        latin: values.spouseLatin || values.spouseName,
        gender: values.spouseGender,
        email: values.spouseEmail,
        yearOfEmployment: values.spouseYearWork,
        relationship: values.spouseRelationship,
        occupation: values.spouseOccupation,
        position: values.spousePosition,
        typeOfBusiness: values.spouseBusiness,
        mobile: values.spouseMobile,
        officeTelephone: values.spouseOfficePhone,
        // `address` stays the composed one-line address the read-only views render.
        address:
          formatAddressParts({
            homeNo: values.spouseHomeNo,
            streetNo: values.spouseStreetNo,
            commune: values.spouseCommune,
            district: values.spouseDistrict,
            city: values.spouseCity,
            country: values.spouseCountry,
          }) ||
          individual.spouse?.address ||
          '',
        addressCountry: values.spouseCountry,
        addressCity: values.spouseCity,
        addressDistrict: values.spouseDistrict,
        addressCommune: values.spouseCommune,
        addressHomeNo: values.spouseHomeNo,
        addressStreetNo: values.spouseStreetNo,
      } : undefined,

      relatedPerson: hasRelatedPersonData ? {
        fullName: values.relName,
        latin: values.relLatin || values.relName,
        email: values.relEmail,
        gender: values.relGender,
        relationship: values.relRelationship,
        mobile: values.relMobile,
        // `address` stays the composed one-line address the read-only views render.
        address:
          formatAddressParts({
            homeNo: values.relHomeNo,
            streetNo: values.relStreetNo,
            commune: values.relCommune,
            district: values.relDistrict,
            city: values.relCity,
            country: values.relCountry,
          }) ||
          individual.relatedPerson?.address ||
          '',
        addressCountry: values.relCountry,
        addressCity: values.relCity,
        addressDistrict: values.relDistrict,
        addressCommune: values.relCommune,
        addressHomeNo: values.relHomeNo,
        addressStreetNo: values.relStreetNo,
      } : undefined,

      investorIdInfo: {
        investorIdNumber: values.investorIdNumber.trim() || individual.investorIdInfo?.investorIdNumber || 'INV-000000',
        securitiesFirm: values.securitiesFirm,
        customerReceivedBy: values.customerReceivedBy,
        applicationDate: values.applicationDate,
        dateSentToSECC: values.dateSentToSECC,
        dateReceivedFromSECC:
          values.dateReceivedFromSECC || individual.investorIdInfo?.dateReceivedFromSECC || 'Pending',
        investorIdExpiredDate:
          values.investorIdExpiredDate || individual.investorIdInfo?.investorIdExpiredDate || '2036-09-09',
        customerStatus: values.investorStatus,
      },

      tradingAccountInfo: {
        tradingAccountNumber: values.tradingAccountNumber.trim() || individual.tradingAccountInfo?.tradingAccountNumber || 'TRD-000000',
        accountDate: values.accountDate,
        accountCheckedBy: values.accountCheckedBy,
        accountApprovedBy: values.accountApprovedBy,
        email: values.email.trim(),
        currentAssignedSR: values.currentAssignedSR,
        phoneNumber: values.mobile.trim() || individual.phone,
      },

      // Update basic fields
      occupation: values.occupation.trim() || individual.occupation,
      employer: values.organizationName.trim() || individual.employer,
      address: {
        // `street` stays the composed one-line address the directory and 360 views read.
        street:
          formatAddressParts({ homeNo: values.homeNo, streetNo: values.streetNo, commune: values.commune }) ||
          individual.address?.street ||
          '',
        city: values.city || individual.address?.city || '',
        state: values.state || individual.address?.state || '',
        postalCode: individual.address?.postalCode || '',
        country: values.country || individual.address?.country || '',
        commune: values.commune,
        homeNo: values.homeNo,
        streetNo: values.streetNo,
      },
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess(updated);
    }, 400);
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'personal', label: 'Personal Information', icon: <User className="w-4 h-4" /> },
    { key: 'identification', label: 'Identification & Docs', icon: <ShieldCheck className="w-4 h-4" /> },
    { key: 'employment', label: 'Employment & Banking', icon: <Briefcase className="w-4 h-4" /> },
    { key: 'family', label: 'Family & Related Persons', icon: <Users className="w-4 h-4" /> },
    { key: 'account', label: 'Account Information', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <IndividualFormShell
      screenId="individual-update-screen"
      backLabel="Back to Individual Directory"
      onBack={onCancel}
      title="Update Individual Profile"
      badge={
        <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          {individual.customerId || individual.id}
        </span>
      }
      steps={tabs}
      activeStep={activeTab}
      onStepChange={setActiveTab}
      submitLabel="Save Updates"
      submittingLabel="Saving Changes..."
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

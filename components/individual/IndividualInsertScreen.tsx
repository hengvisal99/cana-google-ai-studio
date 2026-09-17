'use client';

import React, { useState } from 'react';
import { Individual, DesignTheme, SupportingDocument } from '@/types';
import { User, ShieldCheck, Briefcase, Users, CreditCard } from 'lucide-react';
import { IndividualFormShell } from '@/components/individual/IndividualFormShell';
import {
  IndividualFormFields,
  createEmptyFormValues,
  type IndividualFormValues,
} from '@/components/individual/form/IndividualFormFields';

interface IndividualInsertScreenProps {
  onCancel: () => void;
  onSubmitSuccess: (newIndividual: Individual) => void;
  theme: DesignTheme;
}

type TabKey = 'personal' | 'identification' | 'employment' | 'family' | 'account';

export function IndividualInsertScreen({
  onCancel,
  onSubmitSuccess,
  theme,
}: IndividualInsertScreenProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [values, setValues] = useState<IndividualFormValues>(() => createEmptyFormValues());

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

    const generatedId = `IND-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedCid = `CID-00${Math.floor(9000 + Math.random() * 1000)}`;
    const fullEN = `${values.givenNameEN.trim()} ${values.surnameEN.trim()}`;
    const fullKH = values.surnameKH.trim() && values.givenNameKH.trim() ? `${values.givenNameKH.trim()} ${values.surnameKH.trim()}` : fullEN;

    // Check if spouse information has any entered data
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

    // Check if related person has any entered data
    const hasRelatedPersonData = !!(
      values.relName.trim() ||
      values.relLatin.trim() ||
      values.relEmail.trim() ||
      values.relMobile.trim() ||
      values.relHomeNo.trim() ||
      values.relStreetNo.trim() ||
      values.relCity.trim()
    );

    const newRecord: Individual = {
      id: generatedId,
      customerId: generatedCid,
      firstName: values.givenNameEN.trim(),
      lastName: values.surnameEN.trim(),
      surnameEN: values.surnameEN.trim(),
      givenNameEN: values.givenNameEN.trim(),
      surnameKH: values.surnameKH.trim(),
      givenNameKH: values.givenNameKH.trim(),
      fullNameEN: fullEN,
      fullNameKH: fullKH,
      email: values.email.trim(),
      phone: values.mobile.trim() || '+855 12 000 000',
      mobile: values.mobile.trim() || '+855 12 000 000',
      telephone: values.telephone.trim(),
      avatarUrl: values.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
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
      taxpayerIdNumber: values.taxpayerIdNumber.trim() || `TIN-${values.idNumber.trim()}`,
      note: values.note.trim(),
      supportingDocuments: documents,

      employment: {
        occupation: values.occupation.trim() || 'Professional',
        position: values.position.trim() || 'Officer',
        typeOfBusiness: values.typeOfBusiness.trim() || 'Commercial Services',
        levelOfPosition: values.levelOfPosition,
        organizationName: values.organizationName.trim() || 'Independent Enterprise',
        lengthOfWork: values.lengthOfWork,
        officeTelephone: values.officeTelephone,
        // `organizationAddress` stays the composed one-line address the read-only views render.
        organizationAddress: formatAddressParts({
          homeNo: values.orgHomeNo,
          streetNo: values.orgStreetNo,
          commune: values.orgCommune,
          district: values.orgDistrict,
          city: values.orgCity,
          country: values.orgCountry,
        }),
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
        accountNumber: values.accountNumber.trim() || `001 ${Math.floor(100000000 + Math.random() * 900000000)}`,
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
        address: formatAddressParts({
          homeNo: values.spouseHomeNo,
          streetNo: values.spouseStreetNo,
          commune: values.spouseCommune,
          district: values.spouseDistrict,
          city: values.spouseCity,
          country: values.spouseCountry,
        }),
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
        address: formatAddressParts({
          homeNo: values.relHomeNo,
          streetNo: values.relStreetNo,
          commune: values.relCommune,
          district: values.relDistrict,
          city: values.relCity,
          country: values.relCountry,
        }),
        addressCountry: values.relCountry,
        addressCity: values.relCity,
        addressDistrict: values.relDistrict,
        addressCommune: values.relCommune,
        addressHomeNo: values.relHomeNo,
        addressStreetNo: values.relStreetNo,
      } : undefined,

      investorIdInfo: {
        investorIdNumber: values.investorIdNumber.trim() || `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        securitiesFirm: values.securitiesFirm,
        customerReceivedBy: values.customerReceivedBy,
        applicationDate: values.applicationDate,
        dateSentToSECC: values.dateSentToSECC,
        dateReceivedFromSECC: values.dateReceivedFromSECC || 'Pending',
        investorIdExpiredDate: values.investorIdExpiredDate,
        customerStatus: values.investorStatus,
      },

      tradingAccountInfo: {
        tradingAccountNumber: values.tradingAccountNumber.trim() || `TRD-${Math.floor(100000 + Math.random() * 900000)}`,
        accountDate: values.accountDate,
        accountCheckedBy: values.accountCheckedBy,
        accountApprovedBy: values.accountApprovedBy,
        email: values.email.trim(),
        currentAssignedSR: values.currentAssignedSR,
        phoneNumber: values.mobile.trim() || '+855 12 000 000',
      },

      // Initial Workflow states
      profileStatus: 'Incomplete',
      accountStatus: 'Not Opened',
      requestType: 'Registration',
      requestStatus: 'Pending',
      currentWorkflowStage: 'SR',
      authorizationHistory: [
        {
          id: `AUTH-${Date.now()}`,
          stage: 'Application Submitted — CSO',
          status: 'Submitted',
          dateTime: `${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
          processedBy: values.customerReceivedBy,
          role: 'CSO',
          comment: 'New Individual registration application initiated via CSO portal.',
        },
      ],

      // Compatibility fields
      idExpiryDate: values.expiredDate,
      kycStatus: 'pending',
      riskRating: values.riskCategory,
      category: values.customerType === 'High Net Worth' ? 'Private Banking' : values.customerType === 'Corporate Officer' ? 'Corporate Officer' : 'Retail',
      occupation: values.occupation.trim() || 'Professional',
      employer: values.organizationName.trim() || 'Independent',
      annualIncome: 120000,
      creditScore: 720,
      netWorth: 450000,
      totalDeposits: 25000,
      branch: 'Phnom Penh Central Financial (Branch 101)',
      address: {
        // `street` stays the composed one-line address the directory and 360 views read.
        street:
          formatAddressParts({ homeNo: values.homeNo, streetNo: values.streetNo, commune: values.commune }) ||
          'Street 214',
        city: values.city || 'Phnom Penh',
        state: values.state || 'Daun Penh',
        postalCode: '',
        country: values.country || 'Cambodia',
        commune: values.commune,
        homeNo: values.homeNo,
        streetNo: values.streetNo,
      },
      tags: [values.nationality, values.customerType, 'CSO Registered'],
      createdAt: new Date().toISOString().slice(0, 10),
      lastActive: 'Just now',
      relationshipManager: values.currentAssignedSR,
    };

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

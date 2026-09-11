'use client';

import React, { useState, useRef } from 'react';
import { 
  Individual, 
  DesignTheme, 
  KYCStatus, 
  RiskRating, 
  IndividualCategory,
  SupportingDocument,
  Gender,
  MaritalStatus,
  ResidencyStatus,
  CustomerType,
  EducationBackground,
  SecuritiesKnowledge,
  InvestmentExperience,
  PositionLevel,
  WorkflowStage,
  RequestStatus,
  RequestType
} from '@/types';
import { 
  ArrowLeft, 
  Save, 
  User, 
  ShieldCheck, 
  CreditCard, 
  MapPin, 
  Briefcase, 
  Users, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Upload, 
  Building,
  Calendar,
  Lock,
  Phone,
  Mail,
  HelpCircle,
  Camera,
  UploadCloud,
  FileCheck,
  Eye,
  X,
  FileImage,
  Layers,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IndividualInsertScreenProps {
  onCancel: () => void;
  onSubmitSuccess: (newIndividual: Individual) => void;
  theme: DesignTheme;
}

type TabKey = 'personal' | 'identification' | 'contact' | 'employment' | 'family' | 'account';

export function IndividualInsertScreen({
  onCancel,
  onSubmitSuccess,
  theme,
}: IndividualInsertScreenProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab 1: Personal Information
  const [surnameEN, setSurnameEN] = useState('');
  const [givenNameEN, setGivenNameEN] = useState('');
  const [surnameKH, setSurnameKH] = useState('');
  const [givenNameKH, setGivenNameKH] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1990-01-15');
  const [gender, setGender] = useState<Gender>('Male');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('Single');
  const [nationality, setNationality] = useState('Cambodian');
  const [customerType, setCustomerType] = useState<CustomerType>('Retail');
  const [educationBackground, setEducationBackground] = useState<EducationBackground>("Bachelor's");
  const [securitiesKnowledge, setSecuritiesKnowledge] = useState<SecuritiesKnowledge>('Intermediate');
  const [riskCategory, setRiskCategory] = useState<RiskRating>('moderate');
  const [investmentExperience, setInvestmentExperience] = useState<InvestmentExperience>('3 - 5 years');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Tab 2: Identification & Residency
  const [residency, setResidency] = useState<ResidencyStatus>('Resident');
  const [idType, setIdType] = useState<'National ID' | 'Passport' | 'Driver License' | 'Government ID' | 'Tax ID'>('National ID');
  const [idNumber, setIdNumber] = useState('');
  const [issuedBy, setIssuedBy] = useState('General Department of Identification');
  const [issuedDate, setIssuedDate] = useState('2022-01-10');
  const [expiredDate, setExpiredDate] = useState('2032-01-10');
  const [taxpayerIdNumber, setTaxpayerIdNumber] = useState('');
  const [documents, setDocuments] = useState<SupportingDocument[]>([
    {
      id: 'DOC-NEW-1',
      type: 'Account Specimen',
      fileName: 'Signature_Specimen_Card.pdf',
      fileSize: '1.2 MB',
      uploadedAt: '2026-09-09',
    },
    {
      id: 'DOC-NEW-2',
      type: 'ID Card / Passport',
      fileName: 'Identification_Card_Copy.pdf',
      fileSize: '2.5 MB',
      uploadedAt: '2026-09-09',
    },
  ]);

  // Tab 2: Supporting Documents Dropzone states & inputs
  const [isDraggingSpecimen, setIsDraggingSpecimen] = useState(false);
  const [isDraggingIdDoc, setIsDraggingIdDoc] = useState(false);
  const [isDraggingOtherDoc, setIsDraggingOtherDoc] = useState(false);
  const [otherDocType, setOtherDocType] = useState<string>('Proof of Residential Address');
  const [otherDocRemark, setOtherDocRemark] = useState<string>('');

  const specimenInputRef = useRef<HTMLInputElement>(null);
  const idDocInputRef = useRef<HTMLInputElement>(null);
  const otherDocInputRef = useRef<HTMLInputElement>(null);

  // Tab 3: Contact & Address
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [telephone, setTelephone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Phnom Penh');
  const [state, setState] = useState('Daun Penh');
  const [postalCode, setPostalCode] = useState('120201');
  const [country, setCountry] = useState('Cambodia');

  // Tab 4: Employment & Banking
  const [occupation, setOccupation] = useState('');
  const [position, setPosition] = useState('');
  const [typeOfBusiness, setTypeOfBusiness] = useState('');
  const [levelOfPosition, setLevelOfPosition] = useState<PositionLevel>('Senior');
  const [organizationName, setOrganizationName] = useState('');
  const [lengthOfWork, setLengthOfWork] = useState('3 years');
  const [officeTelephone, setOfficeTelephone] = useState('');
  const [organizationAddress, setOrganizationAddress] = useState('');

  const [bankName, setBankName] = useState('ABA Bank Plc');
  const [accountOwner, setAccountOwner] = useState('');
  const [savingAccount, setSavingAccount] = useState('Premier Savings Account');
  const [accountNumber, setAccountNumber] = useState('');

  // Tab 5: Family & Related Persons (No checkbox required - always editable)
  const [spouseName, setSpouseName] = useState('');
  const [spouseLatin, setSpouseLatin] = useState('');
  const [spouseEmail, setSpouseEmail] = useState('');
  const [spouseYearWork, setSpouseYearWork] = useState('2020');
  const [spouseRelationship, setSpouseRelationship] = useState('Spouse');
  const [spouseOccupation, setSpouseOccupation] = useState('');
  const [spousePosition, setSpousePosition] = useState('');
  const [spouseBusiness, setSpouseBusiness] = useState('');
  const [spouseMobile, setSpouseMobile] = useState('');
  const [spouseOfficePhone, setSpouseOfficePhone] = useState('');
  const [spouseAddress, setSpouseAddress] = useState('');

  const [relName, setRelName] = useState('');
  const [relLatin, setRelLatin] = useState('');
  const [relEmail, setRelEmail] = useState('');
  const [relGender, setRelGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [relRelationship, setRelRelationship] = useState('Sibling');
  const [relMobile, setRelMobile] = useState('');
  const [relAddress, setRelAddress] = useState('');

  // Tab 6: Account Information
  const [investorIdNumber, setInvestorIdNumber] = useState('');
  const [securitiesFirm, setSecuritiesFirm] = useState('Nexus Securities Plc');
  const [customerReceivedBy, setCustomerReceivedBy] = useState('Sophea Keo (CSO)');
  const [applicationDate, setApplicationDate] = useState('2026-09-09');
  const [dateSentToSECC, setDateSentToSECC] = useState('2026-09-10');
  const [investorStatus, setInvestorStatus] = useState<'Normal' | 'VIP' | 'Restricted'>('Normal');

  const [tradingAccountNumber, setTradingAccountNumber] = useState('');
  const [accountDate, setAccountDate] = useState('2026-09-15');
  const [accountCheckedBy, setAccountCheckedBy] = useState('Dara Vong (SR)');
  const [accountApprovedBy, setAccountApprovedBy] = useState('Vannak Lim (Manager)');
  const [currentAssignedSR, setCurrentAssignedSR] = useState('Dara Vong (SR)');

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Photo Upload Handler (Local file to Data URL with preview)
  const handlePhotoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarUrl(result);
    };
    reader.readAsDataURL(file);
  };

  // Supporting Document Upload Handler (Single file per category)
  const handleFileUpload = (
    files: FileList | File[],
    docType: 'Account Specimen' | 'ID Card / Passport' | 'Other',
    customRemark?: string
  ) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const file = fileArray[0];
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    const newDoc: SupportingDocument = {
      id: `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: docType,
      fileName: file.name,
      fileSize: formattedSize,
      uploadedAt: new Date().toISOString().slice(0, 10),
      remark:
        customRemark ||
        (docType === 'Account Specimen'
          ? 'Account signature specimen document'
          : docType === 'ID Card / Passport'
          ? 'Official identity card / passport copy'
          : `${otherDocType} supporting document`),
    };

    // One file one upload only: replace any existing document of this type
    setDocuments((prev) => [...prev.filter((d) => d.type !== docType), newDoc]);
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!givenNameEN.trim()) newErrors.givenNameEN = 'Given Name in English is required';
    if (!surnameEN.trim()) newErrors.surnameEN = 'Surname in English is required';
    if (!email.trim()) newErrors.email = 'Email address is required';
    if (!idNumber.trim()) newErrors.idNumber = 'ID Number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Auto switch to personal tab if error is there
      if (newErrors.givenNameEN || newErrors.surnameEN) {
        setActiveTab('personal');
      } else if (newErrors.idNumber) {
        setActiveTab('identification');
      } else if (newErrors.email) {
        setActiveTab('contact');
      }
      return;
    }

    setIsSubmitting(true);

    const generatedId = `IND-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedCid = `CID-00${Math.floor(9000 + Math.random() * 1000)}`;
    const fullEN = `${givenNameEN.trim()} ${surnameEN.trim()}`;
    const fullKH = surnameKH.trim() && givenNameKH.trim() ? `${givenNameKH.trim()} ${surnameKH.trim()}` : fullEN;

    // Check if spouse information has any entered data
    const hasSpouseData = !!(
      spouseName.trim() ||
      spouseLatin.trim() ||
      spouseEmail.trim() ||
      spouseOccupation.trim() ||
      spousePosition.trim() ||
      spouseBusiness.trim() ||
      spouseMobile.trim() ||
      spouseAddress.trim()
    );

    // Check if related person has any entered data
    const hasRelatedPersonData = !!(
      relName.trim() ||
      relLatin.trim() ||
      relEmail.trim() ||
      relMobile.trim() ||
      relAddress.trim()
    );

    const newRecord: Individual = {
      id: generatedId,
      customerId: generatedCid,
      firstName: givenNameEN.trim(),
      lastName: surnameEN.trim(),
      surnameEN: surnameEN.trim(),
      givenNameEN: givenNameEN.trim(),
      surnameKH: surnameKH.trim(),
      givenNameKH: givenNameKH.trim(),
      fullNameEN: fullEN,
      fullNameKH: fullKH,
      email: email.trim(),
      phone: mobile.trim() || '+855 12 000 000',
      mobile: mobile.trim() || '+855 12 000 000',
      telephone: telephone.trim(),
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      dateOfBirth,
      gender,
      maritalStatus,
      nationality,

      securitiesKnowledge,
      riskCategory,
      investmentExperience,
      customerType,
      educationBackground,

      residency,
      idType,
      idNumber: idNumber.trim(),
      issuedBy: issuedBy.trim(),
      issuedDate,
      expiredDate,
      taxpayerIdNumber: taxpayerIdNumber.trim() || `TIN-${idNumber.trim()}`,
      supportingDocuments: documents,

      employment: {
        occupation: occupation.trim() || 'Professional',
        position: position.trim() || 'Officer',
        typeOfBusiness: typeOfBusiness.trim() || 'Commercial Services',
        levelOfPosition,
        organizationName: organizationName.trim() || 'Independent Enterprise',
        lengthOfWork,
        officeTelephone,
        organizationAddress,
      },

      banking: {
        bankName,
        accountOwner: accountOwner.trim() || fullEN.toUpperCase(),
        savingAccount,
        accountNumber: accountNumber.trim() || `001 ${Math.floor(100000000 + Math.random() * 900000000)}`,
      },

      spouse: hasSpouseData ? {
        fullName: spouseName,
        latin: spouseLatin || spouseName,
        email: spouseEmail,
        yearOfEmployment: spouseYearWork,
        relationship: spouseRelationship,
        occupation: spouseOccupation,
        position: spousePosition,
        typeOfBusiness: spouseBusiness,
        mobile: spouseMobile,
        officeTelephone: spouseOfficePhone,
        address: spouseAddress,
      } : undefined,

      relatedPerson: hasRelatedPersonData ? {
        fullName: relName,
        latin: relLatin || relName,
        email: relEmail,
        gender: relGender,
        relationship: relRelationship,
        mobile: relMobile,
        address: relAddress,
      } : undefined,

      investorIdInfo: {
        investorIdNumber: investorIdNumber.trim() || `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        securitiesFirm,
        customerReceivedBy,
        applicationDate,
        dateSentToSECC,
        dateReceivedFromSECC: 'Pending',
        investorIdExpiredDate: '2036-09-09',
        customerStatus: investorStatus,
      },

      tradingAccountInfo: {
        tradingAccountNumber: tradingAccountNumber.trim() || `TRD-${Math.floor(100000 + Math.random() * 900000)}`,
        accountDate,
        accountCheckedBy,
        accountApprovedBy,
        email: email.trim(),
        currentAssignedSR,
        phoneNumber: mobile.trim() || '+855 12 000 000',
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
          processedBy: customerReceivedBy,
          role: 'CSO',
          comment: 'New Individual registration application initiated via CSO portal.',
        },
      ],

      // Compatibility fields
      idExpiryDate: expiredDate,
      kycStatus: 'pending',
      riskRating: riskCategory,
      category: customerType === 'High Net Worth' ? 'Private Banking' : customerType === 'Corporate Officer' ? 'Corporate Officer' : 'Retail',
      occupation: occupation.trim() || 'Professional',
      employer: organizationName.trim() || 'Independent',
      annualIncome: 120000,
      creditScore: 720,
      netWorth: 450000,
      totalDeposits: 25000,
      branch: 'Phnom Penh Central Financial (Branch 101)',
      address: {
        street: street || 'Street 214',
        city: city || 'Phnom Penh',
        state: state || 'Daun Penh',
        postalCode: postalCode || '120201',
        country: country || 'Cambodia',
      },
      tags: [nationality, customerType, 'CSO Registered'],
      createdAt: new Date().toISOString().slice(0, 10),
      lastActive: 'Just now',
      relationshipManager: currentAssignedSR,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess(newRecord);
    }, 400);
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'personal', label: 'Personal Information', icon: <User className="w-4 h-4" /> },
    { key: 'identification', label: 'Identification & Docs', icon: <ShieldCheck className="w-4 h-4" /> },
    { key: 'contact', label: 'Contact & Address', icon: <MapPin className="w-4 h-4" /> },
    { key: 'employment', label: 'Employment & Banking', icon: <Briefcase className="w-4 h-4" /> },
    { key: 'family', label: 'Family & Related Persons', icon: <Users className="w-4 h-4" /> },
    { key: 'account', label: 'Account Information', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div id="individual-insert-screen" className="space-y-5 pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/70">
        <div className="space-y-1">
          <button
            id="btn-insert-back-to-list"
            onClick={onCancel}
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Individual Directory</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Insert Individual Customer
          </h1>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button
            id="btn-insert-save-submit"
            type="button"
            onClick={handleFormSubmit}
            disabled={isSubmitting}
            className={cn(
              'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-xs shrink-0 active:scale-[0.98]',
              theme === 'glassmorphism'
                ? 'rounded-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20'
                : theme === 'aurora'
                ? 'rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25'
                : 'rounded-xl bg-blue-600 hover:bg-blue-700 shadow-xs hover:shadow-sm'
            )}
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting Registration...' : 'Save & Submit'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Stepper */}
      <div className={cn(
        'bg-white border border-slate-200 p-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none',
        theme === 'glassmorphism' ? 'rounded-2xl bg-white/80 backdrop-blur-md border-white/80 shadow-xs' : 'rounded-xl shadow-xs'
      )}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 text-xs rounded-lg transition-all shrink-0 select-none',
                isActive
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Form Content Container */}
      <form onSubmit={handleFormSubmit}>
        <div className={cn(
          'p-6 bg-white border border-slate-200 space-y-6',
          theme === 'glassmorphism' ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-md' : 'rounded-xl shadow-xs'
        )}>
          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Personal Information</span>
                </h2>
              </div>

              {/* Customer Profile Photo Upload & Quick Identity Profile without outer card */}
              <div className="pt-1">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(file);
                  }}
                />

                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Left Column: Photo Upload / Preview */}
                  <div className="w-32 sm:w-36 shrink-0 flex flex-col items-center">
                    {avatarUrl ? (
                      <div className="flex flex-col items-center gap-2.5 p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs w-full">
                        <div className="relative group/avatar shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={avatarUrl}
                            alt="Customer Portrait Preview"
                            className="w-24 h-24 rounded-xl object-cover border border-slate-200 shadow-xs"
                          />
                        </div>
                        <div className="w-full text-center">
                          <h4 className="text-[11px] font-bold text-slate-800">Portrait Loaded</h4>
                          <div className="flex items-center justify-center gap-1.5 mt-1.5">
                            <button
                              type="button"
                              onClick={() => photoInputRef.current?.click()}
                              className="px-2 py-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAvatarUrl('');
                                if (photoInputRef.current) photoInputRef.current.value = '';
                              }}
                              className="px-2 py-0.5 text-[10px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center">
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingPhoto(true);
                          }}
                          onDragLeave={() => setIsDraggingPhoto(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingPhoto(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handlePhotoUpload(file);
                          }}
                          onClick={() => photoInputRef.current?.click()}
                          className={cn(
                            'w-full h-32 sm:h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 bg-white group shadow-2xs',
                            isDraggingPhoto
                              ? 'border-blue-500 bg-blue-50/60'
                              : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 text-slate-500'
                          )}
                        >
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-1.5 group-hover:scale-105 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                            <Camera className="w-4.5 h-4.5 stroke-[1.75]" />
                          </div>
                          <span className="text-[10px] font-bold tracking-wider text-slate-700 group-hover:text-blue-600 transition-colors uppercase">
                            UPLOAD
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium text-center">
                          JPG or PNG, up to 5 MB
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Side Fields: Customer Type, Investor Status, Risk Rating & Mobile */}
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Customer Type *
                      </label>
                      <select
                        value={customerType}
                        onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Retail">Retail Investor</option>
                        <option value="Corporate">Corporate Investor</option>
                        <option value="Institutional">Institutional Investor</option>
                        <option value="HNW">High Net Worth (HNW)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Investor Status *
                      </label>
                      <select
                        value={investorStatus}
                        onChange={(e) => setInvestorStatus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Normal">Normal Status</option>
                        <option value="VIP">VIP Investor</option>
                        <option value="Restricted">Restricted</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Risk Rating Category *
                      </label>
                      <select
                        value={riskCategory}
                        onChange={(e) => setRiskCategory(e.target.value as RiskRating)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="conservative">Conservative</option>
                        <option value="moderate">Moderate</option>
                        <option value="aggressive">Aggressive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Mobile Phone Number *
                      </label>
                      <input
                        type="text"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="e.g. +855 12 345 678"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Name Fields (EN & KH) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Surname (English) *
                  </label>
                  <input
                    type="text"
                    value={surnameEN}
                    onChange={(e) => setSurnameEN(e.target.value)}
                    placeholder="e.g. Vance"
                    className={cn(
                      'w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500',
                      errors.surnameEN ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                    )}
                  />
                  {errors.surnameEN && <p className="text-[10px] text-rose-600 mt-1">{errors.surnameEN}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Given Name (English) *
                  </label>
                  <input
                    type="text"
                    value={givenNameEN}
                    onChange={(e) => setGivenNameEN(e.target.value)}
                    placeholder="e.g. Eleanor"
                    className={cn(
                      'w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500',
                      errors.givenNameEN ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                    )}
                  />
                  {errors.givenNameEN && <p className="text-[10px] text-rose-600 mt-1">{errors.givenNameEN}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Surname (Khmer)
                  </label>
                  <input
                    type="text"
                    value={surnameKH}
                    onChange={(e) => setSurnameKH(e.target.value)}
                    placeholder="ត្រកូលជាភាសាខ្មែរ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Given Name (Khmer)
                  </label>
                  <input
                    type="text"
                    value={givenNameKH}
                    onChange={(e) => setGivenNameKH(e.target.value)}
                    placeholder="នាមជាភាសាខ្មែរ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Demographics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Marital Status
                  </label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="e.g. Cambodian, British..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Investor Profile & Categorization */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  Investor Profile & Appropriateness
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Customer Type
                    </label>
                    <select
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Retail">Retail Investor</option>
                      <option value="Corporate Officer">Corporate Officer</option>
                      <option value="High Net Worth">High Net Worth (HNW)</option>
                      <option value="Institutional">Institutional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Education Background
                    </label>
                    <select
                      value={educationBackground}
                      onChange={(e) => setEducationBackground(e.target.value as EducationBackground)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="High School">High School</option>
                      <option value="Bachelor's">Bachelor&apos;s Degree</option>
                      <option value="Master's">Master&apos;s Degree</option>
                      <option value="Doctorate">Doctorate / Ph.D.</option>
                      <option value="Other">Other Professional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Securities Knowledge
                    </label>
                    <select
                      value={securitiesKnowledge}
                      onChange={(e) => setSecuritiesKnowledge(e.target.value as SecuritiesKnowledge)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="None">None</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Professional">Professional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Risk Category
                    </label>
                    <select
                      value={riskCategory}
                      onChange={(e) => setRiskCategory(e.target.value as RiskRating)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="low">Low Risk (Capital Preservation)</option>
                      <option value="moderate">Moderate Risk (Balanced Growth)</option>
                      <option value="high">High Risk (Aggressive Capital Appreciation)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Investment Experience
                    </label>
                    <select
                      value={investmentExperience}
                      onChange={(e) => setInvestmentExperience(e.target.value as InvestmentExperience)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="< 1 year">&lt; 1 year</option>
                      <option value="1 - 3 years">1 - 3 years</option>
                      <option value="3 - 5 years">3 - 5 years</option>
                      <option value="5+ years">5+ years</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IDENTIFICATION & RESIDENCY */}
          {activeTab === 'identification' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Identification & Supporting Documents</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Residency *
                  </label>
                  <select
                    value={residency}
                    onChange={(e) => setResidency(e.target.value as ResidencyStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Resident">Resident</option>
                    <option value="Non-Resident">Non-Resident</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ID Type *
                  </label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="National ID">National ID Card</option>
                    <option value="Passport">International Passport</option>
                    <option value="Driver License">Driver License</option>
                    <option value="Government ID">Government ID</option>
                    <option value="Tax ID">Tax ID Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ID Number *
                  </label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="e.g. KHM-019829381"
                    className={cn(
                      'w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 font-mono',
                      errors.idNumber ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                    )}
                  />
                  {errors.idNumber && <p className="text-[10px] text-rose-600 mt-1">{errors.idNumber}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Issued By
                  </label>
                  <input
                    type="text"
                    value={issuedBy}
                    onChange={(e) => setIssuedBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Issued Date
                  </label>
                  <input
                    type="date"
                    value={issuedDate}
                    onChange={(e) => setIssuedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Expired Date
                  </label>
                  <input
                    type="date"
                    value={expiredDate}
                    onChange={(e) => setExpiredDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Taxpayer ID Number (TIN)
                  </label>
                  <input
                    type="text"
                    value={taxpayerIdNumber}
                    onChange={(e) => setTaxpayerIdNumber(e.target.value)}
                    placeholder="e.g. TIN-889102941"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Supporting Documents Section with Integrated Card Upload UI */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Supporting Documents
                  </span>
                  {documents.length > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {documents.length} / 3 uploaded
                    </span>
                  )}
                </div>

                {/* Hidden File Inputs (single file selection) */}
                <input
                  ref={specimenInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files, 'Account Specimen');
                      e.target.value = '';
                    }
                  }}
                />
                <input
                  ref={idDocInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files, 'ID Card / Passport');
                      e.target.value = '';
                    }
                  }}
                />
                <input
                  ref={otherDocInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files, 'Other', otherDocRemark);
                      e.target.value = '';
                    }
                  }}
                />

                {/* 3 Unified Cards Grid (One file one upload only) */}
                {(() => {
                  const specimenDoc = documents.find((d) => d.type === 'Account Specimen');
                  const idDoc = documents.find((d) => d.type === 'ID Card / Passport');
                  const otherDoc = documents.find((d) => d.type === 'Other');

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 1. Account Specimen Card */}
                      <div>
                        {!specimenDoc ? (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDraggingSpecimen(true);
                            }}
                            onDragLeave={() => setIsDraggingSpecimen(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDraggingSpecimen(false);
                              if (e.dataTransfer.files) {
                                handleFileUpload(e.dataTransfer.files, 'Account Specimen');
                              }
                            }}
                            onClick={() => specimenInputRef.current?.click()}
                            className={cn(
                              'border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 group relative h-44',
                              isDraggingSpecimen
                                ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                                : 'border-slate-200 bg-white hover:bg-slate-50/70 hover:border-blue-400'
                            )}
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-105 group-hover:bg-blue-100 transition-all">
                              <FileCheck className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800 mb-2">Account Specimen</span>
                            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-blue-600 shadow-2xs group-hover:border-blue-300">
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Upload Specimen</span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-2.5 font-medium">PDF, JPG, PNG (Max 10MB)</span>
                          </div>
                        ) : (
                          <div className="h-44 p-4 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all">
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-slate-900 truncate text-xs" title={specimenDoc.fileName}>
                                    {specimenDoc.fileName}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                      Account Specimen
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">{specimenDoc.fileSize}</span>
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(specimenDoc.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer shrink-0"
                                title="Delete document"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Attached</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => specimenInputRef.current?.click()}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 border border-slate-200 rounded-lg transition cursor-pointer"
                              >
                                <UploadCloud className="w-3 h-3" />
                                <span>Replace</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2. ID / Passport Card */}
                      <div>
                        {!idDoc ? (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDraggingIdDoc(true);
                            }}
                            onDragLeave={() => setIsDraggingIdDoc(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDraggingIdDoc(false);
                              if (e.dataTransfer.files) {
                                handleFileUpload(e.dataTransfer.files, 'ID Card / Passport');
                              }
                            }}
                            onClick={() => idDocInputRef.current?.click()}
                            className={cn(
                              'border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 group relative h-44',
                              isDraggingIdDoc
                                ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                                : 'border-slate-200 bg-white hover:bg-slate-50/70 hover:border-emerald-400'
                            )}
                          >
                            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-105 group-hover:bg-emerald-100 transition-all">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800 mb-2">ID / Passport</span>
                            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-emerald-600 shadow-2xs group-hover:border-emerald-300">
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Upload ID / Passport</span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-2.5 font-medium">PDF, JPG, PNG (Max 10MB)</span>
                          </div>
                        ) : (
                          <div className="h-44 p-4 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all">
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                  <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-slate-900 truncate text-xs" title={idDoc.fileName}>
                                    {idDoc.fileName}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                      ID / Passport
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">{idDoc.fileSize}</span>
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(idDoc.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer shrink-0"
                                title="Delete document"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Attached</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => idDocInputRef.current?.click()}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/80 border border-slate-200 rounded-lg transition cursor-pointer"
                              >
                                <UploadCloud className="w-3 h-3" />
                                <span>Replace</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. Other Supporting Documents Card */}
                      <div>
                        {!otherDoc ? (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDraggingOtherDoc(true);
                            }}
                            onDragLeave={() => setIsDraggingOtherDoc(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDraggingOtherDoc(false);
                              if (e.dataTransfer.files) {
                                handleFileUpload(e.dataTransfer.files, 'Other');
                              }
                            }}
                            onClick={() => otherDocInputRef.current?.click()}
                            className={cn(
                              'border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 group relative h-44',
                              isDraggingOtherDoc
                                ? 'border-purple-500 bg-purple-50/70 shadow-xs'
                                : 'border-slate-200 bg-white hover:bg-slate-50/70 hover:border-purple-400'
                            )}
                          >
                            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-105 group-hover:bg-purple-100 transition-all">
                              <FileText className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800 mb-2">Other Supporting Docs</span>
                            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-purple-600 shadow-2xs group-hover:border-purple-300">
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Upload Supporting Doc</span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-2.5 font-medium">PDF, JPG, PNG (Max 10MB)</span>
                          </div>
                        ) : (
                          <div className="h-44 p-4 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all">
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-slate-900 truncate text-xs" title={otherDoc.fileName}>
                                    {otherDoc.fileName}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                                      Other Supporting Doc
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">{otherDoc.fileSize}</span>
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(otherDoc.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer shrink-0"
                                title="Delete document"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Attached</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => otherDocInputRef.current?.click()}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-purple-600 hover:bg-purple-50/80 border border-slate-200 rounded-lg transition cursor-pointer"
                              >
                                <UploadCloud className="w-3 h-3" />
                                <span>Replace</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT & ADDRESS */}
          {activeTab === 'contact' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Contact Information & Residential Address</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@domain.com"
                      className={cn(
                        'w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-slate-800 focus:bg-white',
                        errors.email ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                      )}
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-rose-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mobile Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+855 12 000 000"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Telephone (Fixed Line)
                  </label>
                  <input
                    type="text"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+855 23 000 000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              {/* Address details */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  Residential Address
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. No. 450, Preah Monivong Blvd, Sangkat Boeung Keng Kang"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      State / Khan / Province
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EMPLOYMENT & BANKING */}
          {activeTab === 'employment' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>Employment & Banking Information</span>
                </h2>
              </div>

              {/* Employment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Managing Director"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Position / Title</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g. Founder & CEO"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Type of Business</label>
                  <input
                    type="text"
                    value={typeOfBusiness}
                    onChange={(e) => setTypeOfBusiness(e.target.value)}
                    placeholder="e.g. Technology & Logistics"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Level of Position</label>
                  <select
                    value={levelOfPosition}
                    onChange={(e) => setLevelOfPosition(e.target.value as PositionLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="Staff">Staff / Associate</option>
                    <option value="Senior">Senior Specialist</option>
                    <option value="Manager">Manager / Dept Head</option>
                    <option value="Executive / C-Level">Executive / C-Level / Director</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Organization / Employer Name</label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="e.g. Vance Robotics Corp Ltd"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Length of Work</label>
                  <input
                    type="text"
                    value={lengthOfWork}
                    onChange={(e) => setLengthOfWork(e.target.value)}
                    placeholder="e.g. 5 years"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Office Telephone</label>
                  <input
                    type="text"
                    value={officeTelephone}
                    onChange={(e) => setOfficeTelephone(e.target.value)}
                    placeholder="+855 23 881 990"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Organization Address</label>
                  <input
                    type="text"
                    value={organizationAddress}
                    onChange={(e) => setOrganizationAddress(e.target.value)}
                    placeholder="e.g. Exchange Square, Level 14, St 106, Phnom Penh"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Designated Bank Account */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  Designated Settlement Bank Account
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank Name</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    >
                      <option value="ABA Bank Plc">ABA Bank Plc</option>
                      <option value="Canadia Bank Plc">Canadia Bank Plc</option>
                      <option value="ACLEDA Bank Plc">ACLEDA Bank Plc</option>
                      <option value="Foreign Commercial Bank">Foreign Commercial Bank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Account Owner Name</label>
                    <input
                      type="text"
                      value={accountOwner}
                      onChange={(e) => setAccountOwner(e.target.value)}
                      placeholder="ELEANOR VANCE"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Saving / Account Type</label>
                    <input
                      type="text"
                      value={savingAccount}
                      onChange={(e) => setSavingAccount(e.target.value)}
                      placeholder="Premier Savings"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="001 982 441 902"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAMILY & RELATED PERSONS */}
          {activeTab === 'family' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Family & Related Persons</span>
                </h2>
              </div>

              {/* Spouse Section - Always visible */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Spouse Information
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Optional (Provide if legally married)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name (English / Khmer)</label>
                    <input
                      type="text"
                      value={spouseName}
                      onChange={(e) => setSpouseName(e.target.value)}
                      placeholder="e.g. Julian Vance"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Latin Name</label>
                    <input
                      type="text"
                      value={spouseLatin}
                      onChange={(e) => setSpouseLatin(e.target.value)}
                      placeholder="e.g. Julian Vance"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={spouseRelationship}
                      onChange={(e) => setSpouseRelationship(e.target.value)}
                      placeholder="Spouse / Partner"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={spouseEmail}
                      onChange={(e) => setSpouseEmail(e.target.value)}
                      placeholder="spouse@techinvest.kh"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Mobile Phone</label>
                    <input
                      type="text"
                      value={spouseMobile}
                      onChange={(e) => setSpouseMobile(e.target.value)}
                      placeholder="+855 12 887 651"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Office Telephone</label>
                    <input
                      type="text"
                      value={spouseOfficePhone}
                      onChange={(e) => setSpouseOfficePhone(e.target.value)}
                      placeholder="+855 23 881 992"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Occupation</label>
                    <input
                      type="text"
                      value={spouseOccupation}
                      onChange={(e) => setSpouseOccupation(e.target.value)}
                      placeholder="e.g. Architect"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Position / Title</label>
                    <input
                      type="text"
                      value={spousePosition}
                      onChange={(e) => setSpousePosition(e.target.value)}
                      placeholder="e.g. Partner"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Type of Business</label>
                    <input
                      type="text"
                      value={spouseBusiness}
                      onChange={(e) => setSpouseBusiness(e.target.value)}
                      placeholder="e.g. Architecture & Design"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Residential / Working Address</label>
                    <input
                      type="text"
                      value={spouseAddress}
                      onChange={(e) => setSpouseAddress(e.target.value)}
                      placeholder="e.g. No. 42B, Street 310, Boeung Keng Kang 1, Phnom Penh"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Related Person Section - Always visible */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Related Person / Emergency Contact
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Optional (Designated emergency or affiliate party)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={relName}
                      onChange={(e) => setRelName(e.target.value)}
                      placeholder="e.g. Sokha Vance"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Latin Name</label>
                    <input
                      type="text"
                      value={relLatin}
                      onChange={(e) => setRelLatin(e.target.value)}
                      placeholder="e.g. Sokha Vance"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Gender</label>
                    <select
                      value={relGender}
                      onChange={(e) => setRelGender(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={relRelationship}
                      onChange={(e) => setRelRelationship(e.target.value)}
                      placeholder="e.g. Sibling / Business Partner / Parent"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Mobile Phone</label>
                    <input
                      type="text"
                      value={relMobile}
                      onChange={(e) => setRelMobile(e.target.value)}
                      placeholder="+855 17 992 001"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={relEmail}
                      onChange={(e) => setRelEmail(e.target.value)}
                      placeholder="sokha.vance@gmail.com"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Residential Address</label>
                    <input
                      type="text"
                      value={relAddress}
                      onChange={(e) => setRelAddress(e.target.value)}
                      placeholder="e.g. Building 12, Street 200, Daun Penh, Phnom Penh"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ACCOUNT INFORMATION */}
          {activeTab === 'account' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Account Information (Investor ID & Trading Account)</span>
                </h2>
              </div>

              {/* Investor ID info */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Investor ID Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Investor ID Number</label>
                    <input
                      type="text"
                      value={investorIdNumber}
                      onChange={(e) => setInvestorIdNumber(e.target.value)}
                      placeholder="INV-882910 (Auto-generated if blank)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Securities Firm</label>
                    <input
                      type="text"
                      value={securitiesFirm}
                      onChange={(e) => setSecuritiesFirm(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Customer Received By (CSO)</label>
                    <input
                      type="text"
                      value={customerReceivedBy}
                      onChange={(e) => setCustomerReceivedBy(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Customer Status</label>
                    <select
                      value={investorStatus}
                      onChange={(e) => setInvestorStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    >
                      <option value="Normal">Normal</option>
                      <option value="VIP">VIP</option>
                      <option value="Restricted">Restricted</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Application Date</label>
                    <input
                      type="date"
                      value={applicationDate}
                      onChange={(e) => setApplicationDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Date Sent to SECC</label>
                    <input
                      type="date"
                      value={dateSentToSECC}
                      onChange={(e) => setDateSentToSECC(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Trading Account info */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Trading Account Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Trading Account Number</label>
                    <input
                      type="text"
                      value={tradingAccountNumber}
                      onChange={(e) => setTradingAccountNumber(e.target.value)}
                      placeholder="TRD-770192 (Auto-assigned)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Account Opening Date</label>
                    <input
                      type="date"
                      value={accountDate}
                      onChange={(e) => setAccountDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned SR</label>
                    <input
                      type="text"
                      value={currentAssignedSR}
                      onChange={(e) => setCurrentAssignedSR(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Bottom Bar with Next/Back and Submit */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <div>
              {activeTab !== 'personal' && (
                <button
                  type="button"
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.key === activeTab);
                    if (idx > 0) setActiveTab(tabs[idx - 1].key);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  ← Previous Section
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {activeTab !== 'account' ? (
                <button
                  type="button"
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.key === activeTab);
                    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].key);
                  }}
                  className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg"
                >
                  Next Section →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  {isSubmitting ? 'Submitting Registration...' : 'Complete & Save Individual'}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

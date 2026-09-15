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
  SlidersHorizontal,
  ArrowRight,
  ChevronRight,
  Check,
  BadgeCheck,
  CheckCircle,
  Clock,
  Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Arrow-shaped step segment: notched on the left (except first), pointed on the right (except last).
const STEP_NOTCH = 14;
const stepClipPath = (idx: number, count: number) => {
  const right =
    idx === count - 1
      ? '100% 0, 100% 100%'
      : `calc(100% - ${STEP_NOTCH}px) 0, 100% 50%, calc(100% - ${STEP_NOTCH}px) 100%`;
  const left = idx === 0 ? '0 100%' : `0 100%, ${STEP_NOTCH}px 50%`;
  return `polygon(0 0, ${right}, ${left})`;
};

interface IndividualInsertScreenProps {
  onCancel: () => void;
  onSubmitSuccess: (newIndividual: Individual) => void;
  theme: DesignTheme;
}

type TabKey = 'personal' | 'identification' | 'contact' | 'employment' | 'family' | 'account';

/** Extension badge colour on the file tile (PDF red, Word blue, anything else gray). */
function extBadgeClass(ext: string) {
  if (ext === 'PDF') return 'bg-rose-500';
  if (ext === 'DOC' || ext === 'DOCX') return 'bg-blue-500';
  return 'bg-slate-500';
}

/**
 * An uploaded document in its slot, the same height as the empty upload card:
 * preview on top (thumbnail for images, file tile otherwise) with the slot name and a
 * corner ×, then the file name with a Replace action.
 */
function AttachedDocCard({
  label,
  doc,
  onReplace,
  onRemove,
}: {
  label: string;
  doc: SupportingDocument;
  onReplace: () => void;
  onRemove: () => void;
}) {
  const ext = doc.fileName.includes('.') ? doc.fileName.split('.').pop()!.toUpperCase() : 'FILE';

  return (
    <div className="flex h-44 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition hover:border-slate-300">
      <div className="relative min-h-0 flex-1 bg-slate-50">
        {doc.fileUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={doc.fileUrl} alt={doc.fileName} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center">
            <div className="relative flex h-14 w-11 flex-col items-center justify-end rounded-md border border-slate-200 bg-white pb-1.5 shadow-2xs">
              <FileText className="absolute top-2 h-4 w-4 text-slate-300" />
              <span className={cn('rounded px-1 text-[9px] font-bold leading-4 text-white', extBadgeClass(ext))}>
                {ext}
              </span>
            </div>
          </div>
        )}

        <span className="absolute left-2 top-2 inline-flex max-w-[calc(100%-3rem)] items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow-2xs ring-1 ring-slate-200/70 backdrop-blur-sm">
          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
          <span className="truncate">{label}</span>
        </span>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          title="Remove document"
          className="absolute right-2 top-2 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-slate-900/60 text-white backdrop-blur-sm transition hover:bg-slate-900/80"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-slate-900" title={doc.fileName}>
            {doc.fileName}
          </p>
        </div>
        <button
          type="button"
          onClick={onReplace}
          className="inline-flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <UploadCloud className="h-3.5 w-3.5" />
          Replace
        </button>
      </div>
    </div>
  );
}

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
      // Local preview so image uploads can show a thumbnail
      fileUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
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

  const isTabComplete = (tabKey: TabKey): boolean => {
    switch (tabKey) {
      case 'personal':
        return Boolean(givenNameEN.trim() && surnameEN.trim());
      case 'identification':
        return Boolean(idNumber.trim());
      case 'contact':
        return Boolean(email.trim() || mobile.trim());
      case 'employment':
        return Boolean(occupation.trim() || organizationName.trim() || accountNumber.trim());
      case 'family':
        return Boolean(spouseName.trim() || relName.trim());
      case 'account':
        return Boolean(investorIdNumber.trim() || tradingAccountNumber.trim());
      default:
        return false;
    }
  };

  const completedTabsCount = tabs.filter((t) => isTabComplete(t.key)).length;
  const completionPercentage = Math.round((completedTabsCount / tabs.length) * 100);

  // Render the inner form fields for active tab
  const renderTabContent = () => (
    <>
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
                      // Photo fills the same box as the upload area; the corner × removes it
                      <div className="relative w-full h-32 sm:h-36 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={avatarUrl}
                          alt="Customer portrait"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarUrl('');
                            if (photoInputRef.current) photoInputRef.current.value = '';
                          }}
                          aria-label="Remove photo"
                          title="Remove photo"
                          className="absolute right-1.5 top-1.5 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-slate-900/60 text-white backdrop-blur-sm transition hover:bg-slate-900/80"
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-khmer"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-khmer"
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
                          <AttachedDocCard
                            label="Account Specimen"
                            doc={specimenDoc}
                            onReplace={() => specimenInputRef.current?.click()}
                            onRemove={() => handleRemoveDocument(specimenDoc.id)}
                          />
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
                          <AttachedDocCard
                            label="ID / Passport"
                            doc={idDoc}
                            onReplace={() => idDocInputRef.current?.click()}
                            onRemove={() => handleRemoveDocument(idDoc.id)}
                          />
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
                          <AttachedDocCard
                            label="Other Supporting Doc"
                            doc={otherDoc}
                            onReplace={() => otherDocInputRef.current?.click()}
                            onRemove={() => handleRemoveDocument(otherDoc.id)}
                          />
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
    </>
  );

  const headerRow = (
    <>
      <div className="space-y-2">
        <button
          type="button"
          onClick={onCancel}
          className="group -mx-2 -my-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to Directory</span>
        </button>
        <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-slate-900 sm:text-2xl">
          New Customer Onboarding
        </h1>
      </div>
    </>
  );

  const activeIdx = tabs.findIndex((t) => t.key === activeTab);

  const stepTabs = (
    <ol className="flex w-full min-w-[1080px]">
      {tabs.map((tab, idx) => {
        const isActive = idx === activeIdx;
        const isPassed = idx < activeIdx;
        return (
          <li key={tab.key} className="min-w-0 flex-1" style={{ marginLeft: idx === 0 ? 0 : -8 }}>
            <button
              type="button"
              onClick={() => setActiveTab(tab.key)}
              aria-current={isActive ? 'step' : undefined}
              style={{ clipPath: stepClipPath(idx, tabs.length) }}
              className={cn(
                'flex h-11 w-full items-center gap-2.5 text-left transition-colors cursor-pointer',
                idx === 0 ? 'rounded-l-xl pl-3' : 'pl-[26px]',
                idx === tabs.length - 1 ? 'rounded-r-xl pr-4' : 'pr-6',
                isActive && 'bg-blue-500 text-white',
                isPassed && 'bg-blue-500 text-white hover:bg-blue-500/90',
                !isActive && !isPassed && 'bg-slate-100/70 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              )}
            >
              <span
                className={cn(
                  'grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10.5px] font-bold tabular-nums',
                  isActive && 'bg-white text-blue-600 shadow-[0_0_0_3px_rgba(255,255,255,0.25)]',
                  isPassed && 'bg-white text-blue-600',
                  !isActive && !isPassed && 'bg-white text-slate-500 ring-1 ring-slate-200'
                )}
              >
                {isPassed ? <Check className="h-3 w-3" strokeWidth={3} /> : idx + 1}
              </span>
              <span className={cn('min-w-0 truncate text-[12.5px]', isActive ? 'font-bold' : 'font-medium')}>
                {tab.label}
                <span className="sr-only">
                  {isActive ? ' (current step)' : isPassed ? ' (completed)' : ' (upcoming)'}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div id="individual-insert-screen" className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Header + stepper card */}
      <div className="rounded-[22px] bg-white/90 ring-1 ring-slate-900/[0.06] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.14)] backdrop-blur-xl">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {headerRow}
        </div>
        <nav aria-label="Onboarding steps" className="border-t border-slate-100 p-2.5 overflow-x-auto">
          {stepTabs}
        </nav>
      </div>

          {/* Glass Form Card */}
          <div className="p-5 sm:p-7 bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-sm rounded-2xl">
            {renderTabContent()}

            {/* Footer navigation: sticks to the viewport bottom so Next / Submit stay reachable on long steps */}
            <div className="sticky bottom-0 z-10 -mx-5 -mb-5 mt-8 flex items-center justify-between gap-4 rounded-b-2xl border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:-mb-7 sm:px-7">
              <button
                type="button"
                onClick={() => {
                  const currIdx = tabs.findIndex((t) => t.key === activeTab);
                  if (currIdx > 0) setActiveTab(tabs[currIdx - 1].key);
                }}
                disabled={activeTab === 'personal'}
                className="h-10 px-3 rounded-xl text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition disabled:opacity-40 cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>

              <div className="flex items-center gap-2">
                {activeTab !== 'account' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const currIdx = tabs.findIndex((t) => t.key === activeTab);
                      if (currIdx < tabs.length - 1) setActiveTab(tabs[currIdx + 1].key);
                    }}
                    className="h-10 px-3 rounded-xl text-[13px] font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-xs transition cursor-pointer flex items-center gap-2"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  // Last step: the only submit action, in the same spot and colour as Next
                  <button
                    type="button"
                    onClick={handleFormSubmit}
                    disabled={isSubmitting}
                    className="h-10 px-3 rounded-xl text-[13px] font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-xs transition cursor-pointer disabled:opacity-70 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
    </div>
  );
}

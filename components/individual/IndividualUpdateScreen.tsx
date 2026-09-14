'use client';

import React, { useState } from 'react';
import { 
  Individual, 
  DesignTheme, 
  KYCStatus, 
  RiskRating, 
  SupportingDocument,
  Gender,
  MaritalStatus,
  ResidencyStatus,
  CustomerType,
  EducationBackground,
  SecuritiesKnowledge,
  InvestmentExperience,
  PositionLevel
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
  Mail, 
  Phone,
  Calendar,
  Lock,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IndividualUpdateScreenProps {
  individual: Individual;
  onCancel: () => void;
  onSubmitSuccess: (updated: Individual) => void;
  theme: DesignTheme;
}

type TabKey = 'personal' | 'identification' | 'contact' | 'employment' | 'family' | 'account';

export function IndividualUpdateScreen({
  individual,
  onCancel,
  onSubmitSuccess,
  theme,
}: IndividualUpdateScreenProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab 1: Personal Information
  const [surnameEN, setSurnameEN] = useState(individual.surnameEN || individual.lastName || '');
  const [givenNameEN, setGivenNameEN] = useState(individual.givenNameEN || individual.firstName || '');
  const [surnameKH, setSurnameKH] = useState(individual.surnameKH || '');
  const [givenNameKH, setGivenNameKH] = useState(individual.givenNameKH || '');
  const [dateOfBirth, setDateOfBirth] = useState(individual.dateOfBirth || '1990-01-15');
  const [gender, setGender] = useState<Gender>(individual.gender || 'Male');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>(individual.maritalStatus || 'Single');
  const [nationality, setNationality] = useState(individual.nationality || 'Cambodian');
  const [customerType, setCustomerType] = useState<CustomerType>(individual.customerType || 'Retail');
  const [educationBackground, setEducationBackground] = useState<EducationBackground>(individual.educationBackground || "Bachelor's");
  const [securitiesKnowledge, setSecuritiesKnowledge] = useState<SecuritiesKnowledge>(individual.securitiesKnowledge || 'Intermediate');
  const [riskCategory, setRiskCategory] = useState<RiskRating>(individual.riskRating || individual.riskCategory || 'moderate');
  const [investmentExperience, setInvestmentExperience] = useState<InvestmentExperience>(individual.investmentExperience || '3 - 5 years');
  const [avatarUrl, setAvatarUrl] = useState(individual.avatarUrl || '');

  // Tab 2: Identification & Residency
  const [residency, setResidency] = useState<ResidencyStatus>(individual.residency || 'Resident');
  const [idType, setIdType] = useState<'National ID' | 'Passport' | 'Driver License' | 'Government ID' | 'Tax ID'>(individual.idType as any || 'National ID');
  const [idNumber, setIdNumber] = useState(individual.idNumber || '');
  const [issuedBy, setIssuedBy] = useState(individual.issuedBy || 'General Department of Identification');
  const [issuedDate, setIssuedDate] = useState(individual.issuedDate || '2022-01-10');
  const [expiredDate, setExpiredDate] = useState(individual.expiredDate || individual.idExpiryDate || '2032-01-10');
  const [taxpayerIdNumber, setTaxpayerIdNumber] = useState(individual.taxpayerIdNumber || '');
  const [documents, setDocuments] = useState<SupportingDocument[]>(individual.supportingDocuments || []);

  // Tab 3: Contact & Address
  const [email, setEmail] = useState(individual.email || '');
  const [mobile, setMobile] = useState(individual.mobile || individual.phone || '');
  const [telephone, setTelephone] = useState(individual.telephone || '');
  const [street, setStreet] = useState(individual.address?.street || '');
  const [city, setCity] = useState(individual.address?.city || 'Phnom Penh');
  const [state, setState] = useState(individual.address?.state || 'Daun Penh');
  const [postalCode, setPostalCode] = useState(individual.address?.postalCode || '120201');
  const [country, setCountry] = useState(individual.address?.country || 'Cambodia');

  // Tab 4: Employment & Banking
  const [occupation, setOccupation] = useState(individual.employment?.occupation || individual.occupation || '');
  const [position, setPosition] = useState(individual.employment?.position || '');
  const [typeOfBusiness, setTypeOfBusiness] = useState(individual.employment?.typeOfBusiness || '');
  const [levelOfPosition, setLevelOfPosition] = useState<PositionLevel>(individual.employment?.levelOfPosition || 'Senior');
  const [organizationName, setOrganizationName] = useState(individual.employment?.organizationName || individual.employer || '');
  const [lengthOfWork, setLengthOfWork] = useState(individual.employment?.lengthOfWork || '3 years');
  const [officeTelephone, setOfficeTelephone] = useState(individual.employment?.officeTelephone || '');
  const [organizationAddress, setOrganizationAddress] = useState(individual.employment?.organizationAddress || '');

  const [bankName, setBankName] = useState(individual.banking?.bankName || 'ABA Bank Plc');
  const [accountOwner, setAccountOwner] = useState(individual.banking?.accountOwner || '');
  const [savingAccount, setSavingAccount] = useState(individual.banking?.savingAccount || 'Premier Savings Account');
  const [accountNumber, setAccountNumber] = useState(individual.banking?.accountNumber || '');

  // Tab 5: Family & Related Persons
  const [hasSpouse, setHasSpouse] = useState(!!individual.spouse);
  const [spouseName, setSpouseName] = useState(individual.spouse?.fullName || '');
  const [spouseLatin, setSpouseLatin] = useState(individual.spouse?.latin || '');
  const [spouseEmail, setSpouseEmail] = useState(individual.spouse?.email || '');
  const [spouseYearWork, setSpouseYearWork] = useState(individual.spouse?.yearOfEmployment || '2020');
  const [spouseRelationship, setSpouseRelationship] = useState(individual.spouse?.relationship || 'Spouse');
  const [spouseOccupation, setSpouseOccupation] = useState(individual.spouse?.occupation || '');
  const [spousePosition, setSpousePosition] = useState(individual.spouse?.position || '');
  const [spouseBusiness, setSpouseBusiness] = useState(individual.spouse?.typeOfBusiness || '');
  const [spouseMobile, setSpouseMobile] = useState(individual.spouse?.mobile || '');
  const [spouseOfficePhone, setSpouseOfficePhone] = useState(individual.spouse?.officeTelephone || '');
  const [spouseAddress, setSpouseAddress] = useState(individual.spouse?.address || '');

  const [hasRelatedPerson, setHasRelatedPerson] = useState(!!individual.relatedPerson);
  const [relName, setRelName] = useState(individual.relatedPerson?.fullName || '');
  const [relLatin, setRelLatin] = useState(individual.relatedPerson?.latin || '');
  const [relEmail, setRelEmail] = useState(individual.relatedPerson?.email || '');
  const [relGender, setRelGender] = useState<Gender>(individual.relatedPerson?.gender || 'Female');
  const [relRelationship, setRelRelationship] = useState(individual.relatedPerson?.relationship || 'Sibling');
  const [relMobile, setRelMobile] = useState(individual.relatedPerson?.mobile || '');
  const [relAddress, setRelAddress] = useState(individual.relatedPerson?.address || '');

  // Tab 6: Account Information
  const [investorIdNumber, setInvestorIdNumber] = useState(individual.investorIdInfo?.investorIdNumber || '');
  const [securitiesFirm, setSecuritiesFirm] = useState(individual.investorIdInfo?.securitiesFirm || 'Nexus Securities Plc');
  const [customerReceivedBy, setCustomerReceivedBy] = useState(individual.investorIdInfo?.customerReceivedBy || 'Sophea Keo (CSO)');
  const [applicationDate, setApplicationDate] = useState(individual.investorIdInfo?.applicationDate || '2026-09-09');
  const [dateSentToSECC, setDateSentToSECC] = useState(individual.investorIdInfo?.dateSentToSECC || '2026-09-10');
  const [investorStatus, setInvestorStatus] = useState<'Normal' | 'VIP' | 'Restricted'>(individual.investorIdInfo?.customerStatus || 'Normal');

  const [tradingAccountNumber, setTradingAccountNumber] = useState(individual.tradingAccountInfo?.tradingAccountNumber || '');
  const [accountDate, setAccountDate] = useState(individual.tradingAccountInfo?.accountDate || '2026-09-15');
  const [accountCheckedBy, setAccountCheckedBy] = useState(individual.tradingAccountInfo?.accountCheckedBy || 'Dara Vong (SR)');
  const [accountApprovedBy, setAccountApprovedBy] = useState(individual.tradingAccountInfo?.accountApprovedBy || 'Vannak Lim (Manager)');
  const [currentAssignedSR, setCurrentAssignedSR] = useState(individual.tradingAccountInfo?.currentAssignedSR || 'Dara Vong (SR)');

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Document add
  const [newDocType, setNewDocType] = useState<'Account Specimen' | 'ID Card / Passport' | 'Other'>('Other');
  const [newDocName, setNewDocName] = useState('');
  const [newDocRemark, setNewDocRemark] = useState('');

  const handleAddDocument = () => {
    if (!newDocName.trim()) {
      alert('Please enter document filename');
      return;
    }
    const newDoc: SupportingDocument = {
      id: `DOC-UPD-${Date.now()}`,
      type: newDocType,
      fileName: newDocName.trim().endsWith('.pdf') ? newDocName.trim() : `${newDocName.trim()}.pdf`,
      fileSize: '1.8 MB',
      uploadedAt: new Date().toISOString().slice(0, 10),
      remark: newDocRemark || 'Updated document submission.',
    };
    setDocuments((prev) => [...prev, newDoc]);
    setNewDocName('');
    setNewDocRemark('');
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
      if (newErrors.givenNameEN || newErrors.surnameEN) setActiveTab('personal');
      else if (newErrors.idNumber) setActiveTab('identification');
      else if (newErrors.email) setActiveTab('contact');
      return;
    }

    setIsSubmitting(true);

    const fullEN = `${givenNameEN.trim()} ${surnameEN.trim()}`;
    const fullKH = surnameKH.trim() && givenNameKH.trim() ? `${givenNameKH.trim()} ${surnameKH.trim()}` : (individual.fullNameKH || fullEN);

    const updated: Individual = {
      ...individual,
      firstName: givenNameEN.trim(),
      lastName: surnameEN.trim(),
      surnameEN: surnameEN.trim(),
      givenNameEN: givenNameEN.trim(),
      surnameKH: surnameKH.trim(),
      givenNameKH: givenNameKH.trim(),
      fullNameEN: fullEN,
      fullNameKH: fullKH,
      email: email.trim(),
      phone: mobile.trim() || individual.phone,
      mobile: mobile.trim() || individual.mobile,
      telephone: telephone.trim(),
      avatarUrl: avatarUrl || individual.avatarUrl,
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
      idExpiryDate: expiredDate,
      taxpayerIdNumber: taxpayerIdNumber.trim() || individual.taxpayerIdNumber,
      supportingDocuments: documents,

      employment: {
        occupation: occupation.trim() || individual.employment?.occupation || 'Professional',
        position: position.trim() || individual.employment?.position || 'Officer',
        typeOfBusiness: typeOfBusiness.trim() || individual.employment?.typeOfBusiness || 'Services',
        levelOfPosition,
        organizationName: organizationName.trim() || individual.employment?.organizationName || 'Company',
        lengthOfWork,
        officeTelephone,
        organizationAddress,
      },

      banking: {
        bankName,
        accountOwner: accountOwner.trim() || fullEN.toUpperCase(),
        savingAccount,
        accountNumber: accountNumber.trim() || individual.banking?.accountNumber || '001 000 000 000',
      },

      spouse: hasSpouse ? {
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

      relatedPerson: hasRelatedPerson ? {
        fullName: relName,
        latin: relLatin || relName,
        email: relEmail,
        gender: relGender,
        relationship: relRelationship,
        mobile: relMobile,
        address: relAddress,
      } : undefined,

      investorIdInfo: {
        investorIdNumber: investorIdNumber.trim() || individual.investorIdInfo?.investorIdNumber || 'INV-000000',
        securitiesFirm,
        customerReceivedBy,
        applicationDate,
        dateSentToSECC,
        dateReceivedFromSECC: individual.investorIdInfo?.dateReceivedFromSECC || 'Pending',
        investorIdExpiredDate: individual.investorIdInfo?.investorIdExpiredDate || '2036-09-09',
        customerStatus: investorStatus,
      },

      tradingAccountInfo: {
        tradingAccountNumber: tradingAccountNumber.trim() || individual.tradingAccountInfo?.tradingAccountNumber || 'TRD-000000',
        accountDate,
        accountCheckedBy,
        accountApprovedBy,
        email: email.trim(),
        currentAssignedSR,
        phoneNumber: mobile.trim() || individual.phone,
      },

      // Update basic fields
      occupation: occupation.trim() || individual.occupation,
      employer: organizationName.trim() || individual.employer,
      address: {
        street: street || individual.address?.street || '',
        city: city || individual.address?.city || '',
        state: state || individual.address?.state || '',
        postalCode: postalCode || individual.address?.postalCode || '',
        country: country || individual.address?.country || '',
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
    { key: 'contact', label: 'Contact & Address', icon: <MapPin className="w-4 h-4" /> },
    { key: 'employment', label: 'Employment & Banking', icon: <Briefcase className="w-4 h-4" /> },
    { key: 'family', label: 'Family & Related Persons', icon: <Users className="w-4 h-4" /> },
    { key: 'account', label: 'Account Information', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div id="individual-update-screen" className="space-y-5 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            id="btn-update-back-to-list"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Individual Directory</span>
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Update Individual Profile
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {individual.customerId || individual.id}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Editing {individual.fullNameEN || `${individual.firstName} ${individual.lastName}`}. Modifications will be saved directly into customer records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={isSubmitting}
            className={cn(
              'flex items-center gap-2 px-5 py-2 text-xs font-bold text-white transition-all shadow-xs shrink-0',
              theme === 'glassmorphism'
                ? 'rounded-full bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/20'
                : theme === 'aurora'
                ? 'rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md shadow-blue-500/25'
                : 'rounded-lg bg-blue-500 hover:bg-blue-600'
            )}
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Changes...' : 'Save Updates'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={cn(
        'bg-white border border-slate-200 p-1.5 flex items-center gap-1 overflow-x-auto',
        theme === 'glassmorphism' ? 'rounded-2xl bg-white/80 backdrop-blur-md border-white/80 shadow-xs' : 'rounded-xl shadow-xs'
      )}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all shrink-0 select-none',
              activeTab === tab.key
                ? 'bg-blue-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Surname (English) *
                  </label>
                  <input
                    type="text"
                    value={surnameEN}
                    onChange={(e) => setSurnameEN(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 focus:bg-white',
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
                    className={cn(
                      'w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 focus:bg-white',
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-khmer"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-khmer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Categorization */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  Investor Profile & Appropriateness
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Customer Type</label>
                    <select
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    >
                      <option value="Retail">Retail Investor</option>
                      <option value="Corporate Officer">Corporate Officer</option>
                      <option value="High Net Worth">High Net Worth (HNW)</option>
                      <option value="Institutional">Institutional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Education Background</label>
                    <select
                      value={educationBackground}
                      onChange={(e) => setEducationBackground(e.target.value as EducationBackground)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    >
                      <option value="High School">High School</option>
                      <option value="Bachelor's">Bachelor&apos;s Degree</option>
                      <option value="Master's">Master&apos;s Degree</option>
                      <option value="Doctorate">Doctorate / Ph.D.</option>
                      <option value="Other">Other Professional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Securities Knowledge</label>
                    <select
                      value={securitiesKnowledge}
                      onChange={(e) => setSecuritiesKnowledge(e.target.value as SecuritiesKnowledge)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    >
                      <option value="None">None</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Professional">Professional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Risk Category</label>
                    <select
                      value={riskCategory}
                      onChange={(e) => setRiskCategory(e.target.value as RiskRating)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    >
                      <option value="low">Low Risk</option>
                      <option value="moderate">Moderate Risk</option>
                      <option value="high">High Risk</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Investment Experience</label>
                    <select
                      value={investmentExperience}
                      onChange={(e) => setInvestmentExperience(e.target.value as InvestmentExperience)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    >
                      <option value="< 1 year">&lt; 1 year</option>
                      <option value="1 - 3 years">1 - 3 years</option>
                      <option value="3 - 5 years">3 - 5 years</option>
                      <option value="5+ years">5+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Avatar URL</label>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
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
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Residency *</label>
                  <select
                    value={residency}
                    onChange={(e) => setResidency(e.target.value as ResidencyStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="Resident">Resident</option>
                    <option value="Non-Resident">Non-Resident</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ID Type *</label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="National ID">National ID Card</option>
                    <option value="Passport">International Passport</option>
                    <option value="Driver License">Driver License</option>
                    <option value="Government ID">Government ID</option>
                    <option value="Tax ID">Tax ID Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ID Number *</label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 font-mono',
                      errors.idNumber ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                    )}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Issued By</label>
                  <input
                    type="text"
                    value={issuedBy}
                    onChange={(e) => setIssuedBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Issued Date</label>
                  <input
                    type="date"
                    value={issuedDate}
                    onChange={(e) => setIssuedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Expired Date</label>
                  <input
                    type="date"
                    value={expiredDate}
                    onChange={(e) => setExpiredDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Taxpayer ID Number (TIN)</label>
                  <input
                    type="text"
                    value={taxpayerIdNumber}
                    onChange={(e) => setTaxpayerIdNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Documents Management */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Attached Supporting Documents ({documents.length})
                  </span>
                </div>

                {/* Add document */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Document Type</label>
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    >
                      <option value="Account Specimen">Account Specimen</option>
                      <option value="ID Card / Passport">ID Card / Passport</option>
                      <option value="Other">Other Supporting Document</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">File Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Updated_Passport_Scan.pdf"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Remark</label>
                    <input
                      type="text"
                      placeholder="e.g. Re-verified by CSO"
                      value={newDocRemark}
                      onChange={(e) => setNewDocRemark(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg font-bold text-xs hover:bg-blue-600 flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add File</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{doc.fileName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-semibold">
                              {doc.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{doc.fileSize}</span>
                          </div>
                          {doc.remark && <p className="text-[11px] text-slate-500 mt-0.5">{doc.remark}</p>}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(doc.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
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
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Telephone</label>
                  <input
                    type="text"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  Residential Address
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">State / Khan</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Country</label>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Position / Title</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Type of Business</label>
                  <input
                    type="text"
                    value={typeOfBusiness}
                    onChange={(e) => setTypeOfBusiness(e.target.value)}
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Length of Work</label>
                  <input
                    type="text"
                    value={lengthOfWork}
                    onChange={(e) => setLengthOfWork(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Office Telephone</label>
                  <input
                    type="text"
                    value={officeTelephone}
                    onChange={(e) => setOfficeTelephone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Banking */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  Settlement Bank Account
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
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Account Owner</label>
                    <input
                      type="text"
                      value={accountOwner}
                      onChange={(e) => setAccountOwner(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Saving / Account Type</label>
                    <input
                      type="text"
                      value={savingAccount}
                      onChange={(e) => setSavingAccount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
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

              {/* Spouse */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Spouse Details
                  </span>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSpouse}
                      onChange={(e) => setHasSpouse(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Has spouse</span>
                  </label>
                </div>

                {hasSpouse && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={spouseName}
                        onChange={(e) => setSpouseName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Latin Name</label>
                      <input
                        type="text"
                        value={spouseLatin}
                        onChange={(e) => setSpouseLatin(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={spouseEmail}
                        onChange={(e) => setSpouseEmail(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Occupation</label>
                      <input
                        type="text"
                        value={spouseOccupation}
                        onChange={(e) => setSpouseOccupation(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Mobile</label>
                      <input
                        type="text"
                        value={spouseMobile}
                        onChange={(e) => setSpouseMobile(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Year of Work</label>
                      <input
                        type="text"
                        value={spouseYearWork}
                        onChange={(e) => setSpouseYearWork(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Related Person */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Related Person / Emergency Contact
                  </span>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasRelatedPerson}
                      onChange={(e) => setHasRelatedPerson(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Has related person</span>
                  </label>
                </div>

                {hasRelatedPerson && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={relName}
                        onChange={(e) => setRelName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Relationship</label>
                      <input
                        type="text"
                        value={relRelationship}
                        onChange={(e) => setRelRelationship(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Mobile</label>
                      <input
                        type="text"
                        value={relMobile}
                        onChange={(e) => setRelMobile(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                )}
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

              {/* Investor ID */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Investor ID Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Investor ID Number</label>
                    <input
                      type="text"
                      value={investorIdNumber}
                      onChange={(e) => setInvestorIdNumber(e.target.value)}
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
                </div>
              </div>

              {/* Trading Account */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Trading Account Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Trading Account Number</label>
                    <input
                      type="text"
                      value={tradingAccountNumber}
                      onChange={(e) => setTradingAccountNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-800"
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

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Account Opening Date</label>
                    <input
                      type="date"
                      value={accountDate}
                      onChange={(e) => setAccountDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Bottom Bar */}
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
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save Profile Changes'}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

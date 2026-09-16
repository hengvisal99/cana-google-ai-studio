'use client';

import React, { useState, useRef } from 'react';
import {
  Individual,
  SupportingDocument,
  Gender,
  MaritalStatus,
  ResidencyStatus,
  CustomerType,
  EducationBackground,
  SecuritiesKnowledge,
  InvestmentExperience,
  PositionLevel,
  RiskRating,
} from '@/types';
import { User, ShieldCheck, CreditCard, MapPin, Briefcase, Users, Upload, Building, Phone, Mail, Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentSlotRow } from '@/components/shared/DocumentSlotRow';

export type FormStepKey = 'personal' | 'identification' | 'contact' | 'employment' | 'family' | 'account';

/** Every field both individual forms edit. */
export type IndividualFormValues = {
  surnameEN: string;
  givenNameEN: string;
  surnameKH: string;
  givenNameKH: string;
  dateOfBirth: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  nationality: string;
  customerType: CustomerType;
  educationBackground: EducationBackground;
  securitiesKnowledge: SecuritiesKnowledge;
  riskCategory: RiskRating;
  investmentExperience: InvestmentExperience;
  avatarUrl: string;
  residency: ResidencyStatus;
  idType: 'National ID' | 'Passport' | 'Driver License' | 'Government ID' | 'Tax ID';
  idNumber: string;
  issuedBy: string;
  issuedDate: string;
  expiredDate: string;
  taxpayerIdNumber: string;
  email: string;
  mobile: string;
  telephone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  occupation: string;
  position: string;
  typeOfBusiness: string;
  levelOfPosition: PositionLevel;
  organizationName: string;
  lengthOfWork: string;
  officeTelephone: string;
  organizationAddress: string;
  bankName: string;
  accountOwner: string;
  savingAccount: string;
  accountNumber: string;
  spouseName: string;
  spouseLatin: string;
  spouseEmail: string;
  spouseYearWork: string;
  spouseRelationship: string;
  spouseOccupation: string;
  spousePosition: string;
  spouseBusiness: string;
  spouseMobile: string;
  spouseOfficePhone: string;
  spouseAddress: string;
  relName: string;
  relLatin: string;
  relEmail: string;
  relGender: Gender;
  relRelationship: string;
  relMobile: string;
  relAddress: string;
  investorIdNumber: string;
  securitiesFirm: string;
  customerReceivedBy: string;
  applicationDate: string;
  dateSentToSECC: string;
  investorStatus: 'Normal' | 'VIP' | 'Restricted';
  tradingAccountNumber: string;
  accountDate: string;
  accountCheckedBy: string;
  accountApprovedBy: string;
  currentAssignedSR: string;
};

/** Defaults for a new record. */
export function createEmptyFormValues(): IndividualFormValues {
  return {
    surnameEN: '',
    givenNameEN: '',
    surnameKH: '',
    givenNameKH: '',
    dateOfBirth: '1990-01-15',
    gender: 'Male',
    maritalStatus: 'Single',
    nationality: 'Cambodian',
    customerType: 'Retail',
    educationBackground: "Bachelor's",
    securitiesKnowledge: 'Intermediate',
    riskCategory: 'moderate',
    investmentExperience: '3 - 5 years',
    avatarUrl: '',
    residency: 'Resident',
    idType: 'National ID',
    idNumber: '',
    issuedBy: 'General Department of Identification',
    issuedDate: '2022-01-10',
    expiredDate: '2032-01-10',
    taxpayerIdNumber: '',
    email: '',
    mobile: '',
    telephone: '',
    street: '',
    city: 'Phnom Penh',
    state: 'Daun Penh',
    postalCode: '120201',
    country: 'Cambodia',
    occupation: '',
    position: '',
    typeOfBusiness: '',
    levelOfPosition: 'Senior',
    organizationName: '',
    lengthOfWork: '3 years',
    officeTelephone: '',
    organizationAddress: '',
    bankName: 'ABA Bank Plc',
    accountOwner: '',
    savingAccount: 'Premier Savings Account',
    accountNumber: '',
    spouseName: '',
    spouseLatin: '',
    spouseEmail: '',
    spouseYearWork: '2020',
    spouseRelationship: 'Spouse',
    spouseOccupation: '',
    spousePosition: '',
    spouseBusiness: '',
    spouseMobile: '',
    spouseOfficePhone: '',
    spouseAddress: '',
    relName: '',
    relLatin: '',
    relEmail: '',
    relGender: 'Female',
    relRelationship: 'Sibling',
    relMobile: '',
    relAddress: '',
    investorIdNumber: '',
    securitiesFirm: 'Nexus Securities Plc',
    customerReceivedBy: 'Sophea Keo (CSO)',
    applicationDate: '2026-09-09',
    dateSentToSECC: '2026-09-10',
    investorStatus: 'Normal',
    tradingAccountNumber: '',
    accountDate: '2026-09-15',
    accountCheckedBy: 'Dara Vong (SR)',
    accountApprovedBy: 'Vannak Lim (Manager)',
    currentAssignedSR: 'Dara Vong (SR)',
  };
}

/** The same fields, filled in from a record being edited. */
export function formValuesFromIndividual(individual: Individual): IndividualFormValues {
  return {
    surnameEN: individual.surnameEN || individual.lastName || '',
    givenNameEN: individual.givenNameEN || individual.firstName || '',
    surnameKH: individual.surnameKH || '',
    givenNameKH: individual.givenNameKH || '',
    dateOfBirth: individual.dateOfBirth || '1990-01-15',
    gender: individual.gender || 'Male',
    maritalStatus: individual.maritalStatus || 'Single',
    nationality: individual.nationality || 'Cambodian',
    customerType: individual.customerType || 'Retail',
    educationBackground: individual.educationBackground || "Bachelor's",
    securitiesKnowledge: individual.securitiesKnowledge || 'Intermediate',
    riskCategory: individual.riskRating || individual.riskCategory || 'moderate',
    investmentExperience: individual.investmentExperience || '3 - 5 years',
    avatarUrl: individual.avatarUrl || '',
    residency: individual.residency || 'Resident',
    idType: individual.idType as any || 'National ID',
    idNumber: individual.idNumber || '',
    issuedBy: individual.issuedBy || 'General Department of Identification',
    issuedDate: individual.issuedDate || '2022-01-10',
    expiredDate: individual.expiredDate || individual.idExpiryDate || '2032-01-10',
    taxpayerIdNumber: individual.taxpayerIdNumber || '',
    email: individual.email || '',
    mobile: individual.mobile || individual.phone || '',
    telephone: individual.telephone || '',
    street: individual.address?.street || '',
    city: individual.address?.city || 'Phnom Penh',
    state: individual.address?.state || 'Daun Penh',
    postalCode: individual.address?.postalCode || '120201',
    country: individual.address?.country || 'Cambodia',
    occupation: individual.employment?.occupation || individual.occupation || '',
    position: individual.employment?.position || '',
    typeOfBusiness: individual.employment?.typeOfBusiness || '',
    levelOfPosition: individual.employment?.levelOfPosition || 'Senior',
    organizationName: individual.employment?.organizationName || individual.employer || '',
    lengthOfWork: individual.employment?.lengthOfWork || '3 years',
    officeTelephone: individual.employment?.officeTelephone || '',
    organizationAddress: individual.employment?.organizationAddress || '',
    bankName: individual.banking?.bankName || 'ABA Bank Plc',
    accountOwner: individual.banking?.accountOwner || '',
    savingAccount: individual.banking?.savingAccount || 'Premier Savings Account',
    accountNumber: individual.banking?.accountNumber || '',
    spouseName: individual.spouse?.fullName || '',
    spouseLatin: individual.spouse?.latin || '',
    spouseEmail: individual.spouse?.email || '',
    spouseYearWork: individual.spouse?.yearOfEmployment || '2020',
    spouseRelationship: individual.spouse?.relationship || 'Spouse',
    spouseOccupation: individual.spouse?.occupation || '',
    spousePosition: individual.spouse?.position || '',
    spouseBusiness: individual.spouse?.typeOfBusiness || '',
    spouseMobile: individual.spouse?.mobile || '',
    spouseOfficePhone: individual.spouse?.officeTelephone || '',
    spouseAddress: individual.spouse?.address || '',
    relName: individual.relatedPerson?.fullName || '',
    relLatin: individual.relatedPerson?.latin || '',
    relEmail: individual.relatedPerson?.email || '',
    relGender: individual.relatedPerson?.gender || 'Female',
    relRelationship: individual.relatedPerson?.relationship || 'Sibling',
    relMobile: individual.relatedPerson?.mobile || '',
    relAddress: individual.relatedPerson?.address || '',
    investorIdNumber: individual.investorIdInfo?.investorIdNumber || '',
    securitiesFirm: individual.investorIdInfo?.securitiesFirm || 'Nexus Securities Plc',
    customerReceivedBy: individual.investorIdInfo?.customerReceivedBy || 'Sophea Keo (CSO)',
    applicationDate: individual.investorIdInfo?.applicationDate || '2026-09-09',
    dateSentToSECC: individual.investorIdInfo?.dateSentToSECC || '2026-09-10',
    investorStatus: individual.investorIdInfo?.customerStatus || 'Normal',
    tradingAccountNumber: individual.tradingAccountInfo?.tradingAccountNumber || '',
    accountDate: individual.tradingAccountInfo?.accountDate || '2026-09-15',
    accountCheckedBy: individual.tradingAccountInfo?.accountCheckedBy || 'Dara Vong (SR)',
    accountApprovedBy: individual.tradingAccountInfo?.accountApprovedBy || 'Vannak Lim (Manager)',
    currentAssignedSR: individual.tradingAccountInfo?.currentAssignedSR || 'Dara Vong (SR)',
  };
}

/**
 * The fields of one step. Both the insert and update screens render this, so the
 * two forms stay identical; each screen only owns its values and what it does on submit.
 */
export function IndividualFormFields({
  step,
  values,
  setValue,
  errors,
  documents,
  setDocuments,
}: {
  step: FormStepKey;
  values: IndividualFormValues;
  setValue: <K extends keyof IndividualFormValues>(key: K, value: IndividualFormValues[K]) => void;
  errors: { [key: string]: string };
  documents: SupportingDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<SupportingDocument[]>>;
}) {
  const activeTab = step;
  const {
    surnameEN,
    givenNameEN,
    surnameKH,
    givenNameKH,
    dateOfBirth,
    gender,
    maritalStatus,
    nationality,
    customerType,
    educationBackground,
    securitiesKnowledge,
    riskCategory,
    investmentExperience,
    avatarUrl,
    residency,
    idType,
    idNumber,
    issuedBy,
    issuedDate,
    expiredDate,
    taxpayerIdNumber,
    email,
    mobile,
    telephone,
    street,
    city,
    state,
    postalCode,
    country,
    occupation,
    position,
    typeOfBusiness,
    levelOfPosition,
    organizationName,
    lengthOfWork,
    officeTelephone,
    organizationAddress,
    bankName,
    accountOwner,
    savingAccount,
    accountNumber,
    spouseName,
    spouseLatin,
    spouseEmail,
    spouseYearWork,
    spouseRelationship,
    spouseOccupation,
    spousePosition,
    spouseBusiness,
    spouseMobile,
    spouseOfficePhone,
    spouseAddress,
    relName,
    relLatin,
    relEmail,
    relGender,
    relRelationship,
    relMobile,
    relAddress,
    investorIdNumber,
    securitiesFirm,
    customerReceivedBy,
    applicationDate,
    dateSentToSECC,
    investorStatus,
    tradingAccountNumber,
    accountDate,
    accountCheckedBy,
    accountApprovedBy,
    currentAssignedSR,
  } = values;

  const setSurnameEN = (value: IndividualFormValues['surnameEN']) => setValue('surnameEN', value);
  const setGivenNameEN = (value: IndividualFormValues['givenNameEN']) => setValue('givenNameEN', value);
  const setSurnameKH = (value: IndividualFormValues['surnameKH']) => setValue('surnameKH', value);
  const setGivenNameKH = (value: IndividualFormValues['givenNameKH']) => setValue('givenNameKH', value);
  const setDateOfBirth = (value: IndividualFormValues['dateOfBirth']) => setValue('dateOfBirth', value);
  const setGender = (value: IndividualFormValues['gender']) => setValue('gender', value);
  const setMaritalStatus = (value: IndividualFormValues['maritalStatus']) => setValue('maritalStatus', value);
  const setNationality = (value: IndividualFormValues['nationality']) => setValue('nationality', value);
  const setCustomerType = (value: IndividualFormValues['customerType']) => setValue('customerType', value);
  const setEducationBackground = (value: IndividualFormValues['educationBackground']) => setValue('educationBackground', value);
  const setSecuritiesKnowledge = (value: IndividualFormValues['securitiesKnowledge']) => setValue('securitiesKnowledge', value);
  const setRiskCategory = (value: IndividualFormValues['riskCategory']) => setValue('riskCategory', value);
  const setInvestmentExperience = (value: IndividualFormValues['investmentExperience']) => setValue('investmentExperience', value);
  const setAvatarUrl = (value: IndividualFormValues['avatarUrl']) => setValue('avatarUrl', value);
  const setResidency = (value: IndividualFormValues['residency']) => setValue('residency', value);
  const setIdType = (value: IndividualFormValues['idType']) => setValue('idType', value);
  const setIdNumber = (value: IndividualFormValues['idNumber']) => setValue('idNumber', value);
  const setIssuedBy = (value: IndividualFormValues['issuedBy']) => setValue('issuedBy', value);
  const setIssuedDate = (value: IndividualFormValues['issuedDate']) => setValue('issuedDate', value);
  const setExpiredDate = (value: IndividualFormValues['expiredDate']) => setValue('expiredDate', value);
  const setTaxpayerIdNumber = (value: IndividualFormValues['taxpayerIdNumber']) => setValue('taxpayerIdNumber', value);
  const setEmail = (value: IndividualFormValues['email']) => setValue('email', value);
  const setMobile = (value: IndividualFormValues['mobile']) => setValue('mobile', value);
  const setTelephone = (value: IndividualFormValues['telephone']) => setValue('telephone', value);
  const setStreet = (value: IndividualFormValues['street']) => setValue('street', value);
  const setCity = (value: IndividualFormValues['city']) => setValue('city', value);
  const setState = (value: IndividualFormValues['state']) => setValue('state', value);
  const setPostalCode = (value: IndividualFormValues['postalCode']) => setValue('postalCode', value);
  const setCountry = (value: IndividualFormValues['country']) => setValue('country', value);
  const setOccupation = (value: IndividualFormValues['occupation']) => setValue('occupation', value);
  const setPosition = (value: IndividualFormValues['position']) => setValue('position', value);
  const setTypeOfBusiness = (value: IndividualFormValues['typeOfBusiness']) => setValue('typeOfBusiness', value);
  const setLevelOfPosition = (value: IndividualFormValues['levelOfPosition']) => setValue('levelOfPosition', value);
  const setOrganizationName = (value: IndividualFormValues['organizationName']) => setValue('organizationName', value);
  const setLengthOfWork = (value: IndividualFormValues['lengthOfWork']) => setValue('lengthOfWork', value);
  const setOfficeTelephone = (value: IndividualFormValues['officeTelephone']) => setValue('officeTelephone', value);
  const setOrganizationAddress = (value: IndividualFormValues['organizationAddress']) => setValue('organizationAddress', value);
  const setBankName = (value: IndividualFormValues['bankName']) => setValue('bankName', value);
  const setAccountOwner = (value: IndividualFormValues['accountOwner']) => setValue('accountOwner', value);
  const setSavingAccount = (value: IndividualFormValues['savingAccount']) => setValue('savingAccount', value);
  const setAccountNumber = (value: IndividualFormValues['accountNumber']) => setValue('accountNumber', value);
  const setSpouseName = (value: IndividualFormValues['spouseName']) => setValue('spouseName', value);
  const setSpouseLatin = (value: IndividualFormValues['spouseLatin']) => setValue('spouseLatin', value);
  const setSpouseEmail = (value: IndividualFormValues['spouseEmail']) => setValue('spouseEmail', value);
  const setSpouseYearWork = (value: IndividualFormValues['spouseYearWork']) => setValue('spouseYearWork', value);
  const setSpouseRelationship = (value: IndividualFormValues['spouseRelationship']) => setValue('spouseRelationship', value);
  const setSpouseOccupation = (value: IndividualFormValues['spouseOccupation']) => setValue('spouseOccupation', value);
  const setSpousePosition = (value: IndividualFormValues['spousePosition']) => setValue('spousePosition', value);
  const setSpouseBusiness = (value: IndividualFormValues['spouseBusiness']) => setValue('spouseBusiness', value);
  const setSpouseMobile = (value: IndividualFormValues['spouseMobile']) => setValue('spouseMobile', value);
  const setSpouseOfficePhone = (value: IndividualFormValues['spouseOfficePhone']) => setValue('spouseOfficePhone', value);
  const setSpouseAddress = (value: IndividualFormValues['spouseAddress']) => setValue('spouseAddress', value);
  const setRelName = (value: IndividualFormValues['relName']) => setValue('relName', value);
  const setRelLatin = (value: IndividualFormValues['relLatin']) => setValue('relLatin', value);
  const setRelEmail = (value: IndividualFormValues['relEmail']) => setValue('relEmail', value);
  const setRelGender = (value: IndividualFormValues['relGender']) => setValue('relGender', value);
  const setRelRelationship = (value: IndividualFormValues['relRelationship']) => setValue('relRelationship', value);
  const setRelMobile = (value: IndividualFormValues['relMobile']) => setValue('relMobile', value);
  const setRelAddress = (value: IndividualFormValues['relAddress']) => setValue('relAddress', value);
  const setInvestorIdNumber = (value: IndividualFormValues['investorIdNumber']) => setValue('investorIdNumber', value);
  const setSecuritiesFirm = (value: IndividualFormValues['securitiesFirm']) => setValue('securitiesFirm', value);
  const setCustomerReceivedBy = (value: IndividualFormValues['customerReceivedBy']) => setValue('customerReceivedBy', value);
  const setApplicationDate = (value: IndividualFormValues['applicationDate']) => setValue('applicationDate', value);
  const setDateSentToSECC = (value: IndividualFormValues['dateSentToSECC']) => setValue('dateSentToSECC', value);
  const setInvestorStatus = (value: IndividualFormValues['investorStatus']) => setValue('investorStatus', value);
  const setTradingAccountNumber = (value: IndividualFormValues['tradingAccountNumber']) => setValue('tradingAccountNumber', value);
  const setAccountDate = (value: IndividualFormValues['accountDate']) => setValue('accountDate', value);
  const setAccountCheckedBy = (value: IndividualFormValues['accountCheckedBy']) => setValue('accountCheckedBy', value);
  const setAccountApprovedBy = (value: IndividualFormValues['accountApprovedBy']) => setValue('accountApprovedBy', value);
  const setCurrentAssignedSR = (value: IndividualFormValues['currentAssignedSR']) => setValue('currentAssignedSR', value);

  // Upload state that only this markup needs
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [otherDocType, setOtherDocType] = useState<string>('Proof of Residential Address');
  const [otherDocRemark, setOtherDocRemark] = useState<string>('');
  const [isDraggingSpecimen, setIsDraggingSpecimen] = useState(false);
  const [isDraggingIdDoc, setIsDraggingIdDoc] = useState(false);
  const [isDraggingOtherDoc, setIsDraggingOtherDoc] = useState(false);
  const specimenInputRef = useRef<HTMLInputElement>(null);
  const idDocInputRef = useRef<HTMLInputElement>(null);
  const otherDocInputRef = useRef<HTMLInputElement>(null);

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
      // Local URL so the row can view or download the file before it is saved
      fileUrl: URL.createObjectURL(file),
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
  return (
    <>
          {activeTab === 'personal' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
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
                          <span className="text-[10px] font-semibold tracking-wider text-slate-700 group-hover:text-blue-600 transition-colors uppercase">
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
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-3">
                  Investor Profile & Appropriateness
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Identification & Supporting Documents</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                  <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
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

                {/* One row per slot: upload row until a file is attached, file row after */}
                {(() => {
                  const slots = [
                    {
                      type: 'Account Specimen' as const,
                      label: 'Account Specimen',
                      inputRef: specimenInputRef,
                      isDragging: isDraggingSpecimen,
                      setIsDragging: setIsDraggingSpecimen,
                    },
                    {
                      type: 'ID Card / Passport' as const,
                      label: 'ID / Passport',
                      inputRef: idDocInputRef,
                      isDragging: isDraggingIdDoc,
                      setIsDragging: setIsDraggingIdDoc,
                    },
                    {
                      type: 'Other' as const,
                      label: 'Other Supporting Docs',
                      inputRef: otherDocInputRef,
                      isDragging: isDraggingOtherDoc,
                      setIsDragging: setIsDraggingOtherDoc,
                    },
                  ];

                  return (
                    <div className="space-y-2.5">
                      {slots.map((slot) => {
                        const doc = documents.find((d) => d.type === slot.type);

                        return (
                          <DocumentSlotRow
                            key={slot.type}
                            label={slot.label}
                            doc={doc}
                            isDragging={slot.isDragging}
                            onDragStateChange={slot.setIsDragging}
                            onBrowse={() => slot.inputRef.current?.click()}
                            onDropFiles={(files) =>
                              handleFileUpload(
                                files,
                                slot.type,
                                slot.type === 'Other' ? otherDocRemark : undefined
                              )
                            }
                            onRemove={() => {
                              if (doc) handleRemoveDocument(doc.id);
                            }}
                          />
                        );
                      })}
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
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Contact Information & Residential Address</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-3">
                  Residential Address
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>Employment & Banking Information</span>
                </h2>
              </div>

              {/* Employment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Managing Director"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Position / Title</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g. Founder & CEO"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Type of Business</label>
                  <input
                    type="text"
                    value={typeOfBusiness}
                    onChange={(e) => setTypeOfBusiness(e.target.value)}
                    placeholder="e.g. Technology & Logistics"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Level of Position</label>
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Organization / Employer Name</label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="e.g. Vance Robotics Corp Ltd"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Length of Work</label>
                  <input
                    type="text"
                    value={lengthOfWork}
                    onChange={(e) => setLengthOfWork(e.target.value)}
                    placeholder="e.g. 5 years"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Office Telephone</label>
                  <input
                    type="text"
                    value={officeTelephone}
                    onChange={(e) => setOfficeTelephone(e.target.value)}
                    placeholder="+855 23 881 990"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Organization Address</label>
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
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-3">
                  Designated Settlement Bank Account
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Bank Name</label>
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
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Account Owner Name</label>
                    <input
                      type="text"
                      value={accountOwner}
                      onChange={(e) => setAccountOwner(e.target.value)}
                      placeholder="ELEANOR VANCE"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Saving / Account Type</label>
                    <input
                      type="text"
                      value={savingAccount}
                      onChange={(e) => setSavingAccount(e.target.value)}
                      placeholder="Premier Savings"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Bank Account Number</label>
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
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Family & Related Persons</span>
                </h2>
              </div>

              {/* Spouse Section - Always visible */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      Spouse Information
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Optional (Provide if legally married)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name (English / Khmer)</label>
                    <input
                      type="text"
                      value={spouseName}
                      onChange={(e) => setSpouseName(e.target.value)}
                      placeholder="e.g. Julian Vance"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Latin Name</label>
                    <input
                      type="text"
                      value={spouseLatin}
                      onChange={(e) => setSpouseLatin(e.target.value)}
                      placeholder="e.g. Julian Vance"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={spouseRelationship}
                      onChange={(e) => setSpouseRelationship(e.target.value)}
                      placeholder="Spouse / Partner"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={spouseEmail}
                      onChange={(e) => setSpouseEmail(e.target.value)}
                      placeholder="spouse@techinvest.kh"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mobile Phone</label>
                    <input
                      type="text"
                      value={spouseMobile}
                      onChange={(e) => setSpouseMobile(e.target.value)}
                      placeholder="+855 12 887 651"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Office Telephone</label>
                    <input
                      type="text"
                      value={spouseOfficePhone}
                      onChange={(e) => setSpouseOfficePhone(e.target.value)}
                      placeholder="+855 23 881 992"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Occupation</label>
                    <input
                      type="text"
                      value={spouseOccupation}
                      onChange={(e) => setSpouseOccupation(e.target.value)}
                      placeholder="e.g. Architect"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Position / Title</label>
                    <input
                      type="text"
                      value={spousePosition}
                      onChange={(e) => setSpousePosition(e.target.value)}
                      placeholder="e.g. Partner"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Type of Business</label>
                    <input
                      type="text"
                      value={spouseBusiness}
                      onChange={(e) => setSpouseBusiness(e.target.value)}
                      placeholder="e.g. Architecture & Design"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Residential / Working Address</label>
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
                    <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      Related Person / Emergency Contact
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Optional (Designated emergency or affiliate party)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={relName}
                      onChange={(e) => setRelName(e.target.value)}
                      placeholder="e.g. Sokha Vance"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Latin Name</label>
                    <input
                      type="text"
                      value={relLatin}
                      onChange={(e) => setRelLatin(e.target.value)}
                      placeholder="e.g. Sokha Vance"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Gender</label>
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
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={relRelationship}
                      onChange={(e) => setRelRelationship(e.target.value)}
                      placeholder="e.g. Sibling / Business Partner / Parent"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mobile Phone</label>
                    <input
                      type="text"
                      value={relMobile}
                      onChange={(e) => setRelMobile(e.target.value)}
                      placeholder="+855 17 992 001"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={relEmail}
                      onChange={(e) => setRelEmail(e.target.value)}
                      placeholder="sokha.vance@gmail.com"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Residential Address</label>
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
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Account Information (Investor ID & Trading Account)</span>
                </h2>
              </div>

              {/* Investor ID info */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                  Investor ID Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Investor ID Number</label>
                    <input
                      type="text"
                      value={investorIdNumber}
                      onChange={(e) => setInvestorIdNumber(e.target.value)}
                      placeholder="INV-882910 (Auto-generated if blank)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Securities Firm</label>
                    <input
                      type="text"
                      value={securitiesFirm}
                      onChange={(e) => setSecuritiesFirm(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Customer Received By (CSO)</label>
                    <input
                      type="text"
                      value={customerReceivedBy}
                      onChange={(e) => setCustomerReceivedBy(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Customer Status</label>
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
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Application Date</label>
                    <input
                      type="date"
                      value={applicationDate}
                      onChange={(e) => setApplicationDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date Sent to SECC</label>
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
                <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                  Trading Account Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Trading Account Number</label>
                    <input
                      type="text"
                      value={tradingAccountNumber}
                      onChange={(e) => setTradingAccountNumber(e.target.value)}
                      placeholder="TRD-770192 (Auto-assigned)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Account Opening Date</label>
                    <input
                      type="date"
                      value={accountDate}
                      onChange={(e) => setAccountDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assigned SR</label>
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
}

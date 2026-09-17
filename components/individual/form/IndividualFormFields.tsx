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
import { User, ShieldCheck, CreditCard, Briefcase, Users, Upload, Building, Phone, Mail, Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AddressFields,
  FormAddress,
  FormInput,
  FormPhone,
  FormSelect,
  FormTextarea,
  formatPhoneValue,
  parsePhoneValue,
} from '@/components/ui/form';
import { DocumentSlotRow } from '@/components/shared/DocumentSlotRow';

export type FormStepKey = 'personal' | 'identification' | 'employment' | 'family' | 'account';

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
  note: string;
  email: string;
  mobile: string;
  telephone: string;
  country: string;
  city: string;
  /** District / Khan. */
  state: string;
  commune: string;
  homeNo: string;
  streetNo: string;
  occupation: string;
  position: string;
  typeOfBusiness: string;
  levelOfPosition: PositionLevel;
  organizationName: string;
  lengthOfWork: string;
  officeTelephone: string;
  orgCountry: string;
  orgCity: string;
  /** District / Khan. */
  orgDistrict: string;
  orgCommune: string;
  orgHomeNo: string;
  orgStreetNo: string;
  bankName: string;
  accountOwner: string;
  savingAccount: string;
  accountNumber: string;
  spouseName: string;
  spouseLatin: string;
  spouseGender: Gender;
  spouseEmail: string;
  spouseYearWork: string;
  spouseRelationship: string;
  spouseOccupation: string;
  spousePosition: string;
  spouseBusiness: string;
  spouseMobile: string;
  spouseOfficePhone: string;
  spouseCountry: string;
  spouseCity: string;
  /** District / Khan. */
  spouseDistrict: string;
  spouseCommune: string;
  spouseHomeNo: string;
  spouseStreetNo: string;
  relName: string;
  relLatin: string;
  relEmail: string;
  relGender: Gender;
  relRelationship: string;
  relMobile: string;
  relCountry: string;
  relCity: string;
  /** District / Khan. */
  relDistrict: string;
  relCommune: string;
  relHomeNo: string;
  relStreetNo: string;
  investorIdNumber: string;
  securitiesFirm: string;
  customerReceivedBy: string;
  applicationDate: string;
  dateSentToSECC: string;
  dateReceivedFromSECC: string;
  investorIdExpiredDate: string;
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
    note: '',
    email: '',
    mobile: '',
    telephone: '',
    country: 'Cambodia',
    city: 'Phnom Penh',
    state: 'Daun Penh',
    commune: '',
    homeNo: '',
    streetNo: '',
    occupation: '',
    position: '',
    typeOfBusiness: '',
    levelOfPosition: 'Senior',
    organizationName: '',
    lengthOfWork: '3 years',
    officeTelephone: '',
    orgCountry: 'Cambodia',
    orgCity: '',
    orgDistrict: '',
    orgCommune: '',
    orgHomeNo: '',
    orgStreetNo: '',
    bankName: 'Canadia Bank Plc',
    accountOwner: '',
    savingAccount: 'Premier Savings Account',
    accountNumber: '',
    spouseName: '',
    spouseLatin: '',
    spouseGender: 'Female',
    spouseEmail: '',
    spouseYearWork: '2020',
    spouseRelationship: 'Spouse',
    spouseOccupation: '',
    spousePosition: '',
    spouseBusiness: '',
    spouseMobile: '',
    spouseOfficePhone: '',
    spouseCountry: 'Cambodia',
    spouseCity: '',
    spouseDistrict: '',
    spouseCommune: '',
    spouseHomeNo: '',
    spouseStreetNo: '',
    relName: '',
    relLatin: '',
    relEmail: '',
    relGender: 'Female',
    relRelationship: 'Sibling',
    relMobile: '',
    relCountry: 'Cambodia',
    relCity: '',
    relDistrict: '',
    relCommune: '',
    relHomeNo: '',
    relStreetNo: '',
    investorIdNumber: '',
    securitiesFirm: 'Nexus Securities Plc',
    customerReceivedBy: 'Sophea Keo (CSO)',
    applicationDate: '2026-09-09',
    dateSentToSECC: '2026-09-10',
    dateReceivedFromSECC: '',
    investorIdExpiredDate: '2036-09-09',
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
    note: individual.note || '',
    email: individual.email || '',
    mobile: individual.mobile || individual.phone || '',
    telephone: individual.telephone || '',
    country: individual.address?.country || 'Cambodia',
    city: individual.address?.city || 'Phnom Penh',
    state: individual.address?.state || 'Daun Penh',
    commune: individual.address?.commune || '',
    homeNo: individual.address?.homeNo || '',
    streetNo: individual.address?.streetNo || individual.address?.street || '',
    occupation: individual.employment?.occupation || individual.occupation || '',
    position: individual.employment?.position || '',
    typeOfBusiness: individual.employment?.typeOfBusiness || '',
    levelOfPosition: individual.employment?.levelOfPosition || 'Senior',
    organizationName: individual.employment?.organizationName || individual.employer || '',
    lengthOfWork: individual.employment?.lengthOfWork || '3 years',
    officeTelephone: individual.employment?.officeTelephone || '',
    orgCountry: individual.employment?.organizationCountry || 'Cambodia',
    orgCity: individual.employment?.organizationCity || '',
    orgDistrict: individual.employment?.organizationDistrict || '',
    orgCommune: individual.employment?.organizationCommune || '',
    orgHomeNo: individual.employment?.organizationHomeNo || '',
    orgStreetNo: individual.employment?.organizationStreetNo || individual.employment?.organizationAddress || '',
    bankName: individual.banking?.bankName || 'Canadia Bank Plc',
    accountOwner: individual.banking?.accountOwner || '',
    savingAccount: individual.banking?.savingAccount || 'Premier Savings Account',
    accountNumber: individual.banking?.accountNumber || '',
    spouseName: individual.spouse?.fullName || '',
    spouseLatin: individual.spouse?.latin || '',
    spouseGender: individual.spouse?.gender || 'Female',
    spouseEmail: individual.spouse?.email || '',
    spouseYearWork: individual.spouse?.yearOfEmployment || '2020',
    spouseRelationship: individual.spouse?.relationship || 'Spouse',
    spouseOccupation: individual.spouse?.occupation || '',
    spousePosition: individual.spouse?.position || '',
    spouseBusiness: individual.spouse?.typeOfBusiness || '',
    spouseMobile: individual.spouse?.mobile || '',
    spouseOfficePhone: individual.spouse?.officeTelephone || '',
    spouseCountry: individual.spouse?.addressCountry || 'Cambodia',
    spouseCity: individual.spouse?.addressCity || '',
    spouseDistrict: individual.spouse?.addressDistrict || '',
    spouseCommune: individual.spouse?.addressCommune || '',
    spouseHomeNo: individual.spouse?.addressHomeNo || '',
    spouseStreetNo: individual.spouse?.addressStreetNo || individual.spouse?.address || '',
    relName: individual.relatedPerson?.fullName || '',
    relLatin: individual.relatedPerson?.latin || '',
    relEmail: individual.relatedPerson?.email || '',
    relGender: individual.relatedPerson?.gender || 'Female',
    relRelationship: individual.relatedPerson?.relationship || 'Sibling',
    relMobile: individual.relatedPerson?.mobile || '',
    relCountry: individual.relatedPerson?.addressCountry || 'Cambodia',
    relCity: individual.relatedPerson?.addressCity || '',
    relDistrict: individual.relatedPerson?.addressDistrict || '',
    relCommune: individual.relatedPerson?.addressCommune || '',
    relHomeNo: individual.relatedPerson?.addressHomeNo || '',
    relStreetNo: individual.relatedPerson?.addressStreetNo || individual.relatedPerson?.address || '',
    investorIdNumber: individual.investorIdInfo?.investorIdNumber || '',
    securitiesFirm: individual.investorIdInfo?.securitiesFirm || 'Nexus Securities Plc',
    customerReceivedBy: individual.investorIdInfo?.customerReceivedBy || 'Sophea Keo (CSO)',
    applicationDate: individual.investorIdInfo?.applicationDate || '2026-09-09',
    dateSentToSECC: individual.investorIdInfo?.dateSentToSECC || '2026-09-10',
    // Records created before this field existed store the literal 'Pending'; a date input cannot show it.
    dateReceivedFromSECC:
      individual.investorIdInfo?.dateReceivedFromSECC === 'Pending'
        ? ''
        : individual.investorIdInfo?.dateReceivedFromSECC || '',
    investorIdExpiredDate: individual.investorIdInfo?.investorIdExpiredDate || '2036-09-09',
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
    note,
    email,
    mobile,
    telephone,
    country,
    city,
    state,
    commune,
    homeNo,
    streetNo,
    occupation,
    position,
    typeOfBusiness,
    levelOfPosition,
    organizationName,
    lengthOfWork,
    officeTelephone,
    orgCountry,
    orgCity,
    orgDistrict,
    orgCommune,
    orgHomeNo,
    orgStreetNo,
    bankName,
    accountOwner,
    savingAccount,
    accountNumber,
    spouseName,
    spouseLatin,
    spouseGender,
    spouseEmail,
    spouseYearWork,
    spouseRelationship,
    spouseOccupation,
    spousePosition,
    spouseBusiness,
    spouseMobile,
    spouseOfficePhone,
    spouseCountry,
    spouseCity,
    spouseDistrict,
    spouseCommune,
    spouseHomeNo,
    spouseStreetNo,
    relName,
    relLatin,
    relEmail,
    relGender,
    relRelationship,
    relMobile,
    relCountry,
    relCity,
    relDistrict,
    relCommune,
    relHomeNo,
    relStreetNo,
    investorIdNumber,
    securitiesFirm,
    customerReceivedBy,
    applicationDate,
    dateSentToSECC,
    dateReceivedFromSECC,
    investorIdExpiredDate,
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
  const setNote = (value: IndividualFormValues['note']) => setValue('note', value);
  const setEmail = (value: IndividualFormValues['email']) => setValue('email', value);
  const setMobile = (value: IndividualFormValues['mobile']) => setValue('mobile', value);
  const setTelephone = (value: IndividualFormValues['telephone']) => setValue('telephone', value);
  const setCountry = (value: IndividualFormValues['country']) => setValue('country', value);
  const setCity = (value: IndividualFormValues['city']) => setValue('city', value);
  const setState = (value: IndividualFormValues['state']) => setValue('state', value);
  const setCommune = (value: IndividualFormValues['commune']) => setValue('commune', value);
  const setHomeNo = (value: IndividualFormValues['homeNo']) => setValue('homeNo', value);
  const setStreetNo = (value: IndividualFormValues['streetNo']) => setValue('streetNo', value);
  const setOccupation = (value: IndividualFormValues['occupation']) => setValue('occupation', value);
  const setPosition = (value: IndividualFormValues['position']) => setValue('position', value);
  const setTypeOfBusiness = (value: IndividualFormValues['typeOfBusiness']) => setValue('typeOfBusiness', value);
  const setLevelOfPosition = (value: IndividualFormValues['levelOfPosition']) => setValue('levelOfPosition', value);
  const setOrganizationName = (value: IndividualFormValues['organizationName']) => setValue('organizationName', value);
  const setLengthOfWork = (value: IndividualFormValues['lengthOfWork']) => setValue('lengthOfWork', value);
  const setOfficeTelephone = (value: IndividualFormValues['officeTelephone']) => setValue('officeTelephone', value);
  const setOrgCountry = (value: IndividualFormValues['orgCountry']) => setValue('orgCountry', value);
  const setOrgCity = (value: IndividualFormValues['orgCity']) => setValue('orgCity', value);
  const setOrgDistrict = (value: IndividualFormValues['orgDistrict']) => setValue('orgDistrict', value);
  const setOrgCommune = (value: IndividualFormValues['orgCommune']) => setValue('orgCommune', value);
  const setOrgHomeNo = (value: IndividualFormValues['orgHomeNo']) => setValue('orgHomeNo', value);
  const setOrgStreetNo = (value: IndividualFormValues['orgStreetNo']) => setValue('orgStreetNo', value);
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
  const setSpouseGender = (value: IndividualFormValues['spouseGender']) => setValue('spouseGender', value);
  const setSpouseCountry = (value: IndividualFormValues['spouseCountry']) => setValue('spouseCountry', value);
  const setSpouseCity = (value: IndividualFormValues['spouseCity']) => setValue('spouseCity', value);
  const setSpouseDistrict = (value: IndividualFormValues['spouseDistrict']) => setValue('spouseDistrict', value);
  const setSpouseCommune = (value: IndividualFormValues['spouseCommune']) => setValue('spouseCommune', value);
  const setSpouseHomeNo = (value: IndividualFormValues['spouseHomeNo']) => setValue('spouseHomeNo', value);
  const setSpouseStreetNo = (value: IndividualFormValues['spouseStreetNo']) => setValue('spouseStreetNo', value);
  const setRelName = (value: IndividualFormValues['relName']) => setValue('relName', value);
  const setRelLatin = (value: IndividualFormValues['relLatin']) => setValue('relLatin', value);
  const setRelEmail = (value: IndividualFormValues['relEmail']) => setValue('relEmail', value);
  const setRelGender = (value: IndividualFormValues['relGender']) => setValue('relGender', value);
  const setRelRelationship = (value: IndividualFormValues['relRelationship']) => setValue('relRelationship', value);
  const setRelMobile = (value: IndividualFormValues['relMobile']) => setValue('relMobile', value);
  const setRelCountry = (value: IndividualFormValues['relCountry']) => setValue('relCountry', value);
  const setRelCity = (value: IndividualFormValues['relCity']) => setValue('relCity', value);
  const setRelDistrict = (value: IndividualFormValues['relDistrict']) => setValue('relDistrict', value);
  const setRelCommune = (value: IndividualFormValues['relCommune']) => setValue('relCommune', value);
  const setRelHomeNo = (value: IndividualFormValues['relHomeNo']) => setValue('relHomeNo', value);
  const setRelStreetNo = (value: IndividualFormValues['relStreetNo']) => setValue('relStreetNo', value);
  const setInvestorIdNumber = (value: IndividualFormValues['investorIdNumber']) => setValue('investorIdNumber', value);
  const setSecuritiesFirm = (value: IndividualFormValues['securitiesFirm']) => setValue('securitiesFirm', value);
  const setCustomerReceivedBy = (value: IndividualFormValues['customerReceivedBy']) => setValue('customerReceivedBy', value);
  const setApplicationDate = (value: IndividualFormValues['applicationDate']) => setValue('applicationDate', value);
  const setDateSentToSECC = (value: IndividualFormValues['dateSentToSECC']) => setValue('dateSentToSECC', value);
  const setDateReceivedFromSECC = (value: IndividualFormValues['dateReceivedFromSECC']) => setValue('dateReceivedFromSECC', value);
  const setInvestorIdExpiredDate = (value: IndividualFormValues['investorIdExpiredDate']) => setValue('investorIdExpiredDate', value);
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

                  {/* Right Side Fields: Identity & Demographics */}
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                    <FormInput
                      label="Surname (English)"
                      required
                      value={surnameEN}
                      onChange={(e) => setSurnameEN(e.target.value)}
                      placeholder="e.g. Vance"
                      error={errors.surnameEN}
                    />

                    <FormInput
                      label="Given Name (English)"
                      required
                      value={givenNameEN}
                      onChange={(e) => setGivenNameEN(e.target.value)}
                      placeholder="e.g. Eleanor"
                      error={errors.givenNameEN}
                    />

                    <FormInput
                      label="Surname (Khmer)"
                      value={surnameKH}
                      onChange={(e) => setSurnameKH(e.target.value)}
                      placeholder="ត្រកូលជាភាសាខ្មែរ"
                      className="font-khmer"
                    />

                    <FormInput
                      label="Given Name (Khmer)"
                      value={givenNameKH}
                      onChange={(e) => setGivenNameKH(e.target.value)}
                      placeholder="នាមជាភាសាខ្មែរ"
                      className="font-khmer"
                    />

                    <FormInput
                      label="Date of Birth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />

                    <FormSelect
                      label="Gender"
                      value={gender}
                      onChange={(next) => setGender(next as Gender)}
                      options={['Male', 'Female', 'Other']}
                    />

                    <FormSelect
                      label="Marital Status"
                      value={maritalStatus}
                      onChange={(next) => setMaritalStatus(next as MaritalStatus)}
                      options={['Single', 'Married', 'Divorced', 'Widowed']}
                    />

                    <FormInput
                      label="Nationality"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g. Cambodian, British..."
                    />
                  </div>
                </div>
              </div>

              {/* Contact channels: the field labels name them, so the group needs no heading */}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <FormInput
                    label="Email Address"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@domain.com"
                    icon={Mail}
                    error={errors.email}
                  />

                  <FormPhone
                    label="Mobile Phone"
                    value={parsePhoneValue(mobile)}
                    onChange={(next) => setMobile(formatPhoneValue(next))}
                  />

                  <FormPhone
                    label="Telephone (Fixed Line)"
                    value={parsePhoneValue(telephone)}
                    onChange={(next) => setTelephone(formatPhoneValue(next))}
                  />
                </div>
              </div>

              {/* Residential Address */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-3">
                  Residential Address
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <AddressFields
                    value={{
                      country,
                      city,
                      district: state,
                      commune,
                      homeNo,
                      streetNo,
                    }}
                    onChange={(next) => {
                      setCountry(next.country);
                      setCity(next.city);
                      setState(next.district);
                      setCommune(next.commune);
                      setHomeNo(next.homeNo);
                      setStreetNo(next.streetNo);
                    }}
                  />
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
                <FormSelect
                  label="Residency"
                  required
                  value={residency}
                  onChange={(next) => setResidency(next as ResidencyStatus)}
                  options={['Resident', 'Non-Resident']}
                />

                <FormSelect
                  label="ID Type"
                  required
                  value={idType}
                  onChange={(next) => setIdType(next as any)}
                  options={[
                    { value: 'National ID', label: 'National ID Card' },
                    { value: 'Passport', label: 'International Passport' },
                    { value: 'Driver License', label: 'Driver License' },
                    { value: 'Government ID', label: 'Government ID' },
                    { value: 'Tax ID', label: 'Tax ID Document' },
                  ]}
                />

                <FormInput
                  label="ID Number"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g. KHM-019829381"
                  error={errors.idNumber}
                  className="font-mono"
                />

                <FormInput
                  label="Issued By"
                  value={issuedBy}
                  onChange={(e) => setIssuedBy(e.target.value)}
                />

                <FormInput
                  label="Issued Date"
                  type="date"
                  value={issuedDate}
                  onChange={(e) => setIssuedDate(e.target.value)}
                />

                <FormInput
                  label="Expired Date"
                  type="date"
                  value={expiredDate}
                  onChange={(e) => setExpiredDate(e.target.value)}
                />

                <FormInput
                  label="Taxpayer ID Number (TIN)"
                  value={taxpayerIdNumber}
                  onChange={(e) => setTaxpayerIdNumber(e.target.value)}
                  placeholder="e.g. TIN-889102941"
                  className="font-mono"
                />

                <FormTextarea
                  label="Note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any remark about the identification documents (optional)"
                  rows={3}
                  containerClassName="sm:col-span-2 md:col-span-4"
                />
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
                <FormInput
                  label="Occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="e.g. Managing Director"
                />

                <FormInput
                  label="Position / Title"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Founder & CEO"
                />

                <FormInput
                  label="Type of Business"
                  value={typeOfBusiness}
                  onChange={(e) => setTypeOfBusiness(e.target.value)}
                  placeholder="e.g. Technology & Logistics"
                />

                <FormSelect
                  label="Level of Position"
                  value={levelOfPosition}
                  onChange={(next) => setLevelOfPosition(next as PositionLevel)}
                  options={[
                    { value: 'Staff', label: 'Staff / Associate' },
                    { value: 'Senior', label: 'Senior Specialist' },
                    { value: 'Manager', label: 'Manager / Dept Head' },
                    { value: 'Executive / C-Level', label: 'Executive / C-Level / Director' },
                  ]}
                />

                <FormInput
                  label="Organization / Employer Name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Vance Robotics Corp Ltd"
                />

                <FormInput
                  label="Length of Work"
                  value={lengthOfWork}
                  onChange={(e) => setLengthOfWork(e.target.value)}
                  placeholder="e.g. 5 years"
                />

                <FormPhone
                  label="Office Telephone"
                  value={parsePhoneValue(officeTelephone)}
                  onChange={(next) => setOfficeTelephone(formatPhoneValue(next))}
                />

                <FormAddress
                  label="Organization Address"
                  value={{
                    country: orgCountry,
                    city: orgCity,
                    district: orgDistrict,
                    commune: orgCommune,
                    homeNo: orgHomeNo,
                    streetNo: orgStreetNo,
                  }}
                  onChange={(next) => {
                    setOrgCountry(next.country);
                    setOrgCity(next.city);
                    setOrgDistrict(next.district);
                    setOrgCommune(next.commune);
                    setOrgHomeNo(next.homeNo);
                    setOrgStreetNo(next.streetNo);
                  }}
                />
              </div>

              {/* Designated settlement bank account */}
              <div className="pt-4 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <FormSelect
                    label="Bank Name"
                    value={bankName}
                    onChange={(next) => setBankName(next)}
                    options={['Canadia Bank Plc', 'Other Local Commercial Bank', 'Foreign Commercial Bank']}
                  />

                  <FormInput
                    label="Account Owner Name"
                    value={accountOwner}
                    onChange={(e) => setAccountOwner(e.target.value)}
                    placeholder="ELEANOR VANCE"
                  />

                  <FormInput
                    label="Saving / Account Type"
                    value={savingAccount}
                    onChange={(e) => setSavingAccount(e.target.value)}
                    placeholder="Premier Savings"
                  />

                  <FormInput
                    label="Bank Account Number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="001 982 441 902"
                    className="font-mono"
                  />
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
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
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
                  <FormInput
                    label="Full Name (English / Khmer)"
                    value={spouseName}
                    onChange={(e) => setSpouseName(e.target.value)}
                    placeholder="e.g. Julian Vance"
                  />
                  <FormInput
                    label="Latin Name"
                    value={spouseLatin}
                    onChange={(e) => setSpouseLatin(e.target.value)}
                    placeholder="e.g. Julian Vance"
                  />
                  <FormSelect
                    label="Gender"
                    value={spouseGender}
                    onChange={(next) => setSpouseGender(next as Gender)}
                    options={['Female', 'Male', 'Other']}
                  />
                  <FormInput
                    label="Relationship"
                    value={spouseRelationship}
                    onChange={(e) => setSpouseRelationship(e.target.value)}
                    placeholder="Spouse / Partner"
                  />
                  <FormInput
                    label="Email"
                    type="email"
                    value={spouseEmail}
                    onChange={(e) => setSpouseEmail(e.target.value)}
                    placeholder="spouse@techinvest.kh"
                  />
                  <FormPhone
                    label="Mobile Phone"
                    value={parsePhoneValue(spouseMobile)}
                    onChange={(next) => setSpouseMobile(formatPhoneValue(next))}
                  />
                  <FormPhone
                    label="Office Telephone"
                    value={parsePhoneValue(spouseOfficePhone)}
                    onChange={(next) => setSpouseOfficePhone(formatPhoneValue(next))}
                  />
                  <FormInput
                    label="Occupation"
                    value={spouseOccupation}
                    onChange={(e) => setSpouseOccupation(e.target.value)}
                    placeholder="e.g. Architect"
                  />
                  <FormInput
                    label="Position / Title"
                    value={spousePosition}
                    onChange={(e) => setSpousePosition(e.target.value)}
                    placeholder="e.g. Partner"
                  />
                  <FormInput
                    label="Type of Business"
                    value={spouseBusiness}
                    onChange={(e) => setSpouseBusiness(e.target.value)}
                    placeholder="e.g. Architecture & Design"
                  />
                  <FormInput
                    label="Year of Employment"
                    value={spouseYearWork}
                    onChange={(e) => setSpouseYearWork(e.target.value)}
                    placeholder="e.g. 2020"
                    className="font-mono"
                  />
                  <FormAddress
                    label="Residential / Working Address"
                    value={{
                      country: spouseCountry,
                      city: spouseCity,
                      district: spouseDistrict,
                      commune: spouseCommune,
                      homeNo: spouseHomeNo,
                      streetNo: spouseStreetNo,
                    }}
                    onChange={(next) => {
                      setSpouseCountry(next.country);
                      setSpouseCity(next.city);
                      setSpouseDistrict(next.district);
                      setSpouseCommune(next.commune);
                      setSpouseHomeNo(next.homeNo);
                      setSpouseStreetNo(next.streetNo);
                    }}
                  />
                </div>
              </div>

              {/* Related Person Section - Always visible */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
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
                  <FormInput
                    label="Full Name"
                    value={relName}
                    onChange={(e) => setRelName(e.target.value)}
                    placeholder="e.g. Sokha Vance"
                  />
                  <FormInput
                    label="Latin Name"
                    value={relLatin}
                    onChange={(e) => setRelLatin(e.target.value)}
                    placeholder="e.g. Sokha Vance"
                  />
                  <FormSelect
                    label="Gender"
                    value={relGender}
                    onChange={(next) => setRelGender(next as any)}
                    options={['Female', 'Male', 'Other']}
                  />
                  <FormInput
                    label="Relationship"
                    value={relRelationship}
                    onChange={(e) => setRelRelationship(e.target.value)}
                    placeholder="e.g. Sibling / Business Partner / Parent"
                  />
                  <FormPhone
                    label="Mobile Phone"
                    value={parsePhoneValue(relMobile)}
                    onChange={(next) => setRelMobile(formatPhoneValue(next))}
                  />
                  <FormInput
                    label="Email"
                    type="email"
                    value={relEmail}
                    onChange={(e) => setRelEmail(e.target.value)}
                    placeholder="sokha.vance@gmail.com"
                  />
                  <FormAddress
                    label="Residential Address"
                    value={{
                      country: relCountry,
                      city: relCity,
                      district: relDistrict,
                      commune: relCommune,
                      homeNo: relHomeNo,
                      streetNo: relStreetNo,
                    }}
                    onChange={(next) => {
                      setRelCountry(next.country);
                      setRelCity(next.city);
                      setRelDistrict(next.district);
                      setRelCommune(next.commune);
                      setRelHomeNo(next.homeNo);
                      setRelStreetNo(next.streetNo);
                    }}
                  />
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

              {/* Investor ID + trading account: one registration lifecycle */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                  Investor ID & Trading Account
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <FormInput
                    label="Investor ID Number"
                    value={investorIdNumber}
                    onChange={(e) => setInvestorIdNumber(e.target.value)}
                    placeholder="INV-882910 (Auto-generated if blank)"
                    className="font-mono"
                  />

                  <FormInput
                    label="Securities Firm"
                    value={securitiesFirm}
                    onChange={(e) => setSecuritiesFirm(e.target.value)}
                  />

                  <FormInput
                    label="Customer Received By (CSO)"
                    value={customerReceivedBy}
                    onChange={(e) => setCustomerReceivedBy(e.target.value)}
                  />

                  <FormSelect
                    label="Customer Status"
                    value={investorStatus}
                    onChange={(next) => setInvestorStatus(next as any)}
                    options={['Normal', 'VIP', 'Restricted']}
                  />

                  <FormInput
                    label="Application Date"
                    type="date"
                    value={applicationDate}
                    onChange={(e) => setApplicationDate(e.target.value)}
                  />

                  <FormInput
                    label="Date Sent to SECC"
                    type="date"
                    value={dateSentToSECC}
                    onChange={(e) => setDateSentToSECC(e.target.value)}
                  />

                  <FormInput
                    label="Date Received from SECC"
                    type="date"
                    value={dateReceivedFromSECC}
                    onChange={(e) => setDateReceivedFromSECC(e.target.value)}
                  />

                  <FormInput
                    label="Investor ID Expired Date"
                    type="date"
                    value={investorIdExpiredDate}
                    onChange={(e) => setInvestorIdExpiredDate(e.target.value)}
                  />

                  <FormInput
                    label="Trading Account Number"
                    value={tradingAccountNumber}
                    onChange={(e) => setTradingAccountNumber(e.target.value)}
                    placeholder="TRD-770192 (Auto-assigned)"
                    className="font-mono"
                  />

                  <FormInput
                    label="Account Opening Date"
                    type="date"
                    value={accountDate}
                    onChange={(e) => setAccountDate(e.target.value)}
                  />

                  <FormInput
                    label="Assigned SR"
                    value={currentAssignedSR}
                    onChange={(e) => setCurrentAssignedSR(e.target.value)}
                  />

                  <FormInput
                    label="Account Approved By"
                    value={accountApprovedBy}
                    onChange={(e) => setAccountApprovedBy(e.target.value)}
                    placeholder="e.g. Vannak Lim (Manager)"
                  />
                </div>
              </div>

              {/* Investor Profile & Appropriateness */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                  Investor Profile & Appropriateness
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <FormSelect
                    label="Customer Type"
                    required
                    value={customerType}
                    onChange={(next) => setCustomerType(next as CustomerType)}
                    options={[
                      { value: 'Retail', label: 'Retail Investor' },
                      { value: 'Corporate Officer', label: 'Corporate Officer' },
                      { value: 'High Net Worth', label: 'High Net Worth (HNW)' },
                      { value: 'Institutional', label: 'Institutional' },
                    ]}
                  />

                  <FormSelect
                    label="Education Background"
                    value={educationBackground}
                    onChange={(next) => setEducationBackground(next as EducationBackground)}
                    options={[
                      { value: 'High School', label: 'High School' },
                      { value: 'Bachelor\'s', label: 'Bachelor\'s Degree' },
                      { value: 'Master\'s', label: 'Master\'s Degree' },
                      { value: 'Doctorate', label: 'Doctorate / Ph.D.' },
                      { value: 'Other', label: 'Other Professional' },
                    ]}
                  />

                  <FormSelect
                    label="Securities Knowledge"
                    value={securitiesKnowledge}
                    onChange={(next) => setSecuritiesKnowledge(next as SecuritiesKnowledge)}
                    options={['None', 'Beginner', 'Intermediate', 'Advanced', 'Professional']}
                  />

                  <FormSelect
                    label="Risk Category"
                    value={riskCategory}
                    onChange={(next) => setRiskCategory(next as RiskRating)}
                    options={[
                      { value: 'low', label: 'Low Risk (Capital Preservation)' },
                      { value: 'moderate', label: 'Moderate Risk (Balanced Growth)' },
                      { value: 'high', label: 'High Risk (Aggressive Capital Appreciation)' },
                    ]}
                  />

                  <FormSelect
                    label="Investment Experience"
                    value={investmentExperience}
                    onChange={(next) => setInvestmentExperience(next as InvestmentExperience)}
                    options={['< 1 year', '1 - 3 years', '3 - 5 years', '5+ years']}
                  />
                </div>
              </div>
            </div>
          )}
    </>
  );
}

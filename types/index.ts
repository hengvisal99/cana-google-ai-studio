export type DesignTheme = 'soft-fintech' | 'glassmorphism' | 'aurora';

export type NavigationPage = 
  | 'dashboard'
  | 'customer-360'
  | 'individual-list'
  | 'individual-insert'
  | 'individual-update'
  | 'customer-type'
  | 'form-fields';

export type KYCStatus = 'verified' | 'pending' | 'under_review' | 'rejected';
export type RiskRating = 'low' | 'moderate' | 'high';
export type IndividualCategory = 'Retail' | 'Wealth & Premier' | 'Corporate Officer' | 'Private Banking';

export type RequestType = 'Registration' | 'Close Account';
export type RequestStatus = 'Approved' | 'Resubmit' | 'Pending' | 'Rejected';
export type ProfileStatus = 'Completed' | 'Incomplete';
export type AccountStatus = 'Not Opened' | 'Active' | 'Closed';
export type WorkflowRole = 'CSO' | 'SR' | 'Manager';
export type WorkflowStage = 'CSO' | 'SR' | 'Manager' | 'Approved' | 'Rejected' | 'Resubmit' | 'Closed';

export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';
export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';
export type ResidencyStatus = 'Resident' | 'Non-Resident';
export type CustomerType = 'Retail' | 'High Net Worth' | 'Institutional' | 'Corporate Officer';

// Service customer types: a customer can hold many, each with its own dynamic form
export type CustomerTypeId =
  | 'csx-screen'
  | 'client-card'
  | 'employee-trading'
  | 'vip-customer'
  | 'ipo-customer'
  | 'personal-representative';
export type CustomerTypeFieldValue = string | boolean;

/** One record of a customer type; a customer can have many, including several of the same type */
export interface CustomerTypeRecord {
  id: string;
  /** Individual.id of the owning customer */
  customerId: string;
  typeId: CustomerTypeId;
  values: Record<string, CustomerTypeFieldValue>;
  /** Registration / close-account workflow, for types that need approval */
  approval?: CustomerTypeApproval;
  createdAt: string;
  updatedAt: string;
}

/** Same CSO → SR → Manager flow as a customer's registration and close account */
export interface CustomerTypeApproval {
  requestType: RequestType;
  requestStatus: RequestStatus;
  currentWorkflowStage: WorkflowStage;
  history: AuthorizationTimelineItem[];
  /** Set by a close-account request */
  cancelledDate?: string;
}
export type EducationBackground = 'High School' | "Bachelor's" | "Master's" | 'Doctorate' | 'Professional' | 'Other';
export type SecuritiesKnowledge = 'None' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
export type InvestmentExperience = '< 1 year' | '1 - 3 years' | '3 - 5 years' | '5+ years';
export type PositionLevel = 'Staff' | 'Senior' | 'Manager' | 'Executive / C-Level' | 'Owner / Partner';

export interface SupportingDocument {
  id: string;
  type: 'Account Specimen' | 'ID Card / Passport' | 'Other';
  fileName: string;
  fileUrl?: string;
  fileSize?: string;
  uploadedAt: string;
  remark?: string;
}

export interface EmploymentInfo {
  occupation: string;
  position: string;
  typeOfBusiness: string;
  levelOfPosition: PositionLevel;
  organizationName: string;
  lengthOfWork: string;
  officeTelephone: string;
  /** Composed one-line address; the structured parts below are what the forms edit. */
  organizationAddress: string;
  organizationCountry?: string;
  organizationCity?: string;
  /** District / Khan. */
  organizationDistrict?: string;
  organizationCommune?: string;
  organizationHomeNo?: string;
  organizationStreetNo?: string;
}

export interface BankingInfo {
  bankName: string;
  accountOwner: string;
  savingAccount: string;
  accountNumber: string;
}

export interface SpouseInfo {
  fullName: string;
  latin: string;
  gender?: Gender;
  email: string;
  yearOfEmployment: string;
  relationship: string;
  occupation: string;
  position: string;
  typeOfBusiness: string;
  mobile: string;
  officeTelephone: string;
  /** Composed one-line address; the structured parts below are what the forms edit. */
  address: string;
  addressCountry?: string;
  addressCity?: string;
  /** District / Khan. */
  addressDistrict?: string;
  addressCommune?: string;
  addressHomeNo?: string;
  addressStreetNo?: string;
}

export interface RelatedPersonInfo {
  fullName: string;
  latin: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  relationship: string;
  mobile: string;
  /** Composed one-line address; the structured parts below are what the forms edit. */
  address: string;
  addressCountry?: string;
  addressCity?: string;
  /** District / Khan. */
  addressDistrict?: string;
  addressCommune?: string;
  addressHomeNo?: string;
  addressStreetNo?: string;
}

export interface InvestorIdInfo {
  investorIdNumber: string;
  securitiesFirm: string;
  customerReceivedBy: string;
  applicationDate: string;
  dateSentToSECC: string;
  dateReceivedFromSECC: string;
  investorIdExpiredDate: string;
  customerStatus: 'Normal' | 'VIP' | 'Restricted';
}

export interface TradingAccountInfo {
  tradingAccountNumber: string;
  accountDate: string;
  accountCheckedBy: string;
  accountApprovedBy: string;
  email: string;
  currentAssignedSR: string;
  phoneNumber: string;
}

export interface AuthorizationTimelineItem {
  id: string;
  stage: string;
  status: 'Approved' | 'Resubmit' | 'Pending' | 'Rejected' | 'Submitted' | 'Queue';
  dateTime: string;
  processedBy: string;
  role: WorkflowRole;
  comment?: string;
  reason?: string;
  requestType?: RequestType;
}

export interface CloseAccountInfo {
  closeDate: string;
  account: string;
  reason: string;
}

export interface Individual {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  surnameEN: string;
  givenNameEN: string;
  surnameKH: string;
  givenNameKH: string;
  fullNameEN?: string;
  fullNameKH?: string;
  email: string;
  phone: string;
  mobile: string;
  telephone: string;
  avatarUrl: string;
  dateOfBirth: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  nationality: string;

  // Investor Profile
  securitiesKnowledge: SecuritiesKnowledge;
  riskCategory: RiskRating | 'Low' | 'Moderate' | 'High' | 'Speculative';
  investmentExperience: InvestmentExperience;
  customerType: CustomerType;
  educationBackground: EducationBackground;

  // Identification
  residency: ResidencyStatus;
  idType: string;
  idNumber: string;
  issuedBy: string;
  issuedDate: string;
  expiredDate: string;
  taxpayerIdNumber: string;
  /** Free-text remark captured with the identification documents. */
  note?: string;
  supportingDocuments: SupportingDocument[];

  // Employment & Banking
  employment: EmploymentInfo;
  banking: BankingInfo;

  // Family & Related Persons
  spouse?: SpouseInfo;
  relatedPerson?: RelatedPersonInfo;

  // Account Information
  investorIdInfo: InvestorIdInfo;
  tradingAccountInfo: TradingAccountInfo;

  // Statuses & Workflow
  profileStatus: ProfileStatus;
  accountStatus: AccountStatus;
  requestType: RequestType;
  requestStatus: RequestStatus;
  currentWorkflowStage: WorkflowStage;
  authorizationHistory: AuthorizationTimelineItem[];
  closeAccountInfo?: CloseAccountInfo;

  // Compatibility fields
  idExpiryDate: string;
  kycStatus: KYCStatus;
  riskRating: RiskRating;
  category: IndividualCategory;
  occupation: string;
  employer: string;
  annualIncome: number;
  creditScore: number;
  netWorth: number;
  totalDeposits: number;
  branch: string;
  address: {
    street: string;
    city: string;
    /** District / Khan. */
    state: string;
    postalCode: string;
    country: string;
    /** Cambodian address parts the individual forms capture; `street` keeps the composed line. */
    commune?: string;
    homeNo?: string;
    streetNo?: string;
  };
  tags: string[];
  createdAt: string;
  lastActive: string;
  relationshipManager: string;
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  type: 'Checking' | 'High-Yield Savings' | 'Investment Portfolio' | 'Mortgage Loan' | 'Commercial Credit';
  balance: number;
  currency: string;
  status: 'Active' | 'Dormant' | 'Restricted';
  interestRate?: string;
}

export interface BankCard {
  id: string;
  cardNumber: string;
  type: 'Visa Infinite' | 'Mastercard World Elite' | 'Nexus Platinum' | 'Virtual Fleet';
  cardHolder: string;
  expiry: string;
  limit: number;
  spent: number;
  status: 'Active' | 'Frozen' | 'Locked';
  colorGradient: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  merchant: string;
  category: 'Wire Transfer' | 'Merchant Payment' | 'Securities' | 'Dividend' | 'Payroll' | 'Fee';
  amount: number;
  type: 'debit' | 'credit';
  status: 'Completed' | 'Pending' | 'Flagged';
  account: string;
}

export interface AuditTouchpoint {
  id: string;
  date: string;
  channel: 'Branch Office' | 'Mobile Banking' | 'Call Center' | 'Relationship Manager' | 'Compliance Review';
  summary: string;
  officer: string;
  badgeType: 'info' | 'warning' | 'success' | 'action';
}

export interface ProductPortfolioItem {
  id: string;
  productName: string;
  productId: string;
  validFrom: string;
  validTo: string;
  expiryDays: string;
  status: 'Active' | 'Expiring Soon' | 'Expired';
}

export interface IPOTransactionRecord {
  id: string;
  dateTime: string;
  ipoName: string;
  transactionType: 'IPO Subscription' | 'Buy' | 'Sell' | 'Dividend';
  quantity: number;
  price: number;
  tradingValue: number;
  currency?: string;
}

export interface Customer360Activity {
  id: string;
  dateTime: string;
  activity: string;
  referenceId?: string;
  processedBy?: string;
  role?: string;
}

export interface Customer360Profile {
  individual: Individual;
  relationshipScore: number; // 0 - 100
  churnRisk: 'Low' | 'Medium' | 'Elevated';
  lifetimeValue: number;
  tenureYears: number;
  accounts: BankAccount[];
  cards: BankCard[];
  transactions: FinancialTransaction[];
  touchpoints: AuditTouchpoint[];
  aiNotes: string[];
}

export type SupportedLanguage = 'EN' | 'ES' | 'FR' | 'DE' | 'JA';

export type EnterpriseApp = 
  | 'Nexus Core Banking'
  | 'Nexus Wealth & Asset'
  | 'Risk & AML Gateway'
  | 'Corporate Treasury 360';

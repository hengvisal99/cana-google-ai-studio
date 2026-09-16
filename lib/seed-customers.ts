import {
  Individual,
  CustomerType,
  Gender,
  MaritalStatus,
  IndividualCategory,
  SecuritiesKnowledge,
  InvestmentExperience,
  EducationBackground,
  PositionLevel,
} from '@/types';

/**
 * Ten extra customers for the Customer 360 directory.
 *
 * That screen only lists opened accounts (Active or Closed), and the original
 * eight seeds left just three of those, so the sidebar had almost nothing to
 * scroll. These fill it out.
 *
 * Every value is derived from the seed below — nothing here calls Math.random()
 * or Date.now(). Random data would differ between the server render and the
 * client render and trip React's hydration check.
 */
interface CustomerSeed {
  /** Drives id (IND-90xx), customerId (CID-0090xx) and every generated number */
  seq: number;
  givenEN: string;
  surnameEN: string;
  givenKH: string;
  surnameKH: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  nationality: string;
  dateOfBirth: string;
  emailDomain: string;
  mobile: string;
  occupation: string;
  position: string;
  levelOfPosition: PositionLevel;
  organizationName: string;
  typeOfBusiness: string;
  organizationAddress: string;
  customerType: CustomerType;
  risk: 'Low' | 'Moderate' | 'High';
  accountStatus: 'Active' | 'Closed';
  annualIncome: number;
  netWorth: number;
  totalDeposits: number;
  creditScore: number;
  branch: string;
  relationshipManager: string;
  street: string;
  city: string;
  postalCode: string;
  createdAt: string;
  lastActive: string;
  tags: string[];
  idPrefix: string;
  issuedBy: string;
}

/** Reused from the existing seeds so every avatar is a URL known to resolve. */
const AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
];

const KNOWLEDGE: SecuritiesKnowledge[] = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
const EXPERIENCE: InvestmentExperience[] = ['< 1 year', '1 - 3 years', '3 - 5 years', '5+ years'];
const EDUCATION: EducationBackground[] = ["Bachelor's", "Master's", 'Professional', 'Doctorate'];
const BANKS = ['ABA Bank Plc', 'Canadia Bank Plc', 'ACLEDA Bank Plc', 'Wing Bank Plc'];

/** High Net Worth clients are private banking, Institutional sits in wealth, and so on. */
function categoryFor(type: CustomerType): IndividualCategory {
  switch (type) {
    case 'High Net Worth':
      return 'Private Banking';
    case 'Institutional':
      return 'Wealth & Premier';
    case 'Corporate Officer':
      return 'Corporate Officer';
    default:
      return 'Retail';
  }
}

/** Nine-digit account numbers in the '001 440 910 882' shape used by the other seeds. */
function accountNumber(seq: number): string {
  const digits = String(100000000 + seq * 7919).slice(0, 9);
  return `00${(seq % 3) + 1} ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
}

function buildCustomer(seed: CustomerSeed): Individual {
  const n = 9000 + seed.seq;
  const id = `IND-${n}`;
  const customerId = `CID-00${n}`;
  const fullNameEN = `${seed.givenEN} ${seed.surnameEN}`;
  const fullNameKH = `${seed.givenKH} ${seed.surnameKH}`;
  const email = `${seed.givenEN.toLowerCase()}.${seed.surnameEN.toLowerCase()}@${seed.emailDomain}`;
  const isClosed = seed.accountStatus === 'Closed';
  const riskRating = seed.risk.toLowerCase() as 'low' | 'moderate' | 'high';
  const officeTel = `+855 23 ${String(700 + seed.seq)} ${String(100 + seed.seq * 3)}`;
  const openedYear = Number(seed.createdAt.slice(0, 4));

  return {
    id,
    customerId,
    firstName: seed.givenEN,
    lastName: seed.surnameEN,
    surnameEN: seed.surnameEN,
    givenNameEN: seed.givenEN,
    surnameKH: seed.surnameKH,
    givenNameKH: seed.givenKH,
    fullNameEN,
    fullNameKH,
    email,
    phone: seed.mobile,
    mobile: seed.mobile,
    telephone: officeTel,
    avatarUrl: AVATARS[seed.seq % AVATARS.length],
    dateOfBirth: seed.dateOfBirth,
    gender: seed.gender,
    maritalStatus: seed.maritalStatus,
    nationality: seed.nationality,

    // Investor Profile
    securitiesKnowledge: KNOWLEDGE[seed.seq % KNOWLEDGE.length],
    riskCategory: seed.risk,
    investmentExperience: EXPERIENCE[seed.seq % EXPERIENCE.length],
    customerType: seed.customerType,
    educationBackground: EDUCATION[seed.seq % EDUCATION.length],

    // Identification
    residency: seed.nationality === 'Cambodian' ? 'Resident' : 'Non-Resident',
    idType: seed.nationality === 'Cambodian' ? 'National ID' : 'Passport',
    idNumber: `${seed.idPrefix}-${String(100000000 + seed.seq * 6421).slice(0, 9)}`,
    issuedBy: seed.issuedBy,
    issuedDate: `${openedYear - 2}-03-18`,
    expiredDate: `${openedYear + 8}-03-18`,
    taxpayerIdNumber: `TIN-${seed.idPrefix}-${String(100000 + seed.seq * 4111).slice(0, 6)}`,
    supportingDocuments: [
      {
        id: `DOC-${n}-1`,
        type: 'ID Card / Passport',
        fileName: `${seed.surnameEN.toLowerCase()}-${seed.idPrefix.toLowerCase()}-id.pdf`,
        fileSize: '1.2 MB',
        uploadedAt: `${seed.createdAt} 09:14`,
      },
      {
        id: `DOC-${n}-2`,
        type: 'Account Specimen',
        fileName: `${seed.surnameEN.toLowerCase()}-specimen.pdf`,
        fileSize: '640 KB',
        uploadedAt: `${seed.createdAt} 09:26`,
      },
    ],

    // Employment & Banking
    employment: {
      occupation: seed.occupation,
      position: seed.position,
      typeOfBusiness: seed.typeOfBusiness,
      levelOfPosition: seed.levelOfPosition,
      organizationName: seed.organizationName,
      lengthOfWork: `${4 + (seed.seq % 12)} years`,
      officeTelephone: officeTel,
      organizationAddress: seed.organizationAddress,
    },
    banking: {
      bankName: BANKS[seed.seq % BANKS.length],
      accountOwner: fullNameEN,
      savingAccount: 'Savings (USD)',
      accountNumber: accountNumber(seed.seq),
    },

    relatedPerson: {
      fullName: `${seed.givenKH} ${seed.surnameKH}`,
      latin: `${seed.givenEN} ${seed.surnameEN} (next of kin)`,
      email: `kin.${seed.surnameEN.toLowerCase()}@${seed.emailDomain}`,
      gender: seed.gender === 'Male' ? 'Female' : 'Male',
      relationship: seed.maritalStatus === 'Married' ? 'Spouse' : 'Sibling',
      mobile: `+855 ${String(10 + (seed.seq % 80))} ${String(200 + seed.seq)} ${String(300 + seed.seq * 2)}`,
      address: `${seed.street}, ${seed.city}`,
    },

    // Account Information
    investorIdInfo: {
      investorIdNumber: `INV-${String(100000 + seed.seq * 8731).slice(0, 6)}`,
      securitiesFirm: 'Nexus Securities Plc',
      customerReceivedBy: 'Sophal Kim (CSO)',
      applicationDate: seed.createdAt,
      dateSentToSECC: `${openedYear}-${seed.createdAt.slice(5, 7)}-18`,
      dateReceivedFromSECC: `${openedYear}-${seed.createdAt.slice(5, 7)}-27`,
      investorIdExpiredDate: `${openedYear + 5}-${seed.createdAt.slice(5, 7)}-27`,
      customerStatus: seed.customerType === 'High Net Worth' ? 'VIP' : 'Normal',
    },
    tradingAccountInfo: {
      tradingAccountNumber: `TRD-${String(100000 + seed.seq * 9137).slice(0, 6)}`,
      accountDate: seed.createdAt,
      accountCheckedBy: 'Dara Vong (SR)',
      accountApprovedBy: seed.relationshipManager,
      email,
      currentAssignedSR: 'Dara Vong (SR)',
      phoneNumber: seed.mobile,
    },

    // Statuses & Workflow
    profileStatus: 'Completed',
    accountStatus: seed.accountStatus,
    requestType: isClosed ? 'Close Account' : 'Registration',
    requestStatus: 'Approved',
    currentWorkflowStage: isClosed ? 'Closed' : 'Approved',
    authorizationHistory: [
      {
        id: `AUTH-${n}-1`,
        stage: 'CSO',
        status: 'Submitted',
        dateTime: `${seed.createdAt} 09:30`,
        processedBy: 'Sophal Kim',
        role: 'CSO',
        comment: 'Documents collected and verified at branch.',
      },
      {
        id: `AUTH-${n}-2`,
        stage: 'SR',
        status: 'Approved',
        dateTime: `${seed.createdAt} 14:05`,
        processedBy: 'Dara Vong',
        role: 'SR',
        comment: 'KYC screening cleared.',
      },
      {
        id: `AUTH-${n}-3`,
        stage: 'Manager',
        status: 'Approved',
        dateTime: `${seed.createdAt} 16:40`,
        processedBy: seed.relationshipManager,
        role: 'Manager',
        comment: isClosed ? 'Account opened; later closed at client request.' : 'Trading account activated.',
      },
    ],
    ...(isClosed && {
      closeAccountInfo: {
        closeDate: `${openedYear + 2}-06-30`,
        account: `TRD-${String(100000 + seed.seq * 9137).slice(0, 6)}`,
        reason: 'Client relocated and consolidated holdings with another firm.',
      },
    }),

    // Compatibility fields
    idExpiryDate: `${openedYear + 8}-03-18`,
    kycStatus: 'verified',
    riskRating,
    category: categoryFor(seed.customerType),
    occupation: seed.occupation,
    employer: seed.organizationName,
    annualIncome: seed.annualIncome,
    creditScore: seed.creditScore,
    netWorth: seed.netWorth,
    totalDeposits: seed.totalDeposits,
    branch: seed.branch,
    address: {
      street: seed.street,
      city: seed.city,
      state: seed.city === 'Phnom Penh' ? 'Phnom Penh Capital' : seed.city,
      postalCode: seed.postalCode,
      country: seed.nationality === 'Cambodian' ? 'Cambodia' : seed.nationality,
    },
    tags: seed.tags,
    createdAt: seed.createdAt,
    lastActive: seed.lastActive,
    relationshipManager: seed.relationshipManager,
  };
}

const SEEDS: CustomerSeed[] = [
  {
    seq: 29,
    givenEN: 'Sophea',
    surnameEN: 'Chan',
    givenKH: 'សុភា',
    surnameKH: 'ចាន់',
    gender: 'Female',
    maritalStatus: 'Married',
    nationality: 'Cambodian',
    dateOfBirth: '1990-02-11',
    emailDomain: 'angkorretail.com.kh',
    mobile: '+855 12 447 118',
    occupation: 'Retail Operations Manager',
    position: 'Operations Manager',
    levelOfPosition: 'Manager',
    organizationName: 'Angkor Retail Group',
    typeOfBusiness: 'Retail & Distribution',
    organizationAddress: 'St 271, Toul Tom Poung, Phnom Penh',
    customerType: 'Retail',
    risk: 'Moderate',
    accountStatus: 'Active',
    annualIncome: 42000,
    netWorth: 168000,
    totalDeposits: 96500,
    creditScore: 712,
    branch: 'Phnom Penh Central Financial (Branch 101)',
    relationshipManager: 'Victoria Sterling',
    street: 'St 271, Toul Tom Poung',
    city: 'Phnom Penh',
    postalCode: '120508',
    createdAt: '2022-04-11',
    lastActive: '2 hours ago',
    tags: ['Retail Investor', 'Mobile Active'],
    idPrefix: 'KHM',
    issuedBy: 'General Department of Identification',
  },
  {
    seq: 30,
    givenEN: 'Dara',
    surnameEN: 'Pich',
    givenKH: 'តារា',
    surnameKH: 'ពេជ្រ',
    gender: 'Male',
    maritalStatus: 'Married',
    nationality: 'Cambodian',
    dateOfBirth: '1979-11-26',
    emailDomain: 'pichholdings.com.kh',
    mobile: '+855 12 908 774',
    occupation: 'Group Chairman',
    position: 'Chairman',
    levelOfPosition: 'Owner / Partner',
    organizationName: 'Pich Holdings Co., Ltd.',
    typeOfBusiness: 'Property & Investment',
    organizationAddress: 'Norodom Blvd, Chamkarmon, Phnom Penh',
    customerType: 'High Net Worth',
    risk: 'Low',
    accountStatus: 'Active',
    annualIncome: 620000,
    netWorth: 4850000,
    totalDeposits: 1780000,
    creditScore: 831,
    branch: 'Phnom Penh Central Financial (Branch 101)',
    relationshipManager: 'Julian Thorne',
    street: 'Norodom Blvd, Chamkarmon',
    city: 'Phnom Penh',
    postalCode: '120102',
    createdAt: '2019-08-02',
    lastActive: '15 mins ago',
    tags: ['Ultra High Net Worth', 'Priority AML Approved'],
    idPrefix: 'KHM',
    issuedBy: 'General Department of Identification',
  },
  {
    seq: 31,
    givenEN: 'Isabelle',
    surnameEN: 'Laurent',
    givenKH: 'អ៊ីសាបែល',
    surnameKH: 'ឡូរ៉ង់',
    gender: 'Female',
    maritalStatus: 'Single',
    nationality: 'French',
    dateOfBirth: '1985-06-30',
    emailDomain: 'laurent-capital.fr',
    mobile: '+855 92 330 145',
    occupation: 'Fund Director',
    position: 'Director of Investments',
    levelOfPosition: 'Executive / C-Level',
    organizationName: 'Laurent Capital Partners',
    typeOfBusiness: 'Asset Management',
    organizationAddress: 'Exchange Square, Level 9, Phnom Penh',
    customerType: 'Institutional',
    risk: 'Moderate',
    accountStatus: 'Active',
    annualIncome: 310000,
    netWorth: 1960000,
    totalDeposits: 845000,
    creditScore: 798,
    branch: 'Paris Boulevard Haussmann (Branch 014)',
    relationshipManager: 'Antoine Laurent',
    street: 'Exchange Square, Level 9',
    city: 'Phnom Penh',
    postalCode: '120211',
    createdAt: '2021-01-19',
    lastActive: '1 day ago',
    tags: ['Institutional Mandate', 'Cross-Border'],
    idPrefix: 'FRA',
    issuedBy: 'Préfecture de Police de Paris',
  },
  {
    seq: 32,
    givenEN: 'Rithy',
    surnameEN: 'Sok',
    givenKH: 'រិទ្ធី',
    surnameKH: 'សុខ',
    gender: 'Male',
    maritalStatus: 'Single',
    nationality: 'Cambodian',
    dateOfBirth: '1995-09-08',
    emailDomain: 'sokventures.io',
    mobile: '+855 17 662 903',
    occupation: 'Software Entrepreneur',
    position: 'Founder',
    levelOfPosition: 'Owner / Partner',
    organizationName: 'Sok Ventures',
    typeOfBusiness: 'Technology',
    organizationAddress: 'St 315, Boeung Kak, Phnom Penh',
    customerType: 'Retail',
    risk: 'High',
    accountStatus: 'Active',
    annualIncome: 88000,
    netWorth: 240000,
    totalDeposits: 132000,
    creditScore: 664,
    branch: 'Phnom Penh Central Financial (Branch 101)',
    relationshipManager: 'Gabriel Ross',
    street: 'St 315, Boeung Kak',
    city: 'Phnom Penh',
    postalCode: '120404',
    createdAt: '2023-05-30',
    lastActive: '30 mins ago',
    tags: ['Speculative Trader', 'High Turnover'],
    idPrefix: 'KHM',
    issuedBy: 'General Department of Identification',
  },
  {
    seq: 33,
    givenEN: 'Yuki',
    surnameEN: 'Tanaka',
    givenKH: 'យូគី',
    surnameKH: 'តាណាកា',
    gender: 'Female',
    maritalStatus: 'Married',
    nationality: 'Japanese',
    dateOfBirth: '1982-12-04',
    emailDomain: 'tanaka-trading.jp',
    mobile: '+855 96 118 402',
    occupation: 'Regional Trade Director',
    position: 'Regional Director',
    levelOfPosition: 'Executive / C-Level',
    organizationName: 'Tanaka Trading K.K.',
    typeOfBusiness: 'Import & Export',
    organizationAddress: 'Monivong Blvd, Daun Penh, Phnom Penh',
    customerType: 'High Net Worth',
    risk: 'Low',
    accountStatus: 'Closed',
    annualIncome: 275000,
    netWorth: 1420000,
    totalDeposits: 0,
    creditScore: 805,
    branch: 'Tokyo Marunouchi (Branch 091)',
    relationshipManager: 'Kenichi Sato',
    street: 'Monivong Blvd, Daun Penh',
    city: 'Phnom Penh',
    postalCode: '120201',
    createdAt: '2020-03-16',
    lastActive: '8 months ago',
    tags: ['Closed Account', 'Relocated'],
    idPrefix: 'JPN',
    issuedBy: 'Ministry of Foreign Affairs of Japan',
  },
  {
    seq: 34,
    givenEN: 'Vuthy',
    surnameEN: 'Meas',
    givenKH: 'វុទ្ធី',
    surnameKH: 'មាស',
    gender: 'Male',
    maritalStatus: 'Married',
    nationality: 'Cambodian',
    dateOfBirth: '1981-07-19',
    emailDomain: 'mekongpower.com.kh',
    mobile: '+855 12 774 209',
    occupation: 'Chief Financial Officer',
    position: 'CFO',
    levelOfPosition: 'Executive / C-Level',
    organizationName: 'Mekong Power Plc',
    typeOfBusiness: 'Energy & Utilities',
    organizationAddress: 'Russian Blvd, Sen Sok, Phnom Penh',
    customerType: 'Corporate Officer',
    risk: 'Moderate',
    accountStatus: 'Active',
    annualIncome: 196000,
    netWorth: 910000,
    totalDeposits: 505000,
    creditScore: 776,
    branch: 'Phnom Penh Central Financial (Branch 101)',
    relationshipManager: 'Helena Weber',
    street: 'Russian Blvd, Sen Sok',
    city: 'Phnom Penh',
    postalCode: '120801',
    createdAt: '2021-10-07',
    lastActive: '4 hours ago',
    tags: ['Listed Company Officer', 'Insider Reporting'],
    idPrefix: 'KHM',
    issuedBy: 'General Department of Identification',
  },
  {
    seq: 35,
    givenEN: 'Daniel',
    surnameEN: 'Okonkwo',
    givenKH: 'ដានីយ៉ែល',
    surnameKH: 'អូកុងក្វូ',
    gender: 'Male',
    maritalStatus: 'Single',
    nationality: 'Nigerian',
    dateOfBirth: '1992-03-22',
    emailDomain: 'okonkwologistics.ng',
    mobile: '+855 78 990 312',
    occupation: 'Logistics Consultant',
    position: 'Senior Consultant',
    levelOfPosition: 'Senior',
    organizationName: 'Okonkwo Logistics Ltd',
    typeOfBusiness: 'Freight & Logistics',
    organizationAddress: 'St 598, Chroy Changvar, Phnom Penh',
    customerType: 'Retail',
    risk: 'High',
    accountStatus: 'Active',
    annualIncome: 67000,
    netWorth: 185000,
    totalDeposits: 74000,
    creditScore: 641,
    branch: 'Phnom Penh Central Financial (Branch 101)',
    relationshipManager: 'Gabriel Ross',
    street: 'St 598, Chroy Changvar',
    city: 'Phnom Penh',
    postalCode: '120701',
    createdAt: '2023-09-14',
    lastActive: '3 days ago',
    tags: ['Enhanced Due Diligence', 'Non-Resident'],
    idPrefix: 'NGA',
    issuedBy: 'Nigeria Immigration Service',
  },
  {
    seq: 36,
    givenEN: 'Chanlina',
    surnameEN: 'Keo',
    givenKH: 'ចន្លិណា',
    surnameKH: 'កែវ',
    gender: 'Female',
    maritalStatus: 'Divorced',
    nationality: 'Cambodian',
    dateOfBirth: '1987-05-02',
    emailDomain: 'keojewellery.com.kh',
    mobile: '+855 11 552 880',
    occupation: 'Managing Director',
    position: 'Managing Director',
    levelOfPosition: 'Owner / Partner',
    organizationName: 'Keo Jewellery Co., Ltd.',
    typeOfBusiness: 'Luxury Retail',
    organizationAddress: 'Sothearos Blvd, Tonle Bassac, Phnom Penh',
    customerType: 'High Net Worth',
    risk: 'Low',
    accountStatus: 'Active',
    annualIncome: 398000,
    netWorth: 2740000,
    totalDeposits: 1120000,
    creditScore: 822,
    branch: 'Phnom Penh Central Financial (Branch 101)',
    relationshipManager: 'Julian Thorne',
    street: 'Sothearos Blvd, Tonle Bassac',
    city: 'Phnom Penh',
    postalCode: '120101',
    createdAt: '2020-11-23',
    lastActive: '45 mins ago',
    tags: ['Private Banking', 'Priority AML Approved'],
    idPrefix: 'KHM',
    issuedBy: 'General Department of Identification',
  },
  {
    seq: 37,
    givenEN: 'Arjun',
    surnameEN: 'Mehta',
    givenKH: 'អាជុន',
    surnameKH: 'មេថា',
    gender: 'Male',
    maritalStatus: 'Married',
    nationality: 'Indian',
    dateOfBirth: '1977-01-15',
    emailDomain: 'mehtaadvisors.in',
    mobile: '+855 93 447 021',
    occupation: 'Portfolio Strategist',
    position: 'Head of Strategy',
    levelOfPosition: 'Executive / C-Level',
    organizationName: 'Mehta Advisors Pvt Ltd',
    typeOfBusiness: 'Financial Advisory',
    organizationAddress: 'Preah Sihanouk Blvd, Chamkarmon, Phnom Penh',
    customerType: 'Institutional',
    risk: 'Moderate',
    accountStatus: 'Closed',
    annualIncome: 224000,
    netWorth: 1180000,
    totalDeposits: 0,
    creditScore: 789,
    branch: 'Singapore Marina Bay (Branch 055)',
    relationshipManager: 'Helena Weber',
    street: 'Preah Sihanouk Blvd, Chamkarmon',
    city: 'Phnom Penh',
    postalCode: '120105',
    createdAt: '2019-06-11',
    lastActive: '1 year ago',
    tags: ['Closed Account', 'Institutional Mandate'],
    idPrefix: 'IND',
    issuedBy: 'Ministry of External Affairs of India',
  },
  {
    seq: 38,
    givenEN: 'Sreymom',
    surnameEN: 'Nou',
    givenKH: 'ស្រីមុំ',
    surnameKH: 'នូ',
    gender: 'Female',
    maritalStatus: 'Single',
    nationality: 'Cambodian',
    dateOfBirth: '1997-08-27',
    emailDomain: 'nouagritech.com.kh',
    mobile: '+855 15 228 640',
    occupation: 'Agritech Analyst',
    position: 'Senior Analyst',
    levelOfPosition: 'Senior',
    organizationName: 'Nou Agritech Co., Ltd.',
    typeOfBusiness: 'Agriculture Technology',
    organizationAddress: 'National Road 5, Russey Keo, Phnom Penh',
    customerType: 'Retail',
    risk: 'Moderate',
    accountStatus: 'Active',
    annualIncome: 38500,
    netWorth: 121000,
    totalDeposits: 58400,
    creditScore: 703,
    branch: 'Phnom Penh Central Financial (Branch 101)',
    relationshipManager: 'Victoria Sterling',
    street: 'National Road 5, Russey Keo',
    city: 'Phnom Penh',
    postalCode: '120601',
    createdAt: '2024-02-05',
    lastActive: '6 hours ago',
    tags: ['Retail Investor', 'IPO Subscriber'],
    idPrefix: 'KHM',
    issuedBy: 'General Department of Identification',
  },
];

/** Eight Active and two Closed, so both Customer 360 tabs have something in them. */
export const GENERATED_INDIVIDUALS: Individual[] = SEEDS.map(buildCustomer);

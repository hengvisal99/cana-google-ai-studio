import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  CreditCard,
  Flag,
  GraduationCap,
  Heart,
  Home,
  IdCard,
  Landmark,
  Layers,
  ShieldAlert,
  Store,
  Tags,
  TrendingUp,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type MasterDataCategoryId =
  | 'marital-status'
  | 'nationality'
  | 'residency'
  | 'id-type'
  | 'education-background'
  | 'occupation'
  | 'level-of-position'
  | 'type-of-business'
  | 'bank-name'
  | 'account-type'
  | 'securities-firm'
  | 'relationship'
  | 'assigned-reviewer'
  | 'approved-by'
  | 'customer-type'
  | 'risk-category'
  | 'securities-knowledge'
  | 'investment-experience';

export type MasterDataGroupId = 'personal' | 'employment' | 'banking' | 'relationship-staff' | 'classification';

export interface MasterDataCategory {
  id: MasterDataCategoryId;
  groupId: MasterDataGroupId;
  label: string;
  icon: LucideIcon;
}

export interface MasterDataItem {
  id: string;
  categoryId: MasterDataCategoryId;
  name: string;
  nameKh: string;
  active: boolean;
  updatedAt: string;
}

export const MASTER_DATA_GROUPS: { id: MasterDataGroupId; label: string }[] = [
  { id: 'personal', label: 'Personal' },
  { id: 'employment', label: 'Employment' },
  { id: 'banking', label: 'Banking' },
  { id: 'relationship-staff', label: 'Relationship & Staff' },
  { id: 'classification', label: 'Classification' },
];

export const MASTER_DATA_CATEGORIES: MasterDataCategory[] = [
  { id: 'marital-status', groupId: 'personal', label: 'Marital Status', icon: Heart },
  { id: 'nationality', groupId: 'personal', label: 'Nationality', icon: Flag },
  { id: 'residency', groupId: 'personal', label: 'Residency', icon: Home },
  { id: 'id-type', groupId: 'personal', label: 'ID Type', icon: IdCard },
  { id: 'education-background', groupId: 'personal', label: 'Education Background', icon: GraduationCap },
  { id: 'occupation', groupId: 'employment', label: 'Occupation', icon: Briefcase },
  { id: 'level-of-position', groupId: 'employment', label: 'Level of Position', icon: Layers },
  { id: 'type-of-business', groupId: 'employment', label: 'Type of Business', icon: Store },
  { id: 'bank-name', groupId: 'banking', label: 'Bank Name', icon: Landmark },
  { id: 'account-type', groupId: 'banking', label: 'Account Type', icon: CreditCard },
  { id: 'securities-firm', groupId: 'banking', label: 'Securities Firm', icon: Building2 },
  { id: 'relationship', groupId: 'relationship-staff', label: 'Relationship', icon: Users },
  { id: 'assigned-reviewer', groupId: 'relationship-staff', label: 'Assigned Reviewer', icon: UserCheck },
  { id: 'approved-by', groupId: 'relationship-staff', label: 'Approved By', icon: BadgeCheck },
  { id: 'customer-type', groupId: 'classification', label: 'Customer Type', icon: Tags },
  { id: 'risk-category', groupId: 'classification', label: 'Risk Category', icon: ShieldAlert },
  { id: 'securities-knowledge', groupId: 'classification', label: 'Securities Knowledge', icon: BookOpen },
  { id: 'investment-experience', groupId: 'classification', label: 'Investment Experience', icon: TrendingUp },
];

export function getMasterDataCategory(id: MasterDataCategoryId) {
  return MASTER_DATA_CATEGORIES.find((category) => category.id === id) ?? MASTER_DATA_CATEGORIES[0];
}

const seed = (
  categoryId: MasterDataCategoryId,
  rows: [key: string, name: string, nameKh: string, active?: boolean][]
): MasterDataItem[] =>
  rows.map(([key, name, nameKh, active = true], index) => ({
    id: `${categoryId}-${key}`,
    categoryId,
    name,
    nameKh,
    active,
    updatedAt: new Date(Date.UTC(2026, 8, 20 - index)).toISOString(),
  }));

export const INITIAL_MASTER_DATA: MasterDataItem[] = [
  ...seed('marital-status', [
    ['SGL', 'Single', 'នៅលីវ'],
    ['MAR', 'Married', 'រៀបការ'],
    ['DIV', 'Divorced', 'លែងលះ'],
    ['WID', 'Widowed', 'មេម៉ាយ/ពោះម៉ាយ'],
  ]),
  ...seed('nationality', [
    ['KH', 'Cambodian', 'ខ្មែរ'],
    ['TH', 'Thai', 'ថៃ'],
    ['VN', 'Vietnamese', 'វៀតណាម'],
    ['CN', 'Chinese', 'ចិន'],
    ['US', 'American', 'អាមេរិក'],
    ['JP', 'Japanese', 'ជប៉ុន', false],
  ]),
  ...seed('residency', [
    ['RES', 'Resident', 'និវាសនជន'],
    ['NRS', 'Non-Resident', 'អនិវាសនជន'],
  ]),
  ...seed('id-type', [
    ['NID', 'National ID Card', 'អត្តសញ្ញាណប័ណ្ណ'],
    ['PAS', 'Passport', 'លិខិតឆ្លងដែន'],
    ['DRL', 'Driver License', 'ប័ណ្ណបើកបរ'],
    ['GOV', 'Government ID', 'ប័ណ្ណមន្ត្រីរាជការ'],
    ['TAX', 'Tax ID Document', 'ឯកសារលេខអត្តសញ្ញាណកម្មសារពើពន្ធ'],
    ['FRC', 'Family Record Book', 'សៀវភៅគ្រួសារ', false],
  ]),
  ...seed('education-background', [
    ['HS', 'High School', 'វិទ្យាល័យ'],
    ['BA', "Bachelor's Degree", 'បរិញ្ញាបត្រ'],
    ['MA', "Master's Degree", 'អនុបណ្ឌិត'],
    ['PHD', 'Doctorate / Ph.D.', 'បណ្ឌិត'],
    ['OTH', 'Other Professional', 'ផ្សេងៗ'],
  ]),
  ...seed('occupation', [
    ['EMP', 'Private Employee', 'បុគ្គលិកឯកជន'],
    ['GOV', 'Civil Servant', 'មន្ត្រីរាជការ'],
    ['BUS', 'Business Owner', 'ម្ចាស់អាជីវកម្ម'],
    ['STU', 'Student', 'សិស្ស និស្សិត'],
    ['RET', 'Retired', 'និវត្តន៍'],
  ]),
  ...seed('level-of-position', [
    ['STF', 'Staff / Associate', 'បុគ្គលិក'],
    ['SNR', 'Senior Specialist', 'អ្នកជំនាញជាន់ខ្ពស់'],
    ['MGR', 'Manager / Dept Head', 'ប្រធាននាយកដ្ឋាន'],
    ['EXE', 'Executive / C-Level / Director', 'នាយកប្រតិបត្តិ'],
  ]),
  ...seed('type-of-business', [
    ['TRD', 'Trading', 'ពាណិជ្ជកម្ម'],
    ['MFG', 'Manufacturing', 'ផលិតកម្ម'],
    ['SRV', 'Services', 'សេវាកម្ម'],
    ['FIN', 'Financial Services', 'សេវាហិរញ្ញវត្ថុ'],
    ['CON', 'Construction', 'សំណង់'],
    ['AGR', 'Agriculture', 'កសិកម្ម'],
  ]),
  ...seed('bank-name', [
    ['CAN', 'Canadia Bank Plc', 'ធនាគារ កាណាឌីយ៉ា'],
    ['ABA', 'ABA Bank', 'ធនាគារ អេ ប៊ី អេ'],
    ['ACL', 'ACLEDA Bank', 'ធនាគារ អេស៊ីលីដា'],
    ['WNG', 'Wing Bank', 'ធនាគារ វីង'],
    ['OLC', 'Other Local Commercial Bank', 'ធនាគារពាណិជ្ជក្នុងស្រុកផ្សេងទៀត'],
    ['FCB', 'Foreign Commercial Bank', 'ធនាគារពាណិជ្ជបរទេស'],
  ]),
  ...seed('account-type', [
    ['SAV', 'Savings Account', 'គណនីសន្សំ'],
    ['CUR', 'Current Account', 'គណនីចរន្ត'],
    ['FXD', 'Fixed Deposit', 'គណនីបញ្ញើមានកាលកំណត់'],
    ['FCY', 'Foreign Currency Account', 'គណនីរូបិយប័ណ្ណបរទេស'],
  ]),
  ...seed('securities-firm', [
    ['CNS', 'Canadia Securities', 'ក្រុមហ៊ុនមូលបត្រ កាណាឌីយ៉ា'],
    ['ACS', 'ACLEDA Securities', 'ក្រុមហ៊ុនមូលបត្រ អេស៊ីលីដា'],
    ['PPS', 'Phillip Securities', 'ក្រុមហ៊ុនមូលបត្រ ហ្វីលីព'],
    ['YTS', 'Yuanta Securities', 'ក្រុមហ៊ុនមូលបត្រ យានតា'],
  ]),
  ...seed('relationship', [
    ['SPO', 'Spouse', 'ប្តី/ប្រពន្ធ'],
    ['PAR', 'Parent', 'ឪពុក/ម្តាយ'],
    ['CHD', 'Child', 'កូន'],
    ['SIB', 'Sibling', 'បងប្អូន'],
    ['REL', 'Relative', 'សាច់ញាតិ'],
    ['FRD', 'Friend', 'មិត្តភក្តិ'],
  ]),
  ...seed('assigned-reviewer', [
    ['SR01', 'Dara Vong (SR)', 'វង្ស ដារា'],
    ['SR02', 'Chan Sophea (SR)', 'ចាន់ សុភា'],
  ]),
  ...seed('approved-by', [
    ['MGR01', 'Vannak Lim (Manager)', 'លឹម វណ្ណៈ'],
    ['MGR02', 'Sok Dara (Manager)', 'សុខ ដារា'],
  ]),
  ...seed('customer-type', [
    ['RTL', 'Retail Investor', 'វិនិយោគិនរាយ'],
    ['COF', 'Corporate Officer', 'មន្ត្រីក្រុមហ៊ុន'],
    ['HNW', 'High Net Worth (HNW)', 'អតិថិជនទ្រព្យសម្បត្តិខ្ពស់'],
    ['INS', 'Institutional', 'វិនិយោគិនស្ថាប័ន'],
  ]),
  ...seed('risk-category', [
    ['LOW', 'Low Risk (Capital Preservation)', 'ហានិភ័យទាប'],
    ['MOD', 'Moderate Risk (Balanced Growth)', 'ហានិភ័យមធ្យម'],
    ['HIGH', 'High Risk (Aggressive Capital Appreciation)', 'ហានិភ័យខ្ពស់'],
  ]),
  ...seed('securities-knowledge', [
    ['NON', 'None', 'គ្មាន'],
    ['BEG', 'Beginner', 'ចាប់ផ្តើម'],
    ['INT', 'Intermediate', 'មធ្យម'],
    ['ADV', 'Advanced', 'កម្រិតខ្ពស់'],
    ['PRO', 'Professional', 'អ្នកជំនាញ'],
  ]),
  ...seed('investment-experience', [
    ['LT1', '< 1 year', 'តិចជាង ១ ឆ្នាំ'],
    ['Y13', '1 - 3 years', '១ - ៣ ឆ្នាំ'],
    ['Y35', '3 - 5 years', '៣ - ៥ ឆ្នាំ'],
    ['GT5', '5+ years', 'លើសពី ៥ ឆ្នាំ'],
  ]),
];

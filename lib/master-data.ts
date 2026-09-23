import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  CreditCard,
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

export type MasterDataGroupId = 'customer-profile' | 'banking' | 'classification' | 'staff';

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
  /** Only for the staff categories (assigned reviewer, approved by) */
  staffId?: string;
  active: boolean;
  updatedAt: string;
}

export const MASTER_DATA_GROUPS: { id: MasterDataGroupId; label: string }[] = [
  // Our own people: these are the lists that carry a staff ID
  { id: 'staff', label: 'Staff' },
  // Facts about the customer, however the forms happen to split them across tabs
  { id: 'customer-profile', label: 'Customer Profile' },
  { id: 'banking', label: 'Banking' },
  // How the firm labels the customer — the lists most likely to move with policy
  { id: 'classification', label: 'Classification' },
];

export const MASTER_DATA_CATEGORIES: MasterDataCategory[] = [
  { id: 'assigned-reviewer', groupId: 'staff', label: 'Assigned Reviewer', icon: UserCheck },
  { id: 'approved-by', groupId: 'staff', label: 'Approved By', icon: BadgeCheck },
  { id: 'marital-status', groupId: 'customer-profile', label: 'Marital Status', icon: Heart },
  { id: 'residency', groupId: 'customer-profile', label: 'Residency', icon: Home },
  { id: 'id-type', groupId: 'customer-profile', label: 'ID Type', icon: IdCard },
  { id: 'education-background', groupId: 'customer-profile', label: 'Education Background', icon: GraduationCap },
  { id: 'relationship', groupId: 'customer-profile', label: 'Relationship', icon: Users },
  { id: 'occupation', groupId: 'customer-profile', label: 'Occupation', icon: Briefcase },
  { id: 'level-of-position', groupId: 'customer-profile', label: 'Level of Position', icon: Layers },
  { id: 'type-of-business', groupId: 'customer-profile', label: 'Type of Business', icon: Store },
  { id: 'bank-name', groupId: 'banking', label: 'Bank Name', icon: Landmark },
  { id: 'account-type', groupId: 'banking', label: 'Account Type', icon: CreditCard },
  { id: 'securities-firm', groupId: 'banking', label: 'Securities Firm', icon: Building2 },
  { id: 'customer-type', groupId: 'classification', label: 'Customer Type', icon: Tags },
  { id: 'risk-category', groupId: 'classification', label: 'Risk Category', icon: ShieldAlert },
  { id: 'securities-knowledge', groupId: 'classification', label: 'Securities Knowledge', icon: BookOpen },
  { id: 'investment-experience', groupId: 'classification', label: 'Investment Experience', icon: TrendingUp },
];

/** The two staff lists: their items carry a staff ID on top of the name */
export const STAFF_CATEGORY_IDS: MasterDataCategoryId[] = ['assigned-reviewer', 'approved-by'];

export function hasStaffId(id: MasterDataCategoryId) {
  return STAFF_CATEGORY_IDS.includes(id);
}

export function getMasterDataCategory(id: MasterDataCategoryId) {
  return MASTER_DATA_CATEGORIES.find((category) => category.id === id) ?? MASTER_DATA_CATEGORIES[0];
}

const seed = (
  categoryId: MasterDataCategoryId,
  rows: [key: string, name: string, nameKh: string, active?: boolean, staffId?: string][]
): MasterDataItem[] =>
  rows.map(([key, name, nameKh, active = true, staffId], index) => ({
    id: `${categoryId}-${key}`,
    categoryId,
    name,
    nameKh,
    staffId,
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
  ...seed('residency', [
    ['RES', 'Resident', 'និវាសនជន'],
    ['NRS', 'Non-Resident', 'អនិវាសនជន'],
  ]),
  ...seed('id-type', [
    ['NID', 'National ID Card', 'អត្តសញ្ញាណប័ណ្ណ'],
    ['PAS', 'Passport', 'លិខិតឆ្លងដែន'],
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
    ['SR01', 'Dara Vong (SR)', 'វង្ស ដារា', true, 'STF-1042'],
    ['SR02', 'Chan Sophea (SR)', 'ចាន់ សុភា', true, 'STF-1088'],
  ]),
  ...seed('approved-by', [
    ['MGR01', 'Vannak Lim (Manager)', 'លឹម វណ្ណៈ', true, 'STF-2011'],
    ['MGR02', 'Sok Dara (Manager)', 'សុខ ដារា', true, 'STF-2034'],
  ]),
  ...seed('customer-type', [
    ['GEN', 'General', 'ទូទៅ'],
    ['VIP', 'VIP', 'វីអាយភី'],
    ['POT', 'Potential', 'សក្ដានុពល'],
    ['EMP', 'Employee', 'បុគ្គលិក'],
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
    ['TBL', 'TreasuryBill', 'សញ្ញាប័ណ្ណរតនាគារ'],
    ['STK', 'Stock', 'ភាគហ៊ុន'],
    ['BND', 'Bond', 'សញ្ញាប័ណ្ណ'],
    ['OTH', 'Other Securities', 'មូលបត្រផ្សេងៗ'],
    ['NON', 'Nothing', 'គ្មាន'],
  ]),
];

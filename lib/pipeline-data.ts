import { Lead } from '@/types';
import { subDays, subHours } from 'date-fns';

const today = new Date();

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'LD-1001',
    name: 'Sokha Meng',
    phone: '+855 12 345 678',
    email: 'sokha.m@example.com',
    source: 'Walk-in',
    stage: 'Contacted',
    assignedSR: 'Victoria Sterling',
    createdAt: subDays(today, 5).toISOString(),
    lastContacted: subDays(today, 1).toISOString(),
    estimatedValue: 15000,
    notes: 'Walked into main branch asking about IPO investments.',
    score: 45,
    activities: [
      { id: 'a1', type: 'note', content: 'Walked into main branch asking about IPO investments.', timestamp: subDays(today, 5).toISOString() },
      { id: 'a2', type: 'call', content: 'Followed up on IPO interest. Sent prospectus.', timestamp: subDays(today, 1).toISOString() }
    ]
  },
  {
    id: 'LD-1002',
    name: 'Chan Dara',
    phone: '+855 93 221 445',
    email: 'cdara_biz@gmail.com',
    source: 'Referral',
    stage: 'Meeting Scheduled',
    assignedSR: 'Julian Thorne',
    createdAt: subDays(today, 12).toISOString(),
    lastContacted: subDays(today, 2).toISOString(),
    estimatedValue: 100000,
    notes: 'Referred by existing VIP customer. Wants to discuss corporate bonds.',
    score: 85,
    activities: [
      { id: 'a3', type: 'note', content: 'Referred by existing VIP customer.', timestamp: subDays(today, 12).toISOString() },
      { id: 'a4', type: 'call', content: 'Introductory call. Client is very interested in high-yield bonds.', timestamp: subDays(today, 10).toISOString() },
      { id: 'a5', type: 'meeting', content: 'Scheduled branch meeting for next week.', timestamp: subDays(today, 2).toISOString() }
    ]
  },
  {
    id: 'LD-1003',
    name: 'Bopha Nguon',
    phone: '+855 89 555 777',
    source: 'Online',
    stage: 'Docs Collected',
    assignedSR: 'Helena Winter',
    createdAt: subDays(today, 3).toISOString(),
    lastContacted: subHours(today, 2).toISOString(),
    estimatedValue: 5000,
    notes: 'Submitted online form. Missing proof of address.',
    score: 60,
    activities: [
      { id: 'a6', type: 'note', content: 'Lead captured from Facebook Ads.', timestamp: subDays(today, 3).toISOString() },
      { id: 'a7', type: 'email', content: 'Requested ID and proof of address documents.', timestamp: subDays(today, 2).toISOString() },
      { id: 'a8', type: 'note', content: 'Client dropped off passport at branch, still waiting on utility bill.', timestamp: subHours(today, 2).toISOString() }
    ]
  },
  {
    id: 'LD-1004',
    name: 'Michael Chen',
    phone: '+855 77 888 999',
    email: 'm.chen.kh@gmail.com',
    source: 'Event',
    stage: 'Contacted',
    assignedSR: 'Antoine Laurent',
    createdAt: subDays(today, 15).toISOString(),
    lastContacted: subDays(today, 5).toISOString(),
    estimatedValue: 25000,
    notes: 'Met at CSX Investment Expo. Interested in high-yield stocks.',
    score: 30,
    activities: [
      { id: 'a9', type: 'note', content: 'Met at CSX Investment Expo 2026.', timestamp: subDays(today, 15).toISOString() },
      { id: 'a10', type: 'email', content: 'Sent post-event thank you email.', timestamp: subDays(today, 14).toISOString() },
      { id: 'a11', type: 'call', content: 'Left voicemail.', timestamp: subDays(today, 5).toISOString() }
    ]
  },
  {
    id: 'LD-1005',
    name: 'Vireak Thun',
    phone: '+855 11 222 333',
    source: 'Referral',
    stage: 'Account Opened',
    assignedSR: 'Kenichi Sato',
    createdAt: subDays(today, 20).toISOString(),
    lastContacted: subDays(today, 1).toISOString(),
    estimatedValue: 50000,
    notes: 'Account active. Awaiting first deposit.',
    score: 95,
    activities: [
      { id: 'a12', type: 'note', content: 'Referred by partner agency.', timestamp: subDays(today, 20).toISOString() },
      { id: 'a13', type: 'meeting', content: 'In-person meeting to collect physical signatures.', timestamp: subDays(today, 15).toISOString() },
      { id: 'a14', type: 'note', content: 'Account officially opened in core banking.', timestamp: subDays(today, 1).toISOString() }
    ]
  }
];

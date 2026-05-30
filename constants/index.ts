import { Category, Quota, Gender } from '@/types';

export const CATEGORIES: Category[] = ['OPEN', 'OBC-NCL', 'SC', 'ST', 'EWS', 'OPEN-PwD'];

export const QUOTAS: { label: string; value: Quota }[] = [
  { label: 'All India', value: 'AI' },
  { label: 'Home State', value: 'HS' },
  { label: 'Other State', value: 'OS' },
];

export const GENDERS: { label: string; value: Gender }[] = [
  { label: 'Gender-Neutral', value: 'Gender-Neutral' },
  { label: 'Female-only', value: 'Female-only' },
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Jammu and Kashmir', 'Ladakh'
];

export const BRANCHES = [
  'Computer Science Engineering (CSE)',
  'Information Technology (IT)',
  'Electronics & Communication (ECE)',
  'Electrical Engineering (EE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering',
  'Chemical Engineering',
  'Aerospace Engineering',
  'Data Science',
  'Artificial Intelligence / ML',
  'Biotechnology',
  'Engineering Physics',
  'Metallurgical Engineering',
];

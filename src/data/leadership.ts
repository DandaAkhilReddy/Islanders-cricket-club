import type { LeadershipMember } from '../types';

export const leadershipHierarchy: Omit<LeadershipMember, 'id'>[] = [
  {
    name: 'Dr. Vishnu Reddy',
    title: 'Principal & Chief Mentor',
    emoji: '🎓',
    bio: 'Principal and Chief Mentor providing vision and guidance to Islanders Cricket Club.',
    order: 0,
  },
  {
    name: 'Rajasekhar Reddy',
    title: 'Director & Board Member',
    emoji: '🎯',
    bio: 'Director and Board Member overseeing strategic direction and governance of the club.',
    order: 1,
  },
  {
    name: 'Akhil Reddy Danda',
    title: 'Captain',
    emoji: '🏆',
    bio: 'Team Captain leading from the front with passion and dedication.',
    order: 2,
  },
  {
    name: 'Faizan Mohammad',
    title: 'Vice Captain',
    emoji: '💪',
    bio: 'Vice Captain providing crucial support to team leadership.',
    order: 3,
  },
];

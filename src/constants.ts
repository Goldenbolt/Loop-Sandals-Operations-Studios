import { Event, Pass, TeamMember } from './types';

export const EVENTS: Event[] = [
  { date: 'Jan 24 - 25', title: 'Patron of the Arts', type: 'pending' },
  { date: 'Jan 31 - Feb 1', title: 'The Weekend Pop Up', type: 'pending' },
  { date: 'Mar 28 - 29', title: 'Cosplay Carnival', type: 'pending' },
  { date: 'April 11 - 12', title: 'Expo', type: 'important' },
  { date: 'April 16', title: 'Final Paper', type: 'important' },
  { date: 'April 22', title: 'Defense', type: 'important' },
  { date: 'Jan 19, 26', title: 'Individual Update', type: 'update' },
  { date: 'Feb 9, 23', title: 'Individual Update', type: 'update' },
  { date: 'Mar 9', title: 'Individual Update', type: 'update' },
  { date: 'Apr 6', title: 'Individual Update', type: 'update' },
];

export const PASSES: Pass[] = [
  {
    id: 1,
    tasks: [
      { date: 'Jan 15', title: 'Coverage', status: 'Not Started' },
      { date: 'Jan 22', title: 'Presentation', status: 'Not Started' },
      { date: 'Jan 26', title: 'Submission (Paper)', status: 'Not Started' },
    ],
  },
  {
    id: 2,
    tasks: [
      { date: 'Feb 15', title: 'Coverage', status: 'Not Started' },
      { date: 'Feb 19', title: 'Presentation', status: 'Not Started' },
      { date: 'Feb 23', title: 'Submission (Paper)', status: 'Not Started' },
    ],
  },
  {
    id: 3,
    tasks: [
      { date: 'Mar 16', title: 'Coverage', status: 'Not Started' },
      { date: 'Mar 19', title: 'Presentation', status: 'Not Started' },
      { date: 'Mar 23', title: 'Submission (Paper)', status: 'Not Started' },
    ],
  },
];

export const TEAM: TeamMember[] = [
  { name: 'Jeph', role: 'Sales & Achievement', tasks: ['Target Vs Achievement', 'Reorder', 'Sales'] },
  { name: 'Pia', role: 'Marketing', tasks: ['Marketing Activities'] },
  { name: 'Carlo', role: 'Operations', tasks: ['Operations and Other Targets'] },
  { name: 'Ashley', role: 'Operations', tasks: ['Operations and Other Targets'] },
  { name: 'Kenri', role: 'Strategy', tasks: ['Pivots'] },
];

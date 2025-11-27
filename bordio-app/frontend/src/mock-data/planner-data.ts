// Mock data for Gantt chart tasks
export const plannerTasks = [
  {
    id: 1,
    name: 'Design',
    startDate: new Date(2024, 10, 1),
    endDate: new Date(2024, 10, 10),
    progress: 100,
    dependencies: [],
    assignee: 'MM',
    color: 'bg-blue-500'
  },
  {
    id: 2,
    name: 'Development',
    startDate: new Date(2024, 10, 11),
    endDate: new Date(2024, 10, 25),
    progress: 60,
    dependencies: [1],
    assignee: 'DT',
    color: 'bg-purple-500'
  },
  {
    id: 3,
    name: 'Testing',
    startDate: new Date(2024, 10, 20),
    endDate: new Date(2024, 10, 30),
    progress: 30,
    dependencies: [2],
    assignee: 'SB',
    color: 'bg-green-500'
  },
  {
    id: 4,
    name: 'Content Creation',
    startDate: new Date(2024, 10, 5),
    endDate: new Date(2024, 10, 20),
    progress: 80,
    dependencies: [],
    assignee: 'AN',
    color: 'bg-amber-500'
  },
  {
    id: 5,
    name: 'Launch',
    startDate: new Date(2024, 11, 1),
    endDate: new Date(2024, 11, 5),
    progress: 0,
    dependencies: [2, 3, 4],
    assignee: 'MW',
    color: 'bg-red-500'
  }
];

// Mock milestones
export const plannerMilestones = [
  {
    id: 1,
    name: 'Design Complete',
    date: new Date(2024, 10, 10),
    color: 'bg-blue-500'
  },
  {
    id: 2,
    name: 'MVP Ready',
    date: new Date(2024, 10, 25),
    color: 'bg-purple-500'
  },
  {
    id: 3,
    name: 'Project Launch',
    date: new Date(2024, 11, 5),
    color: 'bg-red-500'
  }
];

// Mock project teams
export const teams = [
  {
    id: 1,
    name: 'Design',
    members: ['SB', 'MM']
  },
  {
    id: 2,
    name: 'Development',
    members: ['DT']
  },
  {
    id: 3,
    name: 'Marketing',
    members: ['MW', 'AN']
  }
];

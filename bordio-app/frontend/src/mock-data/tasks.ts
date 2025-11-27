export const tasks = {
  new_task: [
    {
      id: 1,
      title: 'Review and comment on website design',
      assignee: 'MW', // Marry Williams
      tag: 'Feedback',
      color: 'bg-task-blue'
    },
    {
      id: 2,
      title: 'Prepare design files for web developer',
      assignee: 'MM', // Michael Martinez
      progress: '0/2',
      color: 'bg-task-blue'
    },
    {
      id: 3,
      title: 'Deploy the website to the development hosting server',
      assignee: 'DT', // David Thomas
      color: 'bg-task-blue'
    },
    {
      id: 4,
      title: 'Send new website link to the team',
      assignee: 'DT', // David Thomas
      color: 'bg-task-blue'
    },
    {
      id: 5,
      title: 'Review the new website and provide feedback',
      assignee: 'MW', // Marry Williams
      tag: 'Feedback',
      color: 'bg-task-blue'
    },
    {
      id: 6,
      title: 'Fix all the bugs reported by the team',
      assignee: 'DT', // David Thomas
      color: 'bg-task-blue'
    },
    {
      id: 7,
      title: 'Deploy the website to the production environment',
      assignee: 'DT', // David Thomas
      color: 'bg-task-blue'
    },
    {
      id: 8,
      title: 'Final check of the website',
      assignee: 'AN', // Anastasia Novak
      progress: '0/7',
      color: 'bg-task-blue'
    }
  ],
  scheduled: [
    {
      id: 9,
      title: 'Design the entire website in a chosen style',
      assignee: 'MM', // Michael Martinez
      daysLeft: '6 days left',
      color: 'bg-task-coral'
    },
    {
      id: 10,
      title: 'Write meta title & meta description for each page',
      assignee: 'AN', // Anastasia Novak
      daysLeft: '3 days left',
      color: 'bg-task-coral'
    },
    {
      id: 11,
      title: 'Develop the website using the chosen CMS platform',
      assignee: 'DT', // David Thomas
      tag: 'Blocked',
      daysLeft: '10 days left',
      color: 'bg-task-coral'
    },
    {
      id: 12,
      title: 'Implement responsive design',
      assignee: 'DT', // David Thomas
      color: 'bg-task-coral'
    }
  ],
  in_progress: [
    {
      id: 13,
      title: 'Write website copy',
      assignee: 'AN', // Anastasia Novak
      progress: '1/3',
      color: 'bg-task-purple'
    },
    {
      id: 14,
      title: 'Design drafts in 3 different styles',
      assignee: 'MM', // Michael Martinez
      tag: 'ASAP',
      dueDate: 'Due tomorrow',
      color: 'bg-task-purple'
    },
    {
      id: 15,
      title: 'Develop a wireframe',
      assignee: 'SB', // Sofia Brown
      color: 'bg-task-purple'
    }
  ],
  completed: [
    {
      id: 16,
      title: 'Research potential CMS platforms for website development',
      assignee: 'DT', // David Thomas
      color: 'bg-task-green'
    },
    {
      id: 17,
      title: 'Develop a structure for a new website',
      assignee: 'SB', // Sofia Brown
      progress: '4/4',
      color: 'bg-task-green'
    }
  ]
};

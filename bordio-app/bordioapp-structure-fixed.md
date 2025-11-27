# Bordioapp Project Structure

## Overview

This document outlines the folder structure for the Bordioapp project, which uses React Vite with TailwindCSS for the frontend and Node.js Express for the backend.

## Project Structure

```plaintext
bordioapp/
├── .gitignore
├── README.md
├── package.json
├── frontend/                    # Frontend React Vite application
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── public/
│   │   └── assets/             # Public assets (images, fonts)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx            # Entry point
│   │   ├── assets/             # Frontend assets
│   │   ├── components/         # Reusable components
│   │   │   ├── TaskCard/
│   │   │   ├── TaskColumn/
│   │   │   ├── CsvImport/        # CSV import components
│   │   │   │   ├── CsvUploader/
│   │   │   │   ├── FieldMapper/
│   │   │   │   ├── ValidationResults/
│   │   │   │   └── ImportProgress/
│   │   │   ├── Board/
│   │   │   ├── Workspace/      # Workspace components
│   │   │   │   ├── WorkspaceCard/
│   │   │   │   ├── WorkspaceForm/
│   │   │   │   ├── WorkspaceMembers/
│   │   │   │   ├── WorkspaceSettings/
│   │   │   │   └── InviteUsers/
│   │   │   ├── AgileBoard/     # Agile board components
│   │   │   │   ├── Sprint/
│   │   │   │   ├── Epic/
│   │   │   │   ├── Backlog/
│   │   │   │   ├── PlanningPoker/  # Planning poker components
│   │   │   │   │   ├── PokerSession/
│   │   │   │   │   ├── VotingCards/
│   │   │   │   │   ├── VoteResults/
│   │   │   │   │   └── SessionTimer/
│   │   │   │   ├── Retrospective/  # Retrospective components
│   │   │   │   │   ├── RetroBoard/
│   │   │   │   │   ├── RetroColumn/
│   │   │   │   │   ├── RetroNote/
│   │   │   │   │   └── ActionItems/
│   │   │   │   └── Charts/     # Burndown/velocity charts
│   │   │   ├── Team/          # Team components
│   │   │   │   ├── TeamCard/
│   │   │   │   ├── TeamForm/
│   │   │   │   ├── TeamMembers/
│   │   │   │   └── InviteUsers/
│   │   │   ├── Project/       # Project components
│   │   │   │   ├── ProjectCard/
│   │   │   │   ├── ProjectForm/
│   │   │   │   ├── ProjectMembers/
│   │   │   │   └── ProjectSettings/
│   │   │   ├── Calendar/       # Calendar components
│   │   │   │   ├── MonthView/
│   │   │   │   ├── WeekView/
│   │   │   │   ├── DayView/
│   │   │   │   ├── EventCard/
│   │   │   │   ├── EventForm/
│   │   │   │   ├── RecurrenceOptions/
│   │   │   │   └── CalendarSettings/
│   │   │   ├── Planner/       # Planner components
│   │   │   │   ├── GanttChart/
│   │   │   │   ├── Timeline/
│   │   │   │   ├── Milestone/
│   │   │   │   ├── ResourceAllocation/
│   │   │   │   ├── DependencyManager/
│   │   │   │   └── CriticalPath/
│   │   │   ├── Reports/       # Reporting components
│   │   │   │   ├── ReportCard/
│   │   │   │   ├── ReportBuilder/
│   │   │   │   ├── ReportView/
│   │   │   │   ├── Charts/    # Report visualization
│   │   │   │   └── Export/    # Report export options
│   │   │   ├── AddStatus/
│   │   │   ├── DatePicker/
│   │   │   └── ui/             # UI components (shadcn/ui)
│   │   ├── layouts/            # Layout components
│   │   │   ├── Navbar/
│   │   │   ├── Sidebar/
│   │   │   └── Tools/
│   │   ├── constants/          # Constants and enums
│   │   │   └── types.js
│   │   ├── hooks/              # Custom hooks
│   │   ├── context/            # React context providers
│   │   │   ├── AuthContext.jsx     # Authentication context
│   │   │   ├── WorkspaceContext.jsx # Workspace management context
│   │   │   ├── TeamContext.jsx      # Team management context
│   │   │   ├── ProjectContext.jsx   # Project management context
│   │   │   ├── BoardContext.jsx     # Board operations context
│   │   │   ├── ImportContext.jsx    # CSV import context
│   │   │   ├── CalendarContext.jsx  # Calendar events context
│   │   │   ├── PlannerContext.jsx    # Planner timelines context
│   │   │   ├── PlanningPokerContext.jsx # Planning poker context
│   │   │   ├── RetroContext.jsx     # Retrospective context
│   │   │   └── ReportContext.jsx    # Reporting context
│   │   ├── pages/              # Page components
│   │   │   ├── Auth/             # Auth pages
│   │   │   │   ├── Login/
│   │   │   │   ├── Register/
│   │   │   │   └── ForgotPassword/
│   │   │   ├── Dashboard/        # Main dashboard
│   │   │   ├── Import/           # CSV import pages
│   │   │   │   ├── TaskImport/
│   │   │   │   └── ImportHistory/
│   │   │   ├── Workspaces/       # Workspace pages
│   │   │   │   ├── WorkspacesList/
│   │   │   │   ├── WorkspaceDetail/
│   │   │   │   └── WorkspaceSettings/
│   │   │   ├── Teams/            # Team management pages
│   │   │   │   ├── TeamsList/
│   │   │   │   ├── TeamDetail/
│   │   │   │   └── TeamSettings/
│   │   │   ├── Projects/         # Project management pages
│   │   │   │   ├── ProjectsList/
│   │   │   │   ├── ProjectDetail/
│   │   │   │   └── ProjectSettings/
│   │   │   ├── Boards/           # Board pages
│   │   │   │   ├── BoardsList/
│   │   │   │   ├── KanbanBoard/
│   │   │   │   └── AgileBoard/
│   │   │   ├── PlanningPoker/     # Planning poker pages
│   │   │   │   ├── SessionsList/
│   │   │   │   ├── ActiveSession/
│   │   │   │   └── SessionHistory/
│   │   │   ├── Retrospectives/    # Retrospective pages
│   │   │   │   ├── RetrosList/
│   │   │   │   ├── ActiveRetro/
│   │   │   │   └── RetroResults/
│   │   │   ├── Calendar/         # Calendar pages
│   │   │   │   ├── MonthCalendar/
│   │   │   │   ├── WeekCalendar/
│   │   │   │   ├── DayCalendar/
│   │   │   │   ├── EventDetails/
│   │   │   │   └── CalendarSettings/
│   │   │   ├── Planner/          # Planner pages
│   │   │   │   ├── GanttView/
│   │   │   │   ├── TimelineView/
│   │   │   │   ├── ResourceView/
│   │   │   │   └── PlannerSettings/
│   │   │   ├── Reports/          # Reporting pages
│   │   │   │   ├── ReportsList/
│   │   │   │   ├── ReportBuilder/
│   │   │   │   └── ReportView/
│   │   │   ├── Settings/         # User settings
│   │   │   ├── MainPage/
│   │   │   └── Workspace/
│   │   ├── services/           # API service layer
│   │   │   ├── api.js              # Base API configuration
│   │   │   ├── authService.js       # Authentication services
│   │   │   ├── userService.js       # User management services
│   │   │   ├── workspaceService.js   # Workspace management services
│   │   │   ├── teamService.js       # Team management services
│   │   │   ├── projectService.js     # Project management services
│   │   │   ├── boardService.js       # Board operations services
│   │   │   ├── taskService.js        # Task management services
│   │   │   ├── calendarService.js    # Calendar operations services
│   │   │   ├── plannerService.js     # Planner and timeline services
│   │   │   ├── csvImportService.js   # CSV import services
│   │   │   ├── planningPokerService.js # Planning poker services
│   │   │   ├── retroService.js       # Retrospective services
│   │   │   ├── sprintService.js      # Sprint management services
│   │   │   └── reportService.js      # Reporting services
│   │   ├── utils/              # Utility functions
│   │   └── styles/             # Global styles
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── backend/                     # Backend Express application
    ├── package.json
    ├── server.js               # Entry point
    ├── config/                 # Configuration files
    │   └── db.js               # Database connection
    ├── models/                 # MongoDB models
    │   ├── User.js
    │   ├── Workspace.js
    │   ├── Team.js
    │   ├── Project.js
    │   ├── Board.js
    │   ├── Column.js
    │   ├── Task.js
    │   ├── CalendarEvent.js
    │   ├── PlannerTimeline.js
    │   ├── Milestone.js
    │   ├── TaskDependency.js
    │   ├── Sprint.js
    │   ├── Epic.js
    │   ├── PlanningPokerSession.js
    │   ├── Retrospective.js
    │   ├── CsvImportHistory.js
    │   ├── Comment.js
    │   ├── Attachment.js
    │   └── Report.js
    ├── routes/                 # API routes
    │   ├── auth.js
    │   ├── users.js
    │   ├── workspaces.js
    │   ├── teams.js
    │   ├── projects.js
    │   ├── boards.js
    │   ├── columns.js
    │   ├── tasks.js
    │   ├── calendar.js
    │   ├── planner.js
    │   ├── taskImport.js
    │   ├── planningPoker.js
    │   ├── retrospectives.js
    │   ├── sprints.js
    │   ├── epics.js
    │   ├── comments.js
    │   ├── attachments.js
    │   └── reports.js
    ├── controllers/            # Route controllers
    │   ├── authController.js
    │   ├── userController.js
    │   ├── workspaceController.js
    │   ├── teamController.js
    │   ├── projectController.js
    │   ├── boardController.js
    │   ├── columnController.js
    │   ├── taskController.js
    │   ├── calendarController.js
    │   ├── plannerController.js
    │   ├── taskImportController.js
    │   ├── planningPokerController.js
    │   ├── retrospectiveController.js
    │   ├── sprintController.js
    │   ├── epicController.js
    │   ├── commentController.js
    │   ├── attachmentController.js
    │   ├── reportController.js
    │   └── metricsController.js
    ├── middleware/             # Custom middleware
    │   ├── auth.js            # Authentication middleware
    │   ├── permission.js      # Role-based authorization
    │   └── error.js           # Error handling
    ├── utils/                  # Utility functions
    └── data/                   # Seed data for development
        └── seedData.js
```

## Key Files and Their Purposes

### Frontend

- **index.html**: Main HTML file
- **main.jsx**: Entry point for the React application
- **App.jsx**: Main application component
- **tailwind.config.js**: TailwindCSS configuration
- **vite.config.js**: Vite build tool configuration
- **components/**:
  - **TaskCard/**: Task card component with drag-and-drop functionality
  - **CsvImport/**: CSV import components for bulk task creation
  - **Board/**: Main board component for managing tasks
  - **AgileBoard/**: Agile methodology specific components
  - **Calendar/**: Calendar view components with day, week, month views
  - **Planner/**: Project planner and Gantt chart components
  - **PlanningPoker/**: Planning poker estimation components
  - **Retrospective/**: Team retrospective components and boards
  - **Team/**: Team management components
  - **Project/**: Project management components
  - **Reports/**: Reporting and visualization components
  - **ui/**: Reusable UI components built with shadcn/ui
- **context/**:
  - **AuthContext.jsx**: Authentication state management
  - **WorkspaceContext.jsx**: Workspace management state
  - **TeamContext.jsx**: Team management state
  - **ProjectContext.jsx**: Project management state
  - **BoardContext.jsx**: Board operations state
  - **ImportContext.jsx**: CSV import state management
  - **CalendarContext.jsx**: Calendar events state management
  - **PlannerContext.jsx**: Planner timelines state management
  - **PlanningPokerContext.jsx**: Planning poker session state
  - **RetroContext.jsx**: Retrospective boards state
  - **ReportContext.jsx**: Reporting system state
- **pages/**:
  - **Auth/**: Authentication pages
  - **Dashboard/**: Main dashboard
  - **Import/**: CSV import and history pages
  - **Workspaces/**: Workspace management pages
  - **Teams/**: Team management pages
  - **Projects/**: Project management pages
  - **Boards/**: Various board views (Kanban, Agile)
  - **Calendar/**: Calendar views (month, week, day)
  - **Planner/**: Project planner and timeline views
  - **PlanningPoker/**: Planning poker session pages
  - **Retrospectives/**: Retrospective meeting pages
  - **Reports/**: Reporting interfaces
- **services/**:
  - **api.js**: Base API configuration
  - **authService.js**: Authentication API calls
  - **workspaceService.js**: Workspace management API calls
  - **teamService.js**: Team management API calls
  - **projectService.js**: Project API calls
  - **boardService.js**: Board operations API calls
  - **calendarService.js**: Calendar events API calls
  - **plannerService.js**: Planner and timeline API calls
  - **csvImportService.js**: CSV import/export API calls
  - **planningPokerService.js**: Planning poker API calls
  - **retroService.js**: Retrospective API calls
  - **reportService.js**: Reporting API calls

### Backend

- **server.js**: Entry point for the Express server
- **config/db.js**: MongoDB connection configuration
- **models/**:
  - **User.js**: User model with authentication
  - **Workspace.js**: Workspace model with membership
  - **Team.js**: Team model with workspace and membership
  - **Project.js**: Project model with workspace and team association
  - **Board.js**: Board model with workspace and project association
  - **Task.js**: Task model with complete metadata
  - **CalendarEvent.js**: Calendar events with recurrence
  - **PlannerTimeline.js**: Project timelines and Gantt charts
  - **Milestone.js**: Project milestone markers
  - **TaskDependency.js**: Dependencies between tasks
  - **PlanningPokerSession.js**: Planning poker estimation sessions
  - **Retrospective.js**: Team retrospective sessions and notes
  - **CsvImportHistory.js**: History of CSV imports with results
  - **Report.js**: Report configuration model
- **routes/**: API endpoint definitions organized by entity
- **controllers/**:
  - **authController.js**: Authentication logic
  - **workspaceController.js**: Workspace management logic
  - **teamController.js**: Team management logic
  - **projectController.js**: Project management logic
  - **boardController.js**: Board operations logic
  - **calendarController.js**: Calendar events logic
  - **plannerController.js**: Planner and timeline logic
  - **taskImportController.js**: CSV import/export logic
  - **planningPokerController.js**: Planning poker session logic
  - **retrospectiveController.js**: Retrospective management logic
  - **reportController.js**: Reporting generation logic
- **middleware/**:
  - **auth.js**: Authentication middleware
  - **permission.js**: Role-based authorization
- **data/seedData.js**: Sample data for development with teams, projects and boards

## Development Setup

1. Clone the repository
2. Install dependencies:

```bash
# Root directory - install husky and other dev dependencies
npm install

# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Start development servers:

```bash
# Frontend (from frontend directory)
npm run dev

# Backend (from backend directory)
npm run dev
```

## Build and Deployment

### Frontend Build

```bash
cd frontend
npm run build
```

### Backend Build

```bash
cd backend
npm run build
```

The frontend build will be output to the `frontend/dist` directory, which can be served by the backend or deployed to a static hosting service.

The backend can be deployed to a Node.js hosting provider like Heroku, Vercel, Railway, or containerized using Docker.

# Athena Scrum Poker - Complete Guide

A collaborative real-time estimation tool for agile teams. Run Planning Poker sessions with your team to estimate user stories and tasks using story points.

## 📋 Overview

Athena Scrum Poker is a comprehensive web-based application that enables distributed teams to conduct estimation sessions in real-time. Teams can create rooms, invite members, add tasks, and vote on story point estimates collaboratively. The application features real-time updates, advanced group management, comprehensive voting analytics, and uses Docker for database services.

## 🆕 Recent Updates

### Latest Features (v3.0)

**Jira Integration:**

- ✅ **Token-based Authentication** - Connect to Jira Cloud or Server using secure API tokens
- ✅ **User Profile Integration** - Save Jira credentials securely in your user profile
- ✅ **Import Jira Issues** - Import Jira issues as planning poker tasks for estimation
- ✅ **Export to Jira** - Export planning poker tasks back to Jira with story points
- ✅ **Synchronize Story Points** - Keep estimates synchronized between systems
- ✅ **Batch Export/Sync** - Export or sync all room tasks with Jira in a single action
- ✅ **Room CSV Snapshot** - Download a CSV of all tasks, story points, and Jira links

### Previous Features (v2.0)

**Task Management Enhancements:**

- ✅ **CSV Bulk Import** - Upload CSV files to create multiple tasks at once with template download
- ✅ **Reset & Revote** - Clear all votes and reactivate any task for fresh estimation
- ✅ **Flexible Activation** - Activate any inactive task (drafts, completed, etc.) for voting

**Room Features:**

- ✅ **Join by Invite Code** - Use 8-character alphanumeric codes to join rooms from dashboard
- ✅ **Edit Room Details** - Update room name and description (admin/creator only)
- ✅ **Delete Room** - Creators can delete rooms with confirmation

**Real-Time Improvements:**

- ✅ **Live Vote Counting** - All participants see real-time vote progress (e.g., "3 out of 5 voted")
- ✅ **Instant Synchronization** - Vote counts update immediately via Socket.IO across all browsers
- ✅ **Vote Change Detection** - Changing votes doesn't affect count, only new/deleted votes do

**Deployment & Infrastructure:**

- ✅ **Hybrid Docker Support** - PostgreSQL and pgAdmin run in Docker, frontend and backend run locally
- ✅ **pgAdmin Integration** - Database management UI at [http://localhost:5050](http://localhost:5050)
- ✅ **Network & VPN Access** - Automatic configuration for sharing across VPNs and local networks
- ✅ **Development-Focused Setup** - Fast iteration with Vite and Express directly on host

**UI/UX Improvements:**

- ✅ **Two View Modes** - Simplified to Tasks and Analytics views
- ✅ **Card & Table Display** - Switch between card and table views for tasks
- ✅ **Better Button Organization** - Improved admin action buttons with clear icons

## 🚀 Tech Stack

### Backend

- **Node.js** with Express - RESTful API server
- **Socket.IO** - Real-time bidirectional communication
- **PostgreSQL** - Relational database
- **JWT** - Secure authentication tokens
- **bcrypt** - Password hashing and security
- **Jira Client** - Integration with Jira Cloud/Server

### Frontend
- **React 18** - UI framework
- **Vite** - Fast build tooling and development server
- **TailwindCSS** - Utility-first styling
- **Socket.IO Client** - Real-time updates
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API calls
- **Lucide React** - Modern icon library

## 📦 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v16 or higher)
- **Docker and Docker Compose** (required for PostgreSQL and pgAdmin)
- **npm** (comes with Node.js)
- **Git** (for version control)

## ✨ Key Features

### 🔐 Authentication & User Management

Secure user system with complete profile control:

- Register new accounts with email and password
- Login with JWT-based authentication
- View and update your profile information
- Delete your account when needed
- Password encryption using bcrypt

### 📊 Dashboard
Your central hub for all Planning Poker activities:

- View all groups you're a member of
- Access all rooms you can participate in (added directly or through groups)
- Quick-create buttons for new groups and rooms
- **Join existing rooms** using 8-character invite codes
- See your recent activity and ongoing sessions
- Display invite codes for rooms you've created

---

## 👥 Group Management

Groups help you organize team members and simplify room access management.

### Basic Operations

- **Create groups** - Organize team members by project, department, or team
- **Add/remove members** - Add existing registered users to your groups
- **Assign to rooms** - Add entire groups to rooms in one action (all members get access automatically)
- **Set roles** - Members default to "participant" role, but admins can promote them to "admin"
- **Update details** - Modify group name and description as needed
- **View members** - See all group members and their assigned roles
- **Delete groups** - Remove groups you created (creator privilege only)

### Advanced Member Management UI

**ManageMembersModal Features:**
- Comprehensive modal for group member management
- Add members by user ID (production: search by email/name)
- Remove members with confirmation (creator cannot be removed)
- **Click role badge to toggle** between participant ↔ admin
- Real-time updates via Socket.IO
- Visual indicators:
  - **(You)** badge - Shows current user
  - **(Creator)** badge - Shows group creator
  - **Shield icon** - Indicates admin role
- Color-coded roles:
  - **Admin**: Blue (primary color)
  - **Participant**: Gray
  - **Creator**: Amber (permanent admin)
- Shows join dates for each member

**Member Roles:**
- **Creator** - Original group creator with full control (permanent admin, cannot be removed or demoted)
- **Admin** - Can help manage the group (future permissions)
- **Participant** - Standard member

**How to Use:**
1. Navigate to any group where you're the creator
2. Click **"Manage Members"** button
3. **Add Members:**
   - Enter user ID in the input field
   - Click "Add" button
   - Member is added with 'participant' role by default
4. **Remove Members:**
   - Click trash icon next to any member
   - Confirm removal
   - Creator cannot be removed
5. **Change Roles:**
   - Click on the role badge (participant/admin)
   - Confirm role change
   - Creator's role cannot be changed
6. All changes sync in real-time across all viewers

**Real-Time Updates:**
- Socket events: `group-member-added`, `group-member-removed`, `group-member-role-updated`
- All users viewing the group see updates instantly
- Member counts update automatically
- Role changes reflect immediately
- No page refresh needed

**Why use groups?**
Instead of adding team members individually to each room, create a group once and reuse it across multiple rooms. Changes to group membership automatically affect room access.

**Integration with Rooms:**
- Groups added to rooms give all members access
- Changes to group membership automatically affect room access
- Removing a group from a room removes all member access
- Individual members can still be added to rooms separately

---

## 🏠 Room Management

Rooms are where Planning Poker sessions happen. Each room can have multiple participants, tasks, and voting sessions.

### Creating & Configuring Rooms

- **Create rooms** - Start a new Planning Poker session with auto-generated 8-character invite code
- **Edit room details** - Update room name and description (admin/creator only)
- **Add participants** in two flexible ways:
  - **Individual users** - Add specific users directly
  - **Entire groups** - Add all members of a group at once
- **Invite codes** - Share 8-character alphanumeric codes for self-joining
- **Join by code** - Use invite code to join existing rooms from dashboard
- **View participants** - See complete list of all participants (both direct and group-based)
- **Manage settings** - Admins and creators control room configuration and access
- **Delete rooms** - Remove rooms you created (creator privilege only)

### Advanced Participant Management UI

**ManageParticipantsModal Features:**
- Modal dialog with two tabs: **Participants** and **Groups**
- Add/Remove functionality for both participants and groups
- Shows user roles, emails, and source (direct vs group)
- Add individual users by ID or entire groups from dropdown
- Real-time updates via Socket.IO
- Confirmation dialogs for removals
- Admin (creator) cannot be removed

**How to Use:**

1. **Open a Room**
   - Navigate to any room where you're an admin

2. **Manage Access**
   - Click the **"Manage Access"** button next to participant count
   - Modal opens with two tabs

3. **Add Participants** (Participants Tab)
   - Go to "Participants" tab
   - Enter user ID (in production, use search by email/name)
   - Click "Add"
   - User is instantly added with 'participant' role

4. **Remove Participants**
   - Click trash icon next to any participant
   - Confirm removal
   - Admin (creator) cannot be removed

5. **Add Groups** (Groups Tab)
   - Go to "Groups" tab
   - Select a group from dropdown
   - Click "Add"
   - All group members get room access

6. **Remove Groups**
   - Click trash icon next to any group
   - Confirm removal
   - All group members lose access

**Real-Time Updates:**
- Socket events: `participant-added`, `participant-removed`, `group-added`, `group-removed`
- All users in the room see updates instantly
- Participant counts update automatically
- No page refresh needed
- Changes sync across all browsers

**API Response Examples:**

Add Participant:
```json
{
  "message": "Participant added successfully",
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  }
}

```

Add Group:
```json
{
  "message": "Group added successfully",
  "group": {
    "id": 456,
    "name": "Development Team",
    "description": "Core dev team"
  }
}

```

**Room Roles:**
- **Admin/Creator** - Full control over room, tasks, and voting sessions
- **Participant** - Can vote on tasks and view results

**Permissions:**
- Only room creator can add/remove participants and groups
- All participants can view the room and vote
- Admins can manage tasks and activate voting

---

## 📝 Task Management

Tasks represent user stories or work items that need estimation. Only room admins and creators can manage tasks.

### Admin Capabilities

- **Create tasks** - Add new user stories or features to estimate
  - Provide task title and description
  - Set context for accurate estimation
- **Import tasks from CSV** - Bulk create tasks by uploading a CSV file
  - Download template CSV with proper format
  - Preview tasks before importing
  - Create multiple tasks at once
- **Activate for voting** - Set any inactive task as "active" to allow participants to vote
  - Can reactivate completed tasks for re-estimation
  - Can activate draft tasks for first-time voting
- **Reset & Revote** - Clear all votes and reactivate task for fresh voting
  - Keeps task title and description
  - Removes all existing votes
  - Immediately opens for new voting
- **Update tasks** - Modify title, description, or final story points
- **Delete tasks** - Remove tasks from the room
- **Assign story points** - Set final agreed-upon story points after voting
- **View history** - See all tasks with their estimates and outcomes
- **Track participation** - Monitor how many participants have voted vs. total participants in real-time

### Task States

- **Draft** - Task created but not open for voting
- **Active** - Task is open for voting (only one task active at a time)
- **Completed** - Voting finished, story points assigned
- **Re-voting** - Previously voted task cleared and reactivated

### CSV Import Format

For bulk task creation, use this CSV format:

```csv
Title,Description
"User Login","As a user, I want to login to access my account"
"Password Reset","As a user, I want to reset my password"

```

**Features:**
- Title column is required
- Description column is optional
- Supports commas in values using quotes
- Preview before import
- Download template from UI

---

## 🗳️ Voting System

The core feature that enables collaborative estimation in real-time.

### How It Works

1. Admin activates a task for voting
2. All participants submit their story point estimates
3. Votes are hidden until admin reveals them
4. Results show voting statistics and patterns
5. Admin assigns final story points based on discussion

### Voting Features

- **Real-time participation** - Vote on the currently active task
- **Private votes** - Your estimate stays hidden until reveal
- **Update votes** - Change your vote before reveal (doesn't affect count)
- **Delete votes** - Remove your vote if needed
- **Automatic counting** - System tracks votes in real-time via Socket.IO
- **Live progress tracking** - All participants see real-time vote count updates (e.g., "3 out of 5 voted")
- **Instant synchronization** - Vote counts update immediately across all browsers

### Voting Results & Statistics

Once votes are revealed, participants see:

- **Average estimate** - Mean of all submitted votes
- **Median** - Middle value when votes sorted
- **Mode** - Most common estimate (consensus indicator)
- **Range** - Minimum and maximum estimates
- **Vote distribution** - Visual breakdown of all estimates
- **Individual votes** - See who voted what
- **Consensus indicator** - Shows when ≥50% agree on same value

---

## 📊 Room Views & Analytics

### Two View Modes

Every room offers two powerful views accessible via tabs at the top:

#### 1. 📋 Tasks View (Default)
- Standard task management interface
- Create, edit, and delete tasks
- Import tasks from CSV for bulk creation
- Activate tasks for voting
- Reset & revote on any task
- View task statuses and details
- Real-time vote count tracking
- Two display modes: Card view or Table view
- **Best for:** Daily work and task management
- **Access:** All participants

#### 2. 📊 Analytics View (Admin Only)
- Statistical dashboard with key metrics
- Four metric cards: Total points, Average, Total tasks, Completed tasks
- Progress bar showing sprint completion percentage
- Task breakdown with story points
- Insights and recommendations
- CSV export for reporting
- **Best for:** Sprint planning and velocity tracking
- **Access:** Admins and creators only

---

## 📊 Analytics Dashboard

Comprehensive analytics for sprint planning and reporting (Admin only).

### Key Metrics Cards

The dashboard shows four colorful metric cards:

**1. Total Story Points** (Purple Gradient)
- Sum of all assigned story points in the room
- 🎯 Target icon
- Shows overall sprint capacity

**2. Average Points** (Blue Gradient)
- Mean story points per task
- 📈 Trending icon
- Indicates typical story complexity

**3. Total Tasks** (Purple Gradient)
- Count of all tasks in room
- 📊 Chart icon
- Shows backlog size

**4. Completed Tasks** (Green Gradient)
- Tasks with story points assigned
- ✅ Checkmark icon
- Shows completion percentage

### Progress Visualization

- **Animated progress bar** showing completion percentage
- Color-coded with primary gradient (blue)
- Real-time updates as story points are assigned
- Percentage displayed in the bar when > 10%

### Task Breakdown Section

- Numbered list of all tasks with story points
- Each entry shows:
  - Task title
  - Status badge (color-coded)
  - Story points value
- Hover effects for better UX
- Click-friendly design

### Insights Panel

Amber-colored panel providing:
- **Velocity calculation** (average points per task)
- **Completion rate** percentage
- **Total effort** summary across all tasks
- **Remaining tasks** notification
- Helpful recommendations

### Export Analytics

- **"Export CSV"** button in the Task Breakdown section
- Downloads file named: `room-{roomId}-consolidated-report.csv`
- Includes:
  - Summary metrics (totals, averages, completion rate)
  - Task-level details with story points
  - Perfect for reporting to management

---

## ⚡ Real-time Features

Powered by Socket.IO for instant updates across all connected participants:

### Live Synchronization

- **Task activation** - Instantly notified when admin activates a task
- **Live voting** - See voting progress as participants submit estimates
- **Instant reveals** - Results appear immediately when admin reveals votes
- **Participant tracking** - Real-time notifications when users join or leave rooms
- **Task updates** - Automatic refresh when tasks are created, modified, or deleted
- **Member management** - Live updates when participants/groups are added/removed from rooms
- **Group changes** - Instant sync when group members are added, removed, or roles change
- **Synchronized state** - All participants see the same information simultaneously

### Socket.IO Events

**Room Events:**
- `participant-added` - User added to room
- `participant-removed` - User removed from room
- `group-added` - Group added to room
- `group-removed` - Group removed from room
- `room-updated` - Room details changed (name/description)

**Group Events:**
- `group-member-added` - Member added to group
- `group-member-removed` - Member removed from group
- `group-member-role-updated` - Member role changed

**Task Events:**
- `task-created` - New task created
- `task-activated` - Task opened for voting (includes reactivation)
- `task-deactivated` - Voting closed
- `task-updated` - Task details changed
- `task-deleted` - Task removed

**Voting Events:**
- `vote-submitted` - Participant submitted vote (includes vote count)
- `vote-deleted` - Participant removed their vote (includes vote count)
- `votes-revealed` - Admin revealed all votes
- `votes-cleared` - Admin cleared all votes for revoting

---

## 🔑 Permission Summary

**Note:** Room Creators can promote any participant to Admin role. Once promoted, Admins have **full room management permissions** including managing tasks, participants, groups, and room settings. Admins can do everything except delete the room (only Creator can delete).

| Action | Participant | Admin | Creator |
|--------|-------------|-------|---------|
| View rooms & tasks | ✅ | ✅ | ✅ |
| Vote on active tasks | ✅ | ✅ | ✅ |
| Create tasks | ❌ | ✅ | ✅ |
| Import tasks from CSV | ❌ | ✅ | ✅ |
| Update tasks | ❌ | ✅ | ✅ |
| Delete tasks | ❌ | ✅ | ✅ |
| Activate tasks for voting | ❌ | ✅ | ✅ |
| Reset votes & reactivate task | ❌ | ✅ | ✅ |
| Deactivate tasks | ❌ | ✅ | ✅ |
| Reveal votes | ❌ | ✅ | ✅ |
| Assign final story points | ❌ | ✅ | ✅ |
| View Analytics dashboard | ❌ | ✅ | ✅ |
| Export analytics | ❌ | ✅ | ✅ |
| Update room details | ❌ | ✅ | ✅ |
| Manage room participants | ❌ | ✅ | ✅ |
| Promote/demote participant roles | ❌ | ✅ | ✅ |
| Add/remove groups from room | ❌ | ✅ | ✅ |
| Delete room | ❌ | ❌ | ✅ |
| Manage group members | ❌ | ❌ | ✅ (group creator) |
| Change member roles in group | ❌ | ❌ | ✅ (group creator) |
| Delete group | ❌ | ❌ | ✅ (group creator) |

---

## 🎯 Workflows

### Sprint Planning Session

1. **Setup Phase**
   - Create a room or reuse existing one
   - Click "Manage Access" to add team members
   - Add individuals by ID or entire groups
   - Verify all participants can access the room

2. **Preparation Phase**
   - Admin creates tasks in **Tasks** view
   - Add clear titles and descriptions
   - Review all tasks before voting starts

3. **Estimation Phase**
   - Admin activates first task
   - All participants submit their votes
   - Admin monitors participation progress
   - Admin reveals votes when everyone has voted

4. **Discussion Phase**
   - Team discusses voting differences
   - Review statistics (average, median, mode, consensus)
   - Check range to understand variance
   - Re-vote if consensus not reached

5. **Decision Phase**
   - Admin assigns final story points based on discussion
   - Move to next task
   - Repeat until all tasks are estimated

6. **Review Phase (Stories View)**
   - Switch to **Stories** tab
   - Review all estimated stories
   - Check total story points
   - Export for sprint documentation

7. **Planning Phase (Analytics View)**
   - Switch to **Analytics** tab (admin only)
   - Review completion metrics
   - Check team velocity and capacity
   - Export analytics for sprint planning

### Sprint Review Workflow

1. Open room and switch to **Stories** view
2. Scroll through completed stories (visually green)
3. Show voting consensus to stakeholders
4. Discuss any high-variance stories and decisions made
5. Click "Export Stories" for retrospective documentation
6. Share total story points delivered with team

### Retrospective Workflow

1. Open exported story CSV data
2. Compare initial estimates (votes) vs final story points
3. Identify patterns:
   - Stories where consensus was easy
   - Stories with high variance
   - Outlier votes and reasons
4. Discuss estimation accuracy
5. Identify improvement areas for next sprint
6. Update team estimation guidelines if needed

### Daily Workflow

**For Participants:**
1. Login and go to Dashboard
2. See active rooms
3. Join room when admin starts session
4. Vote on active tasks
5. View results when revealed
6. Participate in discussions

**For Admins:**
1. Login and open room
2. Create tasks as needed
3. Activate tasks one by one
4. Wait for votes
5. Reveal and discuss
6. Assign final story points
7. Move to next task

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update profile
- `DELETE /api/auth/account` - Delete account

### Groups
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group by ID
- `POST /api/groups` - Create group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/members` - Add member
- `DELETE /api/groups/:id/members/:userId` - Remove member
- `PUT /api/groups/:id/members/:userId/role` - Update member role

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room
- `POST /api/rooms/:id/participants` - Add user to room
- `DELETE /api/rooms/:id/participants/:userId` - Remove user
- `POST /api/rooms/:id/groups` - Add group to room
- `DELETE /api/rooms/:id/groups/:groupId` - Remove group
- `POST /api/rooms/join` - Join room by invite code

### Tasks
- `GET /api/tasks/room/:roomId` - Get all tasks for room
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/activate` - Activate task for voting
- `POST /api/tasks/:id/deactivate` - Deactivate task
- `GET /api/tasks/room/:roomId/consolidate` - Get consolidated analytics

### Votes
- `POST /api/votes` - Submit vote
- `GET /api/votes/task/:taskId/my-vote` - Get my vote
- `GET /api/votes/task/:taskId/all` - Get all votes (admin only)
- `DELETE /api/votes/task/:taskId` - Delete my vote
- `DELETE /api/votes/task/:taskId/clear` - Clear all votes for task (admin only)

### Jira Integration
- `PUT /api/auth/jira-settings` - Save Jira integration settings
- `DELETE /api/auth/jira-settings` - Remove Jira integration settings
- `POST /api/auth/validate-jira` - Validate Jira credentials
- `GET /api/jira/projects` - Get list of Jira projects
- `GET /api/jira/search` - Search for Jira issues with JQL
- `POST /api/jira/import/room/:roomId` - Import Jira issues to a room
- `POST /api/jira/export/task/:taskId` - Export a task to Jira
- `PUT /api/jira/sync/task/:taskId` - Synchronize a task with its Jira issue
- `GET /api/jira/task/:taskId/link` - Get linked Jira issue for a task

---

## 🚀 Getting Started

### Team & VPN Access

Planning Poker now includes built-in support for team collaboration over VPNs and local networks:

- **Automatic Network Detection**: The app detects all network interfaces including VPN
- **No Configuration Needed**: Just run `./start.sh` and it handles everything automatically
- **Team Access URLs**: URLs for team access are prominently displayed in the terminal
- **Cross-Network Compatible**: Works across VPNs, local networks, and subnets
- **Clipboard Support**: Team URLs are automatically copied to your clipboard

To share the application with your team:

1. Run `./start.sh` (automatic VPN optimization)
2. Look for the "TEAM ACCESS URL" at the end of the output
3. Share this URL with your teammates
4. Teammates on the same network/VPN can access the app directly

### Quick Start

```bash
chmod +x start.sh
./start.sh

```

This script will:
- Stop any running services
- Free up ports (5432, 5050, 5000, 5173)
- Start PostgreSQL and pgAdmin with Docker
- Install dependencies for backend and frontend
- Run database migrations
- Start backend server (port 5000)
- Start frontend dev server with Vite (port 5173)
- **Automatically configure VPN/network access for team collaboration**
- **Display team access URLs at the end**

**Access:**
- Local Frontend: http://localhost:5173
- Local Backend API: http://localhost:5000
- pgAdmin: http://localhost:5050 (login with credentials from .env)
- **Team Access:** The script automatically shows network URLs for team access

### Script Commands

The `start.sh` script provides several commands:

```bash
# Start everything with automatic VPN optimization (default)
./start.sh

# Generate team access URLs without restarting
./start.sh team-urls

# Explicitly start with VPN optimization (same as default)
./start.sh vpn

# Start only backend (and database if needed)
./start.sh backend

# Start only frontend
./start.sh frontend

# Only restart Docker containers
./start.sh restart-docker

# Clean up all services and free ports
./start.sh clean

# Show help
./start.sh help

```

### Manual Setup

#### Step 1: Setup Database

```bash
# Start PostgreSQL and pgAdmin with Docker
docker-compose up -d

```

#### Step 2: Setup Environment

```bash
# Create root .env file if it doesn't exist
cp .env.example .env

# Update credentials if needed

```

#### Step 3: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create backend .env file
cp .env.example .env

# Initialize database
npm run init-db

# Start the backend server
npm start

```

#### Step 4: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev

```

### Environment Variables

The application uses three levels of configuration files:

#### Root `.env` (Project Root)

Used by Docker Compose and shared across services:

```env
# PostgreSQL Configuration (for Docker Compose)
POSTGRES_USER=planningpoker
POSTGRES_PASSWORD=planningpoker
POSTGRES_DB=planningpokerdb

# pgAdmin Configuration (optional - for database management)
PGADMIN_EMAIL=admin@admin.com
PGADMIN_PASSWORD=admin

# JWT Configuration (used by backend)
JWT_SECRET=jwtsecretkey

# Frontend URL for CORS configuration
FRONTEND_URL=http://localhost:5173
```

⚠️ **Security Note:** Change default passwords before production deployment!

#### Backend `.env` (`/backend/.env`)

Backend-specific configuration:

```env
PORT=5000
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=planningpokerdb
JWT_SECRET=rdreams
NODE_ENV=development

# pgAdmin (optional - for database management)
PGADMIN_EMAIL=admin@admin.com
PGADMIN_PASSWORD=admin

# Jira integration
# Set to 'true' if your Jira instance uses self-signed certificates
JIRA_ALLOW_SELF_SIGNED=true
JIRA_STORY_POINTS_FIELD_ID=customfield_10004
```

#### Frontend `.env` (`/frontend/.env`)

Optional frontend configuration (has sensible defaults):

```env
# API URLs
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5173

# External Service URLs
VITE_JIRA_API_TOKEN_URL=https://dc-devjira2.athenahealth.com/manage/api-tokens
```

#### VPN/Team Access Configuration

When using `./start.sh` (default) or `./start.sh vpn`, the script automatically creates `.env.local` files:

**Frontend `.env.local`:**
```env
# Generated by VPN setup script
VITE_API_URL=http://YOUR_IP:5000/api
VITE_SOCKET_URL=http://YOUR_IP:5000
```

**Backend `.env.local`:**
```env
# Generated by VPN setup script
PORT=5000
HOST=0.0.0.0
FRONTEND_URL=http://YOUR_IP:5173
```

### Service Ports

**Current Setup:**
- **Frontend:** http://localhost:5173 (or http://YOUR_IP:5173 for team access)
- **Backend API:** http://localhost:5000
- **PostgreSQL:** localhost:5432
- **pgAdmin:** http://localhost:5050
- **Socket.IO:** Uses same port as backend (5000)

**Network Configuration:**
- Frontend serves on `0.0.0.0:5173` (accessible from network)
- Backend listens on `0.0.0.0:5000` when using VPN mode
- CORS configured to accept any origin dynamically
- Socket.IO supports both WebSocket and polling transports

---

## � Docker Compose Configuration

The application uses Docker Compose to manage PostgreSQL database and pgAdmin services.

### Services Overview

**PostgreSQL Database:**
- **Image:** `postgres:15-alpine`
- **Container Name:** `planningpoker-db`
- **Port:** `5432:5432`
- **Volume:** `postgres_data` (persistent data storage)
- **Health Check:** Automatic readiness detection with `pg_isready`
- **Restart Policy:** `unless-stopped`

**pgAdmin (Database Management UI):**
- **Image:** `dpage/pgadmin4:latest`
- **Container Name:** `planningpoker-pgadmin`
- **Port:** `5050:80` (access via http://localhost:5050)
- **Volume:** `pgadmin_data` (persistent settings)
- **Mode:** Desktop mode (no master password required)
- **Restart Policy:** `unless-stopped`

### Docker Compose Commands

**Start all services:**
```bash
docker-compose up -d
```

**Stop all services:**
```bash
docker-compose down
```

**View running containers:**
```bash
docker ps
```

**View logs:**
```bash
# PostgreSQL logs
docker logs planningpoker-db

# pgAdmin logs
docker logs planningpoker-pgadmin

# Follow logs in real-time
docker logs -f planningpoker-db
```

**Connect to PostgreSQL CLI:**
```bash
docker exec -it planningpoker-db psql -U planningpoker -d planningpokerdb
```

**Restart a specific service:**
```bash
docker-compose restart postgres
# or
docker-compose restart pgadmin
```

**Remove containers and volumes (⚠️ deletes all data):**
```bash
docker-compose down -v
```

### Accessing pgAdmin

1. Open http://localhost:5050 in your browser
2. Login with credentials from root `.env`:
   - **Email:** `admin@admin.com` (default)
   - **Password:** `admin` (default)
3. Add a new server connection:
   - **General Tab:**
     - Name: `Planning Poker DB` (or any name)
   - **Connection Tab:**
     - **Host:** `planningpoker-db` (container name, not localhost)
     - **Port:** `5432`
     - **Maintenance database:** `postgres`
     - **Username:** `planningpoker` (from `.env`)
     - **Password:** `planningpoker` (from `.env`)
     - Save password: ✅ (optional)
4. Click "Save" to connect

**Common pgAdmin Operations:**
- Browse tables: `Servers > Planning Poker DB > Databases > planningpokerdb > Schemas > public > Tables`
- Run queries: Right-click database > Query Tool
- View data: Right-click table > View/Edit Data > All Rows
- Export data: Right-click table > Import/Export

---

## 🔧 Troubleshooting

### Port Conflicts

**Symptoms:**
- Error: "Port already in use"
- Services fail to start
- Connection refused errors

**Solution 1 - Use start.sh clean command:**
```bash
./start.sh clean
```
This automatically:
- Stops all Planning Poker services
- Frees ports 5432, 5050, 5000, 5173
- Removes Docker containers
- Prunes Docker resources

**Solution 2 - Manual port check and kill:**
```bash
# Check what's using a port
lsof -i :5000  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # PostgreSQL
lsof -i :5050  # pgAdmin

# Kill process on port
kill -9 $(lsof -ti:5000)
kill -9 $(lsof -ti:5173)
```

### Database Connection Issues

**Symptoms:**
- Backend can't connect to PostgreSQL
- "Connection refused" or "ECONNREFUSED" errors

**Solutions:**

1. **Check if PostgreSQL is running:**
```bash
docker ps | grep planningpoker-db
```

2. **Check PostgreSQL health:**
```bash
docker exec planningpoker-db pg_isready -U planningpoker
```

3. **Verify environment variables:**
```bash
# In backend/.env
# Make sure these match the root .env values
POSTGRES_HOST=localhost  # not 'planningpoker-db' when running outside Docker
POSTGRES_PORT=5432
POSTGRES_USER=planningpoker
POSTGRES_DB=planningpokerdb
```

4. **Restart PostgreSQL container:**
```bash
docker-compose restart postgres
```

5. **Reset database completely:**
```bash
docker-compose down -v
docker-compose up -d
cd backend && npm run init-db
```

### Real-Time Updates Not Working

**Symptoms:**
- Votes don't update in real-time
- Task changes don't sync across browsers
- Socket connection errors

**Solutions:**

1. **Check Socket.IO connection in browser console:**
   - Open DevTools > Console
   - Look for Socket.IO connection messages
   - Should see: "Socket connected: <socket-id>"

2. **Verify backend Socket.IO is running:**
```bash
# Backend logs should show:
# "Socket.IO server is running"
```

3. **Check CORS configuration:**
   - Backend should accept connections from your IP
   - Check `backend/server.js` for CORS settings

4. **Restart backend service:**
```bash
./start.sh backend
```

### Frontend Not Accessible from Network

**Symptoms:**
- Localhost works but team URLs don't
- "Connection refused" from other devices
- Timeout errors from network

**Solutions:**

1. **Use VPN mode explicitly:**
```bash
./start.sh vpn
```

2. **Check Vite configuration:**
```javascript
// frontend/vite.config.js should have:
server: {
  host: '0.0.0.0',  // Allow network access
  port: 5173
}
```

3. **Verify firewall settings:**
```bash
# macOS - check if ports are allowed
# Windows - check Windows Firewall
# Linux - check iptables or ufw
```

4. **Check .env.local files exist:**
```bash
ls frontend/.env.local
ls backend/.env.local
# These should be created by ./start.sh
```

5. **Get current team URLs:**
```bash
./start.sh team-urls
```

### Docker Volume Issues

**Symptoms:**
- Data disappears after restart
- "Volume in use" errors
- Database initialization fails

**Solutions:**

1. **List Docker volumes:**
```bash
docker volume ls
```

2. **Remove specific volume:**
```bash
docker volume rm planningpoker_postgres_data
docker volume rm planningpoker_pgadmin_data
```

3. **Remove all unused volumes:**
```bash
docker volume prune
```

4. **Complete cleanup and restart:**
```bash
./start.sh clean
./start.sh
```

### npm/Node Issues

**Symptoms:**
- Module not found errors
- Dependency conflicts
- Version mismatch errors

**Solutions:**

1. **Clear node_modules and reinstall:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

2. **Check Node.js version:**
```bash
node --version  # Should be v16 or higher
npm --version
```

3. **Clear npm cache:**
```bash
npm cache clean --force
```

### Jira Integration Issues

**Symptoms:**
- Can't connect to Jira
- "Invalid credentials" errors
- SSL/certificate errors

**Solutions:**

1. **For self-signed certificates:**
```bash
# In backend/.env
JIRA_ALLOW_SELF_SIGNED=true
```

2. **Verify API token is correct:**
   - Regenerate token at https://id.atlassian.com/manage/api-tokens
   - Update in user profile
   - Test connection

3. **Check Jira URL format:**
```
✅ Correct: https://your-company.atlassian.net
❌ Wrong:   https://your-company.atlassian.net/
❌ Wrong:   your-company.atlassian.net
```

4. **For Athenahealth Jira (Data Center):**
```bash
# In backend/.env
JIRA_TYPE=data-center
JIRA_AUTH_TYPE=pat
```

### Getting Help

If issues persist:

1. **Check logs:**
```bash
# Backend logs
npm start  # View in terminal

# Frontend logs
npm run dev  # View in terminal

# Docker logs
docker logs planningpoker-db
docker logs planningpoker-pgadmin
```

2. **Verify all prerequisites are installed:**
```bash
node --version      # Should be v16+
docker --version    # Should be installed
docker-compose --version  # Should be installed
```

3. **Check system resources:**
   - Ensure ports 5000, 5173, 5432, 5050 are available
   - Ensure Docker has enough memory allocated (at least 2GB)
   - Check disk space for Docker volumes

4. **Contact the development team** with:
   - Error messages from logs
   - Steps to reproduce the issue
   - Your environment details (OS, Node version, Docker version, browser type)

---

## Database Schema

The application uses PostgreSQL with the following tables:

### Core Tables

**`users` - User accounts**
```sql
- id (SERIAL PRIMARY KEY)
- email (VARCHAR UNIQUE) - User login email
- password (VARCHAR) - Hashed password (bcrypt)
- name (VARCHAR) - Display name
- jira_token (VARCHAR) - Encrypted Jira API token
- jira_url (VARCHAR) - Jira instance URL
- jira_email (VARCHAR) - Jira account email
- jira_integration_enabled (BOOLEAN) - Jira enabled flag
- jira_auth_type (VARCHAR) - 'token' or 'pat'
- created_at, updated_at (TIMESTAMP)
```

**`groups` - Team groups**
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR) - Group name
- description (TEXT) - Group description
- creator_id (INTEGER) - References users(id)
- created_at, updated_at (TIMESTAMP)
```

**`group_members` - Group membership**
```sql
- id (SERIAL PRIMARY KEY)
- group_id (INTEGER) - References groups(id)
- user_id (INTEGER) - References users(id)
- role (VARCHAR) - 'participant' or 'admin'
- joined_at (TIMESTAMP)
- UNIQUE(group_id, user_id)
```

**`rooms` - Planning Poker rooms**
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR) - Room name
- description (TEXT) - Room description
- invite_code (VARCHAR UNIQUE) - 8-char alphanumeric code
- creator_id (INTEGER) - References users(id)
- created_at, updated_at (TIMESTAMP)
```

**`room_participants` - Direct room access**
```sql
- id (SERIAL PRIMARY KEY)
- room_id (INTEGER) - References rooms(id)
- user_id (INTEGER) - References users(id)
- role (VARCHAR) - 'participant' or 'admin'
- joined_at (TIMESTAMP)
- UNIQUE(room_id, user_id)
```

**`room_groups` - Group-based room access**
```sql
- id (SERIAL PRIMARY KEY)
- room_id (INTEGER) - References rooms(id)
- group_id (INTEGER) - References groups(id)
- added_at (TIMESTAMP)
- UNIQUE(room_id, group_id)
```

**`tasks` - Estimation tasks**
```sql
- id (SERIAL PRIMARY KEY)
- room_id (INTEGER) - References rooms(id)
- title (VARCHAR) - Task title
- description (TEXT) - Task details
- story_points (INTEGER) - Final estimate
- is_active (BOOLEAN) - Currently voting flag
- status (VARCHAR) - 'draft', 'active', 'completed'
- created_by (INTEGER) - References users(id)
- created_at, updated_at (TIMESTAMP)
```

**`votes` - Participant votes**
```sql
- id (SERIAL PRIMARY KEY)
- task_id (INTEGER) - References tasks(id)
- user_id (INTEGER) - References users(id)
- estimate (INTEGER) - Vote value (story points)
- voted_at (TIMESTAMP)
- UNIQUE(task_id, user_id)
```

**`jira_issue_links` - Jira integration**
```sql
- id (SERIAL PRIMARY KEY)
- task_id (INTEGER) - References tasks(id)
- jira_issue_id (VARCHAR) - Jira issue ID
- jira_issue_key (VARCHAR) - Jira issue key (e.g., PROJ-123)
- jira_project_key (VARCHAR) - Jira project key
- created_at, updated_at (TIMESTAMP)
```

### Database Indexes

Performance indexes on foreign keys and frequently queried columns:
- `idx_group_members_group_id` - Group membership lookups
- `idx_group_members_user_id` - User's groups lookups
- `idx_room_participants_room_id` - Room participant lists
- `idx_room_participants_user_id` - User's rooms lookups
- `idx_room_groups_room_id` - Room's groups
- `idx_room_groups_group_id` - Group's rooms
- `idx_tasks_room_id` - Room's tasks
- `idx_votes_task_id` - Task's votes
- `idx_votes_user_id` - User's votes
- `idx_jira_issue_links_task_id` - Task's Jira links
- `idx_jira_issue_links_jira_issue_key` - Jira issue lookups

### Database Initialization

The database schema is created automatically when you run:

```bash
cd backend
npm run init-db
```

This executes `backend/db/init.js` which reads `backend/db/schema.sql` and creates all tables with indexes.

**Migration Commands:**
```bash
# Initialize fresh database
npm run init-db

# Connect to database CLI
docker exec -it planningpoker-db psql -U planningpoker -d planningpokerdb

# Inside psql:
\dt              # List all tables
\d users         # Describe users table
\d+ tasks        # Detailed description
\di              # List indexes
```

---

## Project Structure


```
planningpoker/
├── backend/
│   ├── db/
│   │   ├── config.js               # Database connection
│   │   ├── schema_update_jira.sql  # Jira integration schema updates
│   │   └── update_jira_schema.js   # Script to apply Jira schema updates
│   ├── middleware/
│   │   └── auth.js                 # JWT authentication
│   ├── routes/
│   │   ├── auth.js                 # Authentication endpoints + Jira token management
│   │   ├── groups.js               # Group management
│   │   ├── jira.js                 # Jira integration endpoints (import/export)
│   │   ├── rooms.js                # Room management + invite codes
│   │   ├── tasks.js                # Task management + activate/deactivate
│   │   └── votes.js                # Voting endpoints + clear votes
│   ├── utils/
│   │   ├── helpers.js              # Permission helpers, invite code generator
│   │   └── jira.js                # Jira integration utilities
│   ├── server.js                   # Express + Socket.IO server
│   ├── package.json
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ManageParticipantsModal.jsx    # Room access management
│   │   │   ├── ManageMembersModal.jsx         # Group member management
│   │   │   ├── EditRoomModal.jsx              # Edit room details
│   │   │   ├── JoinRoomModal.jsx              # Join by invite code
│   │   │   ├── ImportTasksModal.jsx           # Bulk CSV import
│   │   │   ├── JiraImportModal.jsx            # Import tasks from Jira
│   │   │   ├── JiraExportModal.jsx            # Export tasks to Jira
│   │   │   ├── JiraSettings.jsx               # User profile Jira integration
│   │   │   ├── ConsolidatedView.jsx           # Analytics dashboard
│   │   │   ├── TaskCard.jsx                   # Task card with revote
│   │   │   ├── TaskTableView.jsx              # Task table with revote
│   │   │   ├── VotingCard.jsx                 # Real-time vote count
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx                  # Dashboard with join room
│   │   │   ├── Room.jsx                       # Room page with 2 views
│   │   │   ├── GroupDetail.jsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── api.js                         # API client
│   │   │   ├── jira-api.js                    # Jira API client
│   │   │   └── socket.js                      # Socket.IO client
│   │   ├── store/
│   │   │   └── useStore.js                    # Zustand store
│   │   └── App.jsx
│   ├── vite.config.js             # Vite config with network access
│   └── package.json
├── docker-compose.yml              # Database services: PostgreSQL and pgAdmin
├── start.sh                       # Enhanced script with VPN detection and team access features
├── .env.example                   # Example environment variables
└── README.md

```

---

## 🧪 Testing

### Test Room Management

1. Create a room as user A
2. Open the room in another browser/tab as user B
3. As user A, click "Manage Access"
4. Add user B as a participant
5. Watch user B's screen update in real-time
6. Create a group with both users
7. Remove user B and add the group instead
8. Verify both screens update simultaneously

### Test Group Management

1. Create a group as user A
2. Open the group in another browser/tab
3. As user A, click "Manage Members"
4. Add a member or change a role
5. Watch the other tab update in real-time
6. Try toggling a member's role
7. Verify both screens update simultaneously

### Test CSV Import

1. Create a room as admin
2. Click "Import CSV" button
3. Download the template CSV
4. Add 5-10 tasks to the CSV
5. Upload the CSV file
6. Verify preview shows correctly
7. Import and verify all tasks are created

### Test Revote Feature

1. Create a room and task
2. Have multiple users vote
3. As admin, click "Reset & Revote"
4. Verify votes are cleared
5. Verify task is active again
6. Vote again and verify it works

### Test Join Room by Invite Code

1. Create a room as user A
2. Copy the 8-character invite code
3. Login as user B
4. Click "Join Room" on dashboard
5. Enter the invite code
6. Verify user B can access the room

### Test VPN & Network Access

1. Run the application with `./start.sh`
2. Note the displayed team access URL at the end
3. Share this URL with teammates on the same network or VPN
4. Have teammates access the URL from their browsers
5. Verify they can access the application without errors
6. Test real-time features across different devices

### Test Jira Integration

1. Enable Jira integration in your profile
2. Generate a test API token from Atlassian
3. Connect your Jira account
4. Create a room as admin
5. Click "Import from Jira" button
6. Select a project and import issues
7. Verify imported tasks appear in the room
8. Activate a task for voting and assign story points
9. Click "Export to Jira" on the task
10. Verify the story points are updated in Jira

---

## 🎨 Production Enhancements

### User Experience
- ✅ **CSV bulk import for tasks** - Implemented
- ✅ **Revote functionality** - Implemented
- ✅ **Join by invite code** - Implemented  
- ✅ **Edit room details** - Implemented
- ✅ **Real-time vote counting** - Implemented
- Replace user ID input with autocomplete search by email/name
- Add toast notifications for success/error messages
- Add confirmation modals for destructive actions (partially done)
- Implement drag-and-drop for task reordering

### Deployment
- ✅ **Docker Compose for databases** - Implemented
- ✅ **pgAdmin integration** - Implemented
- ✅ **Local development setup** - Implemented
- ✅ **VPN & Network Access** - Implemented with automatic detection
- CI/CD pipeline (GitHub Actions, GitLab CI)
- Production environment configuration
- HTTPS/SSL configuration
- Load balancing for scalability

### Security
- Implement rate limiting on API endpoints
- Add CSRF protection
- Implement proper session management
- Add audit logging for sensitive operations
- Implement two-factor authentication
- Input validation and sanitization improvements

### Features
- ✅ **Jira Integration** - Two-way integration with Jira Cloud/Server
- Email invitations to users and groups
- Activity log tracking (who added/removed whom and when)
- Task templates for common story types
- Custom story point scales (Fibonacci, T-shirt sizes, etc.)
- Sprint planning wizard
- Historical velocity tracking
- Burndown charts
- Integration with other issue trackers (Azure DevOps, etc.)
- Mobile responsive improvements
- Dark mode theme

## 🔄 Jira Integration

Planning Poker now offers comprehensive integration with Jira Cloud and Jira Server/Data Center, enabling teams to seamlessly import issues for estimation and export story points back to Jira.

### Setup & Configuration

#### 1. Get Jira API Token

To use Jira integration, each user needs to generate a personal API token:

1. Navigate to [https://id.atlassian.com/manage/api-tokens](https://id.atlassian.com/manage/api-tokens)
2. Click "Create API token"
3. Enter a label (e.g., "Planning Poker Integration") and click "Create"
4. Copy your token (you won't be able to see it again)

#### 2. Connect Your Account

1. In Planning Poker, go to your **Profile** page
2. Scroll down to the **Jira Integration** section
3. Enter your Jira URL (e.g., `https://your-company.atlassian.net`)
4. Enter your Jira email address
5. Enter your Jira API token
6. Click "Test Connection" to verify credentials
7. Click "Enable Jira Integration"

### Importing Issues from Jira

1. Open any room where you have admin privileges
2. Click the **Import from Jira** button in the toolbar
3. Select a Jira project from the dropdown
4. Optionally, add JQL filters to narrow down the issues (e.g., `status = "To Do"`)
5. Click "Search" to find matching issues
6. Select issues to import
7. Click "Import Issues" to create planning poker tasks

**Note**: Imported tasks maintain a link to their Jira issues, enabling two-way synchronization of story points.

### Exporting Story Points to Jira

After completing estimation:

1. Locate any task with assigned story points
2. Click the **Export to Jira** button
3. If this is a new export:
   - Select the destination Jira project
   - Select issue type (Task, Story, Bug, etc.)
   - Click "Export to Jira"
4. If the task was imported from or previously exported to Jira:
   - Click "Sync with Jira" to update the story points

### Batch Exporting & Syncing Entire Rooms

Need to push every task in a room to Jira in one go? Use the **Jira Export/Sync** shortcut in the room header:

1. Open the room and click **Jira Export/Sync** in the top toolbar
2. Pick between **Export to Jira** (creates/updates issues) or **Sync with Jira** (updates only linked issues)
3. The project picker now supports type-to-search for fast selection across large Jira instances
4. Choose the target issue type (Task, Story, Bug, Epic)
5. Submit and monitor the summary table for successes and per-task errors

**How it works:**

- Tasks without Jira links are created in the chosen project and linked back automatically
- Tasks already linked to Jira issues have their summary, description, and story points updated
- Inline error reporting highlights tasks that failed to export with the original Jira error message

### CSV Export for Analytics

For offline analysis or sharing with stakeholders, download a snapshot of the room:

1. Click **Export CSV** in the room header
2. A CSV file containing task title, description, story points, status, author, created date, and Jira key will download instantly
3. Import into Excel, Google Sheets, or BI tooling for additional reporting

### Security & Permissions

- API tokens are stored securely using strong encryption
- Each user manages their own Jira credentials
- Only users with valid Jira tokens can import/export
- The application only requests the minimum required permissions

### Self-signed Certificates

If your Jira instance uses self-signed certificates (common for on-premise installations):

1. Set `JIRA_ALLOW_SELF_SIGNED=true` in the backend `.env` file
2. Restart the backend server
3. Connection errors with code `SELF_SIGNED_CERT_IN_CHAIN` should be resolved

### Story Points Configuration

The Jira integration allows configuring the custom field used for story points:

1. Set `JIRA_STORY_POINTS_FIELD_ID` in your backend `.env` file to the correct field ID for your Jira instance
2. To disable story points completely, set `JIRA_STORY_POINTS_FIELD_ID=none`
3. If not specified, it defaults to `customfield_10002` (which works for many standard Jira Cloud instances)

### Authentication Methods

The Jira integration now supports multiple authentication methods:

1. **API Token** (default for Jira Cloud)
   - Works with Atlassian Cloud instances
   - Get your token from [Atlassian API tokens page](https://id.atlassian.com/manage/api-tokens)
   - Select "API Token" option in settings

2. **Personal Access Token (PAT)** (recommended for Jira Server/Data Center)
   - Works with Jira Server and Data Center instances
   - Generate a PAT from your Jira instance profile page
   - Select "Personal Access Token" option in settings
   - More secure and flexible than API tokens

3. **Basic Authentication**
   - Available through backend configuration only
   - Less secure, but available for legacy systems

You can configure the default authentication type by setting `JIRA_AUTH_TYPE` in your backend `.env` file.

### Connecting to Athenahealth Jira

For connecting to the Athenahealth Jira instance (dc-devjira2.athenahealth.com):

1. Set `JIRA_TYPE=data-center` in the backend `.env` file
2. Set `JIRA_AUTH_TYPE=pat` in the backend `.env` file
3. Use your Athenahealth username (not email) in the user profile
4. Generate a Personal Access Token (PAT) at [Jira Profile Page](https://dc-devjira2.athenahealth.com/secure/ViewProfile.jspa)
5. Select "Personal Access Token" option in the settings form
6. Use `https://dc-devjira2.athenahealth.com` as the Jira URL
7. Ensure you're connected to the Athenahealth network/VPN

### Jira Permission Matrix

| Action | Participant | Admin |
|--------|------------|-------|
| Import from Jira | ❌ | ✅ |
| View Jira links | ✅ | ✅ |
| Export to Jira | ❌ | ✅ |
| Sync story points | ❌ | ✅ |

### Technical Details

- Token-based authentication for secure API access
- Uses the official Jira REST API
- Supports both Jira Cloud and Server/Data Center
- Handles complex JQL queries
- Maintains bidirectional links between tasks and Jira issues

### Performance
- Implement pagination for large lists
- Add caching for frequently accessed data
- Optimize database queries with indexes
- Implement lazy loading for heavy components
- Add service workers for offline support
- WebSocket connection pooling

---

## 📝 License

This project is for educational and internal use.

---

## 🤝 Support

For issues, questions, or contributions, please contact the development team.

---

## 📚 Additional Resources

### Key Concepts

**Planning Poker** - An estimation technique where team members make estimates anonymously and then discuss any major differences.

**Story Points** - A unit of measure for expressing the overall effort required to fully implement a product backlog item or any other piece of work.

**Consensus** - Agreement among most team members (≥50%) on an estimate.

**Velocity** - The average amount of story points completed per sprint.

### Keyboard Shortcuts

- `Ctrl/Cmd + K` - Quick create task (when in room)
- `Ctrl/Cmd + Enter` - Submit vote (when voting)
- `Esc` - Close modal dialogs

### Tips & Tricks

1. **Use Groups Wisely** - Create groups for stable teams that work together often
2. **Export Regularly** - Export story data after each sprint for historical tracking
3. **Review Consensus** - Low consensus stories usually need more discussion
4. **Check Outliers** - Extreme votes often indicate missing information
5. **Track Velocity** - Use analytics view to monitor team capacity over time

---

**Built with ❤️ for Agile Teams**

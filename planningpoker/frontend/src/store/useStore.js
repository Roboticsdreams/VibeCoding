import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Auth state
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  setUser: (user) => set({ user, isAuthenticated: true }),
  
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Groups state
  groups: [],
  currentGroup: null,

  setGroups: (groups) => set({ groups }),
  setCurrentGroup: (group) => set({ currentGroup: group }),
  
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  
  updateGroup: (id, updates) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      currentGroup: state.currentGroup?.id === id ? { ...state.currentGroup, ...updates } : state.currentGroup,
    })),
  
  removeGroup: (id) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
      currentGroup: state.currentGroup?.id === id ? null : state.currentGroup,
    })),

  // Rooms state
  rooms: [],
  currentRoom: null,

  setRooms: (rooms) => set({ rooms }),
  setCurrentRoom: (room) => set({ currentRoom: room }),
  
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
  
  updateRoom: (id, updates) =>
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      currentRoom: state.currentRoom?.id === id ? { ...state.currentRoom, ...updates } : state.currentRoom,
    })),
  
  removeRoom: (id) =>
    set((state) => ({
      rooms: state.rooms.filter((r) => r.id !== id),
      currentRoom: state.currentRoom?.id === id ? null : state.currentRoom,
    })),

  // Tasks state
  tasks: [],
  currentTask: null,

  setTasks: (tasks) => {
    // Support both direct values and functional updates
    set((state) => ({
      tasks: typeof tasks === 'function' ? tasks(state.tasks) : tasks
    }));
  },
  setCurrentTask: (task) => set({ currentTask: task }),
  
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      currentTask: state.currentTask?.id === id ? { ...state.currentTask, ...updates } : state.currentTask,
    })),
  
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      currentTask: state.currentTask?.id === id ? null : state.currentTask,
    })),

  // Votes state
  votes: [],
  myVote: null,

  setVotes: (votes) => set({ votes }),
  setMyVote: (vote) => set({ myVote: vote }),
  
  addVote: (vote) => set((state) => ({ votes: [...state.votes, vote] })),
  
  updateVote: (userId, estimate) =>
    set((state) => ({
      votes: state.votes.map((v) => (v.user_id === userId ? { ...v, estimate } : v)),
    })),
  
  removeVote: (userId) =>
    set((state) => ({
      votes: state.votes.filter((v) => v.user_id !== userId),
    })),
}));

export default useStore;

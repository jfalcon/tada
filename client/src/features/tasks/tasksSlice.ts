import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Task } from '@/services/api';

const BASE_URL = '/api';

interface ServerTask {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  created_at: string;
  updated_at: string;
}

function normalizeTask(t: ServerTask): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? undefined,
    due_date: t.due_date ?? null,
    category_id: t.category_id,
    user_id: t.user_id,
    completed: t.status === 'Completed',
    priority: t.priority,
    status: t.status,
    created_at: t.created_at,
  } as Task;
}

function isServerTask(u: unknown): u is ServerTask {
  if (!u || typeof u !== 'object') return false;
  const o = u as Record<string, unknown>;
  return (
    typeof o.id === 'number' &&
    typeof o.user_id === 'number' &&
    typeof o.category_id === 'number' &&
    typeof o.title === 'string' &&
    (o.description === undefined || typeof o.description === 'string' || o.description === null) &&
    (o.due_date === undefined || typeof o.due_date === 'string' || o.due_date === null) &&
    typeof o.priority === 'string' &&
    typeof o.status === 'string' &&
    typeof o.created_at === 'string'
  );
}

export interface TasksState {
  items: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string | null;
}

const initialState: TasksState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchTasks = createAsyncThunk<Task[]>('tasks/fetchTasks', async () => {
  const res = await fetch(`${BASE_URL}/task`);
  if (!res.ok) throw new Error('Failed to fetch tasks');

  const data = await res.json() as ServerTask[];
  if (!Array.isArray(data)) return [];

  return data.filter(isServerTask).map((d) => normalizeTask(d));
});

export const createTask = createAsyncThunk<Task, Partial<Task>>(
  'tasks/createTask',
  async (payload) => {
    const res = await fetch(`${BASE_URL}/task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Failed to create task');
    const data = await res.json() as { id: number };

    // since the server returns { id } on create, fetch the created task
    if (typeof data === 'object' && typeof data.id === 'number') {
      const getRes = await fetch(`${BASE_URL}/task/${data.id}`);
      if (!getRes.ok) throw new Error('Failed to fetch created task');

      const created = await getRes.json() as unknown;
      if (!isServerTask(created)) throw new Error('Invalid created task');

      return normalizeTask(created);
    }

    throw new Error('Invalid create response');
  },
);

export const updateTask = createAsyncThunk<Task, Partial<Task> & Pick<Task, 'id'>>(
  'tasks/updateTask',
  async ({ id, ...patch }) => {
    const body: Record<string, unknown> = { ...patch };

    // failsafe in case the user forgot to convert completed to status
    // ultimately this should be a single field between client and server
    if ('completed' in body) {
      const c = body.completed;
      if (typeof c === 'boolean') body.status = c ? 'Completed' : body.status;
      delete body.completed;
    }

    if ('due_date' in body && body.due_date === '') body.due_date = null;

    const res = await fetch(`${BASE_URL}/task/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error('Failed to update task');

    // second call: fetch the canonical updated task from server
    const getRes = await fetch(`${BASE_URL}/task/${id}`);
    if (!getRes.ok) throw new Error('Failed to fetch updated task');

    const data = await getRes.json() as unknown;
    if (!isServerTask(data)) throw new Error('Invalid task updated');

    return normalizeTask(data);
  },
);

export const deleteTask = createAsyncThunk<{ id: number }, number>(
  'tasks/deleteTask',
  async (id) => {
    const res = await fetch(`${BASE_URL}/task/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete task');

    // server returns { success: boolean, id }
    return { id };
  },
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<Task[]>) {
      state.items = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    clear(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to fetch tasks';
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload.id);
      });
  },
});

export const { setAll, clear } = tasksSlice.actions;

export default tasksSlice.reducer;

export const selectTasks = (state: { tasks: TasksState }) => state.tasks.items;
export const selectTasksStatus = (state: { tasks: TasksState }) => state.tasks.status;

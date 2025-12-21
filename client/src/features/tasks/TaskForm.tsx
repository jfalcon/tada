import { useEffect, useRef, useState } from 'react';
import { useGetCategoriesQuery, useGetUsersQuery, type Task, type User } from '@/services/api';
import { useAppDispatch } from '@/hooks';
import { createTask, updateTask as updateTaskThunk } from './tasksSlice';
import './TaskForm.scss';

interface FormState {
  title: string;
  description: string;
  due_date: string; // YYYY-MM-DD or ''
  category_id: string;
  user_id: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
};

interface TaskFormProps {
  task?: Task | null;
  onDone?: () => void;
  autoFocus?: boolean;
}

const MAX_TITLE_LEN = 255;

function formatDateForInput(v?: string | null): string {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function equalForm(a: FormState, b: FormState) {
  return (
    a.title === b.title
    && a.description === b.description
    && a.due_date === b.due_date
    && a.category_id === b.category_id
    && a.user_id === b.user_id
    && a.completed === b.completed
  );
}

export default function TaskForm({ task, onDone, autoFocus }: TaskFormProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const { data: categories = [] } = useGetCategoriesQuery(undefined);
  const { data: users = [] } = useGetUsersQuery(undefined);

  const empty: FormState = {
    title: '',
    description: '',
    due_date: '',
    category_id: '',
    user_id: '',
    completed: false,
    priority: 'Medium',
  };

  const formFromTask = (t?: Task | null): FormState =>
    t
      ? {
        title: t.title,
        description: t.description ?? '',
        due_date: formatDateForInput(t.due_date ?? null),
        category_id: t.category_id ? String(t.category_id) : '',
        user_id: t.user_id ? String(t.user_id) : '',
        completed: t.status === 'Completed' || false,
        priority: (t.priority ?? 'Medium'),
      }
      : { ...empty };

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function validate(current: FormState) {
    const next: Partial<Record<keyof FormState, string>> = {};
    const trimmedTitle = current.title.trim();

    if (!trimmedTitle)
      next.title = 'Title is required';
    else if (trimmedTitle.length > MAX_TITLE_LEN)
      next.title = `Title must be ${MAX_TITLE_LEN} characters or less`;

    if (!current.category_id) next.category_id = 'Category is required';
    if (!current.user_id) next.user_id = 'User is required';

    if (current.due_date) {
      const d = new Date(current.due_date);
      if (Number.isNaN(d.getTime())) next.due_date = 'Invalid date';
    }

    if (!['Low', 'Medium', 'High'].includes(current.priority)) next.priority = 'Invalid priority';

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const [form, setForm] = useState<FormState>(() => formFromTask(task));
  const titleRef = useRef<HTMLInputElement | null>(null);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setForm((s) => ({ ...s, title: v }));
    const t = v.trim();

    setErrors((prev) => {
      const next = { ...prev } as Partial<Record<keyof FormState, string>>;

      if (!t)
        next.title = 'Title is required';
      else if (t.length > MAX_TITLE_LEN)
        next.title = `Title must be ${MAX_TITLE_LEN} characters or less`;
      else
        delete next.title;

      return next;
    });
  }

  useEffect(() => {
    const next = formFromTask(task);
    if (!equalForm(form, next)) {
      const id = setTimeout(() => setForm(next), 0);
      return () => clearTimeout(id);
    }

    return undefined;
    // intentionally omit `form` from deps to avoid frequent updates; we compare inside effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  useEffect(() => {
    if (autoFocus) titleRef.current?.focus();
  }, [autoFocus]);

  async function submit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const payload: Partial<Task> = {
      title: form.title,
      description: form.description,
      due_date: form.due_date || undefined,
      category_id: form.category_id ? Number(form.category_id) : undefined,
      user_id: form.user_id ? Number(form.user_id) : undefined,
      priority: form.priority,
      // server stores completion as `status` enum
      status: form.completed ? 'Completed' : 'Pending',
    };

    try {
      const ok = validate(form);
      if (!ok) return;

      if (task) await dispatch(updateTaskThunk({ id: task.id, ...payload })).unwrap();
      else await dispatch(createTask(payload)).unwrap();
      onDone?.();
      setForm({ ...empty });
      setErrors({});
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <form id="task-form" onSubmit={(e) => void submit(e)}>
      <input
        ref={titleRef}
        placeholder="Title"
        value={form.title}
        onChange={handleTitleChange}
        required
        aria-invalid={Boolean(errors.title)}
      />
      {errors.title && <div className='error'>{errors.title}</div>}

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => {
          const v = e.target.value;
          setForm((s) => ({ ...s, description: v }));
          setErrors((prev) => { const next = { ...prev }; delete next.description; return next; });
        }} />

      <input
        type="date"
        value={form.due_date}
        onChange={(e) => {
          const v = e.target.value;
          setForm((s) => ({ ...s, due_date: v }));
          setErrors((prev) => { const next = { ...prev }; delete next.due_date; return next; });
        }} />

      <select
        value={form.category_id}
        onChange={(e) => {
          const v = e.target.value;
          setForm((s) => ({ ...s, category_id: v }));
          setErrors((prev) => { const next = { ...prev }; delete next.category_id; return next; });
        }}>
        <option value="">-- No category --</option>
        {categories.map((c) => (
          <option key={c.id} value={String(c.id)}>{c.category}</option>
        ))}
      </select>
      {errors.category_id && <div className='error'>{errors.category_id}</div>}

      <select
        value={form.user_id}
        onChange={(e) => {
          const v = e.target.value;
          setForm((s) => ({ ...s, user_id: v }));
          setErrors((prev) => { const next = { ...prev }; delete next.user_id; return next; });
        }}>
        <option value="">-- No user --</option>
        {users.map((u: User) => (
          <option key={u.id} value={String(u.id)}>{u.username}</option>
        ))}
      </select>
      {errors.user_id && <div className='error'>{errors.user_id}</div>}

      <select
        value={form.priority}
        onChange={(e) => {
          const v = e.target.value as 'Low' | 'Medium' | 'High';
          setForm((s) => ({ ...s, priority: v }));
          setErrors((prev) => { const next = { ...prev }; delete next.priority; return next; });
        }}
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      {errors.priority && <div className='error'>{errors.priority}</div>}

      <label>
        <input
          type="checkbox"
          checked={form.completed}
          onChange={(e) => {
            const v = e.target.checked;
            setForm((s) => ({ ...s, completed: v }));
            setErrors((prev) => { const next = { ...prev }; delete next.completed; return next; });
          }} />
        Completed
      </label>

      <div className='button-row'>
        <button
          className="primary"
          type="submit"
          disabled={Object.keys(errors).length > 0}
        >
          {task ? 'Update' : 'Create'}
        </button>

        {task && <button type="button" onClick={() => onDone?.()}>Cancel</button>}
      </div>
    </form>
  );
}

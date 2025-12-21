import { useMemo, useState, useEffect } from 'react';
import TaskForm from '@/features/tasks/TaskForm';
import CategoryForm from '@/features/categories/CategoryForm';
import { useGetCategoriesQuery, type Task } from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { fetchTasks, deleteTask, selectTasks, selectTasksStatus } from './tasksSlice';
import './TaskList.scss';

type Filter = 'all' | 'active' | 'completed'

interface TaskListProps {
  onOpenCategoryForm?: () => void;
  showCategoryForm?: boolean;
  setShowCategoryForm?: (v: boolean) => void;
}

export default function TaskList({
  onOpenCategoryForm,
  showCategoryForm,
  setShowCategoryForm,
}: TaskListProps): React.ReactElement {
  const tasks = useAppSelector(selectTasks);
  const status = useAppSelector(selectTasksStatus);
  const { data: categories = [] } = useGetCategoriesQuery(undefined);
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [sortBy, setSortBy] = useState<'due' | 'created'>('created');

  const grouped = useMemo(() => {
    const filtered = tasks.filter((t) => {
      if (filter === 'all') return true;
      if (filter === 'active') return !t.completed;
      return t.completed;
    });

    const sorted = filtered.slice().sort((a, b) => {
      const aKey = sortBy === 'due' ? a.due_date ?? '' : a.created_at ?? '';
      const bKey = sortBy === 'due' ? b.due_date ?? '' : b.created_at ?? '';
      return aKey.localeCompare(bKey);
    });

    const byCategory = new Map<number | null, Task[]>();
    for (const t of sorted) {
      const key = t.category_id ?? null;
      const arr = byCategory.get(key) ?? [];
      arr.push(t);
      byCategory.set(key, arr);
    }
    return byCategory;
  }, [tasks, filter, sortBy]);

  function formatDateLocal(v?: string | null) {
    if (!v) return '—';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    try {
      return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(d);
    } catch {
      return d.toLocaleDateString();
    }
  }

  const categoryMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of categories) m.set(c.id, c.category);
    return m;
  }, [categories]);

  // close on Escape when modal is open
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowForm(false);
        setShowCategoryForm?.(false);
        setEditing(null);
      }
    }

    if (showForm || showCategoryForm) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }

    return undefined;
  }, [showForm, showCategoryForm, setShowCategoryForm]);

  useEffect(() => {
    if (status === 'idle') void dispatch(fetchTasks());
  }, [status, dispatch]);

  return (
    <section id="task-list">
      <div className="header">
        <h2>Tasks</h2>
        <div className="controls">
          <label>Filter:</label>
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value as Filter); }}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>

          <label>Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as 'due' | 'created'); }}>
            <option value="created">Creation date</option>
            <option value="due">Due date</option>
          </select>

          <div className="spacer" />
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}>
              Create Task
          </button>
          <button
            onClick={() => { setShowCategoryForm?.(true); onOpenCategoryForm?.(); }}>
              Create Category
          </button>
        </div>
      </div>

      <div className="task-data">
        {status === 'loading' && <div>Loading...</div>}
        {Array.from(grouped.entries()).map(([categoryId, items]) => (
          <div key={String(categoryId)} className="task-group">
            <h3>{categoryId === null ? 'Uncategorized' : (categoryMap.get(categoryId) ?? `Category ${categoryId}`)}</h3>
            <div className="task-items">
              {items.map((t) => (
                <div key={t.id} className="task-item">
                  <div>
                    <strong>{t.title}</strong> {t.completed ? '(done)' : ''}
                    <div className='muted'>
                      {t.description}
                    </div>
                    <div className='muted due'>
                      Due: {formatDateLocal(t.due_date)}
                    </div>
                  </div>
                  <div className="card-actions">
                    <button onClick={() => { setEditing(t); setShowForm(true); }}>Edit</button>
                    <button onClick={() => void dispatch(deleteTask(t.id))}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        className={`dialog-backdrop ${showForm || showCategoryForm ? 'visible' : ''}`}
        onClick={() => { setEditing(null); setShowForm(false); setShowCategoryForm?.(false); }}
      >
        <div
          className={`form-dialog ${showForm || showCategoryForm ? 'visible' : ''}`}
          onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
        >
          <div>
            <h3>
              {showCategoryForm
                ? 'Create Category'
                : (editing ? 'Edit Task' : 'Create Task')}
            </h3>
          </div>
          <button
            className="dialog-close"
            aria-label="Close dialog"
            onClick={() => {
              setEditing(null);
              setShowForm(false);
              setShowCategoryForm?.(false);
            }}
          >
            ×
          </button>

          <div>
            {showCategoryForm ? (
              <CategoryForm
                autoFocus={showCategoryForm}
                onDone={() => { setShowCategoryForm?.(false); }}
              />
            ) : (
              <TaskForm
                autoFocus={showForm}
                task={editing}
                onDone={() => { setEditing(null); setShowForm(false); }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

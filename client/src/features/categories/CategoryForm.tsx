import { useEffect, useRef, useState } from 'react';
import { useCreateCategoryMutation, useGetCategoriesQuery } from '@/services/api';
import './CategoryForm.scss';

interface CategoryFormProps {
  onDone?: () => void;
  autoFocus?: boolean;
}

const MAX_CATEGORY_LEN = 255;

export default function CategoryForm({
  onDone,
  autoFocus,
}: CategoryFormProps) : React.ReactElement {
  const [createCategory] = useCreateCategoryMutation();
  const [name, setName] = useState('');
  const nameRef = useRef<HTMLInputElement | null>(null);
  const { data: categories = [] } = useGetCategoriesQuery(undefined);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  useEffect(() => {
    if (autoFocus) nameRef.current?.focus();
  }, [autoFocus]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError('Name is required');
      return;
    } else if (trimmed.length > MAX_CATEGORY_LEN) {
      setError(`Name must be ${MAX_CATEGORY_LEN} characters or less`);
      return;
    } else if (categories.some((c) => c.category.toLowerCase() === trimmed.toLowerCase())) {
      setError('Category name already exists');
      return;
    }

    try {
      await createCategory({ category: trimmed }).unwrap();
      setName('');
      setError(null);
      onDone?.();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) setError(err.message);
      else setError('Could not create category');
    }
  }

  return (
    <form id="category-form" onSubmit={(e) => { void submit(e); }}>
      <input
        ref={nameRef}
        placeholder="New category"
        value={name}
        onChange={handleNameChange}
        required
        aria-invalid={Boolean(error)}
      />
      {error && <div className='error'>{error}</div>}

      <div className='button-row'>
        <button
          className="primary"
          type="submit"
          disabled={Boolean(error) || !name.trim()}
        >
          Create
        </button>
      </div>
    </form>
  );
}

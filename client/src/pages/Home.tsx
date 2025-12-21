import TaskList from '../features/tasks/TaskList';
import React from 'react';
import './Home.scss';

export default function Home() {
  const [showCategoryForm, setShowCategoryForm] = React.useState(false);

  return (
    <div id='home'>
      <h1>Tada</h1>
      <main>
        <TaskList showCategoryForm={showCategoryForm} setShowCategoryForm={setShowCategoryForm} />
      </main>
    </div>
  );
}

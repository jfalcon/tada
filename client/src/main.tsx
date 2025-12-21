import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from '@/App.tsx';
import { store } from '@/store.ts';
import '@/main.scss';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found.');

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);

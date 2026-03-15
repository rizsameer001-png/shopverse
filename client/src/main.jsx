import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { injectStore } from './utils/api';
import { SettingsProvider } from './context/SettingsContext';
import App from './App';
import './index.css';

injectStore(store);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

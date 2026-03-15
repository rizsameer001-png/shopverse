import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, setAdminStore } from './store';
import App from './App';
import './index.css';

// Inject store into the api axios instance BEFORE any component mounts.
// This means every api call — including the very first dashboard fetch
// after login redirect — will have the token in the Authorization header.
setAdminStore(store);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

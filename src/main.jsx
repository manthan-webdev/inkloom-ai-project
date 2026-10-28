import React from 'react';import {createRoot} from 'react-dom/client';import {HashRouter} from 'react-router-dom';
import {AppProvider} from './context/AppContext';import App from './App';import './index.css';
createRoot(document.getElementById('root')).render(<HashRouter><AppProvider><App/></AppProvider></HashRouter>);

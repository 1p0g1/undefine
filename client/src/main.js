import { jsx as _jsx } from "react/jsx-runtime";
/// <reference types="vite/client" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from './components/ThemeProvider';
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(ThemeProvider, { children: _jsx(BrowserRouter, { children: _jsx(App, {}) }) }) }));

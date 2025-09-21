import React from 'react';
import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import AppRouter from './router';
import QueryProvider from './components/QueryProvider';
import { theme } from './theme';
import './App.css';

const App: React.FC = () => {
  return (
    <QueryProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRouter />
      </ThemeProvider>
    </QueryProvider>
  );
};

export default App;

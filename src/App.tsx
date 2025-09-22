import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200 flex flex-col items-center justify-center">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">Welcome to My App</h1>
        </header>
        <main className="text-lg text-center">
          <p>This is a simple React app with theme switching.</p>
          <p className="mt-4">Current theme is managed by the toggle below.</p>
        </main>
        <div className="mt-8">
          <ThemeToggle />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;

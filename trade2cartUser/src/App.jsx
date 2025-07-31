import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Splash from './components/Splash';
import LanguageSelection from './components/LanguageSelection';
import LocationPage from './components/LocationPage';
import LoginPage from './components/LoginPage';
import HelloUser from './components/HelloUser';
import TradePage from './components/TradePage';
import { Toaster } from 'react-hot-toast';
import TaskPage from './components/TaskPage';

const App = () => {
  const [screen, setScreen] = useState('splash');
  const [language, setLanguage] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setScreen('language'), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route
          path="/"
          element={
            screen === 'splash' ? (
              <Splash />
            ) : screen === 'language' ? (
              <LanguageSelection
                onSelectLanguage={(lang) => {
                  setLanguage(lang);
                  setScreen('location');
                }}
              />
            ) : screen === 'location' ? (
              <LocationPage
                onSelectLocation={(loc) => {
                  setLocation(loc);
                  setScreen('login');
                }}
              />
            ) : (
              <LoginPage
                onLoginSuccess={() => {}}
                language={language}
                location={location}
              />
            )
          }
        />
        <Route
          path="/hello"
          element={<HelloUser language={language} location={location} />}
        />
        <Route path="/trade" element={<TradePage />} />
        <Route path="/task" element={<TaskPage />} />

      </Routes>
    </Router>
  );
};

export default App;

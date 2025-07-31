import React from 'react';
import '../assets/style/LanguageSelection.css';

const LanguageSelection = ({ onSelectLanguage }) => {
  return (
    <div className="language-selection">
      <h2>Choose your Language</h2>
      <div className="language-btn" onClick={() => onSelectLanguage('English')}>🇬🇧 English</div>
      <div className="language-btn" onClick={() => onSelectLanguage('Tamil')}>🇮🇳 தமிழ்</div>
      <div className="language-btn" onClick={() => onSelectLanguage('Hindi')}>🇮🇳 हिन्दी</div>
    </div>
  );
};

export default LanguageSelection;

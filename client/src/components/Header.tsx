import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="app-header">
      <h1 className="app-title">Undefine</h1>
      <nav className="header-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} end>Game</NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Settings</NavLink>
      </nav>
    </header>
  );
};

export default Header; 
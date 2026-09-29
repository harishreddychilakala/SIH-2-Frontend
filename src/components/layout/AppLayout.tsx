import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-container">
      <div className="main-content">
        <Header />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

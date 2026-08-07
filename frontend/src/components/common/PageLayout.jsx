import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function PageLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-govbg">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

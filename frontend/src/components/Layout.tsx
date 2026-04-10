import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Header from './Header';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="page-container animated-bg">
      {/* Decorative orbs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[428px] h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-violet-600/10 blur-[80px]" />
        <div className="absolute top-[40%] left-[-100px] w-[250px] h-[250px] rounded-full bg-blue-600/8 blur-[80px]" />
        <div className="absolute bottom-[20%] right-[-50px] w-[200px] h-[200px] rounded-full bg-amber-500/8 blur-[60px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pb-24 pt-2">
          <Outlet />
        </main>
        {!isAdmin && <BottomNav />}
      </div>
    </div>
  );
};

export default Layout;

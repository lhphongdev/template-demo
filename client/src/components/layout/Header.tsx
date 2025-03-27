import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import AdminLoginModal from '../admin/AdminLoginModal';
import MobileMenu from './MobileMenu';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <a className="font-spaceGrotesk font-bold text-xl tracking-tight">
              Creative<span className="text-[#6366F1]">Portfolio</span>
            </a>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6 ml-8">
            <a href="#" className="text-sm font-medium hover:text-[#6366F1] transition-colors">Home</a>
            <a href="#projects" className="text-sm font-medium hover:text-[#6366F1] transition-colors">Projects</a>
            <a href="#about" className="text-sm font-medium hover:text-[#6366F1] transition-colors">About</a>
            <a href="#contact" className="text-sm font-medium hover:text-[#6366F1] transition-colors">Contact</a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-[#6366F1]" 
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <i className="fas fa-sun text-[#2D2D2D] dark:text-white"></i>
            ) : (
              <i className="fas fa-moon text-[#2D2D2D] dark:text-white"></i>
            )}
          </button>
          
          {/* Admin Button */}
          {isAuthenticated ? (
            <Button 
              variant="default" 
              onClick={logout}
              className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
            >
              Logout
            </Button>
          ) : (
            <Button 
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
            >
              Admin
            </Button>
          )}
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
          >
            <i className="fas fa-bars text-[#2D2D2D] dark:text-white"></i>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
      {/* Admin Login Modal */}
      <AdminLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
};

export default Header;

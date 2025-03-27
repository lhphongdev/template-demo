import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import ProjectsGrid from '@/components/home/ProjectsGrid';
import AboutSection from '@/components/home/AboutSection';
import ContactSection from '@/components/home/ContactSection';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { useAuth } from '@/context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  
  // Open admin dashboard when authenticated and close when logged out
  useEffect(() => {
    if (isAuthenticated) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminDashboardOpen(false);
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Header />
      
      <main className="flex-grow">
        <HeroSection />
        <ProjectsGrid />
        <AboutSection />
        <ContactSection />
      </main>
      
      <Footer />
      
      {/* Admin Dashboard */}
      <AdminDashboard 
        isOpen={isAdminDashboardOpen} 
        onClose={() => setIsAdminDashboardOpen(false)} 
      />
    </div>
  );
};

export default Home;

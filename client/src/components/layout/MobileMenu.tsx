import { Dispatch, SetStateAction } from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const MobileMenu = ({ isOpen, setIsOpen }: MobileMenuProps) => {
  const closeMenu = () => setIsOpen(false);
  
  return (
    <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800`}>
      <div className="container mx-auto px-6 py-3 space-y-2">
        <a href="#" onClick={closeMenu} className="block py-2 text-sm font-medium hover:text-[#6366F1] transition-colors">Home</a>
        <a href="#projects" onClick={closeMenu} className="block py-2 text-sm font-medium hover:text-[#6366F1] transition-colors">Projects</a>
        <a href="#about" onClick={closeMenu} className="block py-2 text-sm font-medium hover:text-[#6366F1] transition-colors">About</a>
        <a href="#contact" onClick={closeMenu} className="block py-2 text-sm font-medium hover:text-[#6366F1] transition-colors">Contact</a>
      </div>
    </div>
  );
};

export default MobileMenu;

import { useState, useEffect } from 'react';
import { Project } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/useProjects';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

const ProjectDetailModal = ({ project, onClose }: ProjectDetailModalProps) => {
  const [currentProject, setCurrentProject] = useState<Project>(project);
  const { data: projects = [] } = useProjects();
  
  // Navigate to previous project
  const navigateToPrevious = () => {
    const currentIndex = projects.findIndex(p => p.id === currentProject.id);
    if (currentIndex > 0) {
      setCurrentProject(projects[currentIndex - 1]);
    }
  };
  
  // Navigate to next project
  const navigateToNext = () => {
    const currentIndex = projects.findIndex(p => p.id === currentProject.id);
    if (currentIndex < projects.length - 1) {
      setCurrentProject(projects[currentIndex + 1]);
    }
  };
  
  // Close modal when ESC key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  // Handle modal click outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto" 
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h3 className="font-spaceGrotesk text-2xl font-bold">{currentProject.title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-8">
            <img 
              src={currentProject.imageUrl}
              alt={currentProject.title}
              className="w-full h-auto rounded-lg mb-6"
            />
            
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-[#6366F1]/10 text-[#6366F1] rounded-full text-xs font-medium">
                {currentProject.category}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Completed: <span>{currentProject.date}</span>
              </span>
            </div>
            
            <div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentProject.description}
              </p>
            </div>
            
            {currentProject.additionalImages && currentProject.additionalImages.length > 0 && (
              <div className="mt-8">
                <h4 className="font-medium text-lg mb-4">Project Gallery</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {currentProject.additionalImages.map((image, index) => (
                    <div key={index} className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
                      <img 
                        src={image}
                        alt={`${currentProject.title} detail ${index + 1}`}
                        className="w-full h-full object-cover object-center cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 p-6 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={navigateToPrevious}
            disabled={projects.findIndex(p => p.id === currentProject.id) === 0}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <i className="fas fa-chevron-left mr-2"></i> Previous
          </Button>
          <Button
            variant="outline"
            onClick={navigateToNext}
            disabled={projects.findIndex(p => p.id === currentProject.id) === projects.length - 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Next <i className="fas fa-chevron-right ml-2"></i>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;

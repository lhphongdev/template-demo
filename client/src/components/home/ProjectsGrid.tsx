import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '../project/ProjectCard';
import ProjectDetailModal from '../project/ProjectDetailModal';
import { useProject } from '@/context/ProjectContext';
import { Skeleton } from '@/components/ui/skeleton';

type Category = 'All' | 'Branding' | 'Photography' | 'Digital Art' | 'Design' | 'UI/UX';

const ProjectsGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const { data: projects = [], isLoading, error } = useProjects();
  const { selectedProject, setSelectedProject } = useProject();
  
  const filteredProjects = selectedCategory === 'All' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);
  
  const categories: Category[] = ['All', 'Branding', 'Photography', 'Digital Art', 'Design', 'UI/UX'];
  
  if (error) {
    return (
      <section id="projects" className="py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
            <h3 className="text-red-600 dark:text-red-400 text-lg font-medium">Error loading projects</h3>
            <p className="mt-2 text-red-500 dark:text-red-300">Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-12 flex-col md:flex-row gap-6 md:gap-0">
          <div>
            <h2 className="font-spaceGrotesk text-2xl md:text-3xl font-bold mb-3">Featured Projects</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">A selection of recent creative work across various mediums and disciplines.</p>
          </div>
          <div className="hidden md:flex gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#6366F1] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Mobile Filter Dropdown */}
        <div className="mb-8 md:hidden">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Masonry Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-900">
                <Skeleton className="aspect-video w-full" />
                <div className="p-6">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        )}
        
        {projects.length > 0 && filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No projects found in this category</h3>
          </div>
        )}
        
        {projects.length > 6 && (
          <div className="mt-12 text-center">
            <button className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-base font-medium rounded-md bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Load More Projects
            </button>
          </div>
        )}
      </div>
      
      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
};

export default ProjectsGrid;

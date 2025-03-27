import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Project } from '@shared/schema';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const { title, description, category, imageUrl } = project;
  
  // Dynamically determine aspect ratio based on index or content type
  const getAspectRatio = () => {
    switch (category) {
      case 'Photography':
        return 'aspect-w-16 aspect-h-9';
      case 'Digital Art':
        return 'aspect-w-1 aspect-h-1';
      case 'UI/UX':
        return 'aspect-w-16 aspect-h-9';
      default:
        return 'aspect-w-16 aspect-h-12';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="group block rounded-lg overflow-hidden shadow-md hover:shadow-xl dark:shadow-gray-800/20 dark:hover:shadow-gray-800/30 transition-all duration-300 bg-white dark:bg-gray-900 cursor-pointer"
    >
      <div className={`${getAspectRatio()} overflow-hidden`}>
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6">
        <span className="text-xs font-medium text-[#6366F1] uppercase tracking-wider">{category}</span>
        <h3 className="mt-2 text-xl font-semibold font-spaceGrotesk">{title}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {description.length > 100 ? `${description.substring(0, 100)}...` : description}
        </p>
      </div>
    </div>
  );
};

export default ProjectCard;

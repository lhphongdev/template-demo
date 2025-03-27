import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const ProjectDetails = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  
  const { data: project, isLoading, error } = useQuery({
    queryKey: [`/api/projects/${id}`],
  });
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Project</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">There was an error loading this project. It might have been deleted or is not available.</p>
            <Button onClick={() => navigate('/')} className="bg-[#6366F1] hover:bg-[#6366F1]/90">
              Return to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-6 py-12">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
            <div className="flex gap-3">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="mb-4"
              >
                <i className="fas fa-arrow-left mr-2"></i> Back to Gallery
              </Button>
              <h1 className="text-3xl md:text-4xl font-bold font-spaceGrotesk">{project?.title}</h1>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <img 
                  src={project?.imageUrl} 
                  alt={project?.title} 
                  className="w-full h-auto rounded-lg mb-6 object-cover"
                />
                
                {project?.additionalImages && project.additionalImages.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-medium mb-4">Project Gallery</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {project.additionalImages.map((image, index) => (
                        <div key={index} className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
                          <img 
                            src={image}
                            alt={`${project.title} detail ${index + 1}`}
                            className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm sticky top-24">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-[#6366F1]/10 text-[#6366F1] rounded-full text-xs font-medium">
                      {project?.category}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Completed: {project?.date}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-medium mb-4">About this project</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {project?.description}
                  </p>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                    <h3 className="text-sm font-medium mb-3">Share this project</h3>
                    <div className="flex gap-3">
                      <a href="#" className="text-gray-600 hover:text-[#6366F1] dark:text-gray-400 dark:hover:text-[#6366F1] transition-colors">
                        <i className="fab fa-twitter text-lg"></i>
                      </a>
                      <a href="#" className="text-gray-600 hover:text-[#6366F1] dark:text-gray-400 dark:hover:text-[#6366F1] transition-colors">
                        <i className="fab fa-facebook text-lg"></i>
                      </a>
                      <a href="#" className="text-gray-600 hover:text-[#6366F1] dark:text-gray-400 dark:hover:text-[#6366F1] transition-colors">
                        <i className="fab fa-linkedin text-lg"></i>
                      </a>
                      <a href="#" className="text-gray-600 hover:text-[#6366F1] dark:text-gray-400 dark:hover:text-[#6366F1] transition-colors">
                        <i className="fab fa-pinterest text-lg"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-16">
              <h2 className="text-2xl font-bold font-spaceGrotesk mb-8">More Projects</h2>
              {/* More projects will be shown here */}
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ProjectDetails;

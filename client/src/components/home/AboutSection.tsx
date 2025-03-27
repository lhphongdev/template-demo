import { useQuery } from '@tanstack/react-query';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';

const AboutSection = () => {
  const { data: aboutContent, isLoading, error } = useQuery({
    queryKey: ['/api/about'],
  });
  
  if (error) {
    return (
      <section id="about" className="py-16 md:py-24 bg-[#F8F8F8] dark:bg-[#2D2D2D]">
        <div className="container mx-auto px-6 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
            <h3 className="text-red-600 dark:text-red-400 text-lg font-medium">Error loading about content</h3>
            <p className="mt-2 text-red-500 dark:text-red-300">Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }
  
  const bioContent = aboutContent?.bio?.split('\n\n') || [];
  
  return (
    <section id="about" className="py-16 md:py-24 bg-[#F8F8F8] dark:bg-[#2D2D2D]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-64 mb-6" />
                <Skeleton className="h-32 w-full mb-6" />
                <Skeleton className="h-32 w-full mb-8" />
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </>
            ) : (
              <>
                <h2 className="font-spaceGrotesk text-2xl md:text-3xl font-bold mb-6">{aboutContent?.title || "About the Creator"}</h2>
                {bioContent.map((paragraph, index) => (
                  <p key={index} className="text-lg mb-6 text-gray-700 dark:text-gray-300">
                    {paragraph}
                  </p>
                ))}
                <div className="flex gap-4">
                  {aboutContent?.socialLinks?.map((link, index) => {
                    const iconClass = [
                      "fab fa-instagram",
                      "fab fa-behance",
                      "fab fa-linkedin-in", 
                      "fab fa-dribbble"
                    ][index % 4];
                    
                    return (
                      <a key={index} href={link} className="text-[#6366F1] hover:text-[#6366F1]/80 transition-colors">
                        <i className={`${iconClass} text-xl`}></i>
                      </a>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          
          <div className="relative">
            {isLoading ? (
              <div className="aspect-w-4 aspect-h-5 rounded-lg overflow-hidden">
                <Skeleton className="w-full h-full" />
              </div>
            ) : (
              <div className="aspect-w-4 aspect-h-5 rounded-lg overflow-hidden">
                <img 
                  src={aboutContent?.imageUrl} 
                  alt="Portrait of the creative professional" 
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}
            <div className="absolute -bottom-6 -right-6 h-48 w-48 bg-[#6366F1]/20 rounded-full blur-xl z-0"></div>
            <div className="absolute -top-6 -left-6 h-24 w-24 bg-[#6366F1]/20 rounded-full blur-xl z-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

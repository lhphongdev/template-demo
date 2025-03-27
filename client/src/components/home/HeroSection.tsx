import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative bg-[#F8F8F8] dark:bg-[#2D2D2D] py-20 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl">
          <h1 className="font-spaceGrotesk text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Showcase your <span className="text-[#6366F1]">creative work</span> with impact
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl">
            A minimal portfolio platform designed to highlight your projects with elegant presentation and seamless management.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#projects">
              <Button className="px-6 py-6 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-medium rounded-md">
                View Projects
              </Button>
            </a>
            <a href="#contact">
              <Button variant="outline" className="px-6 py-6 border border-gray-300 dark:border-gray-700 font-medium">
                Get in Touch
              </Button>
            </a>
          </div>
        </div>
      </div>
      <div className="absolute -right-20 -bottom-20 h-64 w-64 md:h-96 md:w-96 rounded-full bg-[#6366F1]/20 blur-3xl pointer-events-none"></div>
    </section>
  );
};

export default HeroSection;

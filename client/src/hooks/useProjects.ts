import { useQuery } from '@tanstack/react-query';
import { Project } from '@shared/schema';

export function useProjects(category?: string) {
  const queryKey = category 
    ? [`/api/projects?category=${encodeURIComponent(category)}`]
    : ['/api/projects'];
  
  return useQuery<Project[]>({
    queryKey,
  });
}

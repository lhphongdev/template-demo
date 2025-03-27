import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Project, InsertProject } from '@shared/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  category: z.string().min(1, { message: 'Category is required' }),
  imageUrl: z.string().url({ message: 'Please enter a valid image URL' }),
  date: z.string().min(1, { message: 'Date is required' }),
  published: z.boolean().default(true),
  additionalImages: z.array(z.string().url({ message: 'Please enter valid image URLs' })).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminDashboard = ({ isOpen, onClose }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get all projects, including unpublished ones
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
    enabled: isOpen,
  });
  
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/admin/messages'],
    enabled: isOpen && activeTab === 'messages',
  });
  
  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: (newProject: InsertProject) => 
      apiRequest('POST', '/api/projects', newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsAddDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Project created successfully',
        variant: 'default',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    },
  });
  
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, project }: { id: number; project: Partial<InsertProject> }) => 
      apiRequest('PUT', `/api/projects/${id}`, project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Project updated successfully',
        variant: 'default',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive',
      });
    },
  });
  
  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
        variant: 'default',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    },
  });
  
  // Forms
  const addForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      imageUrl: '',
      date: '',
      published: true,
      additionalImages: [],
    },
  });
  
  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      imageUrl: '',
      date: '',
      published: true,
      additionalImages: [],
    },
  });
  
  // Load project data into edit form when selected
  useEffect(() => {
    if (selectedProject && isEditDialogOpen) {
      editForm.reset({
        title: selectedProject.title,
        description: selectedProject.description,
        category: selectedProject.category,
        imageUrl: selectedProject.imageUrl,
        date: selectedProject.date,
        published: selectedProject.published,
        additionalImages: selectedProject.additionalImages || [],
      });
    }
  }, [selectedProject, isEditDialogOpen, editForm]);
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!isAddDialogOpen) {
      addForm.reset();
    }
    if (!isEditDialogOpen) {
      editForm.reset();
    }
  }, [isAddDialogOpen, isEditDialogOpen, addForm, editForm]);
  
  // Submit handlers
  const handleAddSubmit = (data: FormValues) => {
    createProjectMutation.mutate(data);
  };
  
  const handleEditSubmit = (data: FormValues) => {
    if (!selectedProject) return;
    updateProjectMutation.mutate({ id: selectedProject.id, project: data });
  };
  
  const handleDeleteConfirm = () => {
    if (!selectedProject) return;
    deleteProjectMutation.mutate(selectedProject.id);
  };
  
  // Toggle project visibility
  const toggleProjectVisibility = (project: Project) => {
    updateProjectMutation.mutate({
      id: project.id,
      project: { published: !project.published },
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-auto">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-[#2D2D2D] dark:bg-gray-800 text-white h-full flex-shrink-0">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-spaceGrotesk font-bold text-xl">Admin Panel</h2>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-300"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="mt-8">
              <nav className="space-y-2">
                <a 
                  href="#" 
                  onClick={() => setActiveTab('projects')}
                  className={`flex items-center gap-3 p-3 rounded-md ${
                    activeTab === 'projects' 
                      ? 'bg-[#6366F1]/20 hover:bg-[#6366F1]/30' 
                      : 'hover:bg-[#6366F1]/20'
                  } transition-colors`}
                >
                  <i className="fas fa-th-large"></i>
                  <span>Projects</span>
                </a>
                <a 
                  href="#" 
                  onClick={() => setActiveTab('upload')}
                  className={`flex items-center gap-3 p-3 rounded-md ${
                    activeTab === 'upload' 
                      ? 'bg-[#6366F1]/20 hover:bg-[#6366F1]/30' 
                      : 'hover:bg-[#6366F1]/20'
                  } transition-colors`}
                >
                  <i className="fas fa-upload"></i>
                  <span>Upload</span>
                </a>
                <a 
                  href="#" 
                  onClick={() => setActiveTab('messages')}
                  className={`flex items-center gap-3 p-3 rounded-md ${
                    activeTab === 'messages' 
                      ? 'bg-[#6366F1]/20 hover:bg-[#6366F1]/30' 
                      : 'hover:bg-[#6366F1]/20'
                  } transition-colors`}
                >
                  <i className="fas fa-envelope"></i>
                  <span>Messages</span>
                </a>
                <a 
                  href="#" 
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-3 p-3 rounded-md ${
                    activeTab === 'settings' 
                      ? 'bg-[#6366F1]/20 hover:bg-[#6366F1]/30' 
                      : 'hover:bg-[#6366F1]/20'
                  } transition-colors`}
                >
                  <i className="fas fa-cog"></i>
                  <span>Settings</span>
                </a>
              </nav>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-4 pt-4 p-6">
            <button 
              onClick={logout}
              className="flex items-center gap-3 p-3 w-full rounded-md hover:bg-[#6366F1]/20 transition-colors"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-grow p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="projects">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-spaceGrotesk text-2xl font-bold">Manage Projects</h2>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="px-4 py-2 bg-[#6366F1] text-white rounded-md hover:bg-[#6366F1]/90 transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i> Add New Project
                </Button>
              </div>
              
              {/* Project Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                    <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                      <img 
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{project.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          project.published 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {project.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {project.category} • {project.date}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedProject(project);
                              setIsEditDialogOpen(true);
                            }}
                            className="p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#6366F1] dark:hover:text-[#6366F1] transition-colors"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedProject(project);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Visibility:</span>
                          <Switch
                            checked={project.published}
                            onCheckedChange={() => toggleProjectVisibility(project)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {projects.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No projects found</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-500">Click the button above to add your first project.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="upload">
              <div className="max-w-3xl mx-auto">
                <h2 className="font-spaceGrotesk text-2xl font-bold mb-8">Upload New Project</h2>
                
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-6">
                    <FormField
                      control={addForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter project title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. Branding, Photography, UI/UX" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Project description" rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Image URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com/image.jpg" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Completion Date</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. January 2023" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="published"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer">Publish immediately</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => addForm.reset()}>
                        Reset
                      </Button>
                      <Button type="submit" className="bg-[#6366F1] hover:bg-[#6366F1]/90">
                        {createProjectMutation.isPending ? 'Saving...' : 'Save Project'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </TabsContent>
            
            <TabsContent value="messages">
              <h2 className="font-spaceGrotesk text-2xl font-bold mb-8">Messages</h2>
              
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No messages yet</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-500">Messages from the contact form will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">{message.subject}</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        From: {message.name} ({message.email})
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">{message.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings">
              <h2 className="font-spaceGrotesk text-2xl font-bold mb-8">Settings</h2>
              <div className="max-w-3xl">
                <p className="text-gray-600 dark:text-gray-400">
                  Admin settings will be implemented in future versions.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Add Project Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-6">
              <FormField
                control={addForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter project title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Branding, Photography" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completion Date</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. January 2023" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Project description" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/image.jpg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Publish immediately</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#6366F1] hover:bg-[#6366F1]/90">
                  {createProjectMutation.isPending ? 'Saving...' : 'Save Project'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-6">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completion Date</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Published</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#6366F1] hover:bg-[#6366F1]/90">
                  {updateProjectMutation.isPending ? 'Saving...' : 'Update Project'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete the project "{selectedProject?.title}"? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;

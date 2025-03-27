import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AdminLoginModal = ({ isOpen, onClose }: AdminLoginModalProps) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      remember: false,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoggingIn(true);
    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        username: data.username,
        password: data.password,
      });
      
      if (response.ok) {
        login();
        onClose();
        toast({
          title: 'Login successful',
          description: 'You are now logged in as an admin.',
          variant: 'default',
        });
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid username or password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingIn(false);
    }
  }
  
  if (!isOpen) return null;
  
  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4" style={{ marginTop: "50vh" }}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-spaceGrotesk text-xl font-bold">Admin Login</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="admin"
                        className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1]"
                      />
                    </FormControl>
                    <div className="ml-2 font-medium text-sm">Remember me</div>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={isLoggingIn}
                className="w-full px-4 py-3 bg-[#6366F1] text-white font-medium rounded-md hover:bg-[#6366F1]/90 transition-colors"
              >
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </Button>
              
              <div className="text-sm text-center">
                <a href="#" className="text-[#6366F1] hover:text-[#6366F1]/80">Forgot password?</a>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;

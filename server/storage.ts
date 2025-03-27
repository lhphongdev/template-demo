import { 
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  messages, type Message, type InsertMessage,
  aboutContent, type AboutContent, type InsertAboutContent
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;
  getProjectsByCategory(category: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Messages
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // About content
  getAboutContent(): Promise<AboutContent | undefined>;
  updateAboutContent(content: InsertAboutContent): Promise<AboutContent>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projectsStore: Map<number, Project>;
  private messagesStore: Map<number, Message>;
  private aboutContentStore: AboutContent | undefined;
  
  currentUserId: number;
  currentProjectId: number;
  currentMessageId: number;
  
  constructor() {
    this.users = new Map();
    this.projectsStore = new Map();
    this.messagesStore = new Map();
    
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentMessageId = 1;
    
    // Initialize with seed data
    this.initSeedData();
  }
  
  private initSeedData() {
    // Create admin user
    this.createUser({
      username: "admin",
      password: "admin123"
    });
    
    // Create sample projects
    const sampleProjects: InsertProject[] = [
      {
        title: "Lunar Coffee Branding",
        description: "Complete identity design for an artisanal coffee shop focusing on night owl customers.",
        category: "Branding",
        imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
        date: "January 2023",
        published: true,
        additionalImages: [
          "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1616469829581-73993eb86b02?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
        ]
      },
      {
        title: "Urban Geometries",
        description: "A photographic exploration of architectural patterns and urban compositions.",
        category: "Photography",
        imageUrl: "https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
        date: "March 2023",
        published: true,
        additionalImages: [
          "https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1616469829581-73993eb86b02?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
        ]
      },
      {
        title: "Cosmic Explorations",
        description: "Abstract digital artwork exploring space themes and interstellar concepts.",
        category: "Digital Art",
        imageUrl: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
        date: "April 2023",
        published: false,
        additionalImages: [
          "https://images.unsplash.com/photo-1616469829581-73993eb86b02?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
        ]
      },
      {
        title: "Page Turner Series",
        description: "Cover design collection for a bestselling fiction series with cohesive visual language.",
        category: "Design",
        imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
        date: "February 2023",
        published: true,
        additionalImages: [
          "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
        ]
      },
      {
        title: "Human Expression",
        description: "Intimate portrait series capturing authentic emotional states and expressions.",
        category: "Photography",
        imageUrl: "https://images.unsplash.com/photo-1541512416146-3ae85661a782?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
        date: "May 2023",
        published: true,
        additionalImages: [
          "https://images.unsplash.com/photo-1541512416146-3ae85661a782?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
        ]
      },
      {
        title: "Mindful App Design",
        description: "Interface design for a meditation and mindfulness mobile application with minimal aesthetics.",
        category: "UI/UX",
        imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
        date: "June 2023",
        published: true,
        additionalImages: [
          "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
        ]
      }
    ];
    
    sampleProjects.forEach(project => this.createProject(project));
    
    // Create initial about content
    this.aboutContentStore = {
      id: 1,
      title: "About the Creator",
      bio: "I'm a multidisciplinary creative professional with over 8 years of experience across branding, photography, and digital art. My work focuses on finding the intersection between aesthetic appeal and functional design.\n\nEach project is approached as a unique opportunity to solve problems and create meaningful experiences that resonate with audiences and achieve client objectives.",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      socialLinks: [
        "https://instagram.com",
        "https://behance.net",
        "https://linkedin.com",
        "https://dribbble.com"
      ]
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Project methods
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projectsStore.values());
  }
  
  async getProjectById(id: number): Promise<Project | undefined> {
    return this.projectsStore.get(id);
  }
  
  async getProjectsByCategory(category: string): Promise<Project[]> {
    return Array.from(this.projectsStore.values()).filter(
      project => project.category === category
    );
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const newProject: Project = { ...project, id };
    this.projectsStore.set(id, newProject);
    return newProject;
  }
  
  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = this.projectsStore.get(id);
    if (!existingProject) return undefined;
    
    const updatedProject = { ...existingProject, ...project };
    this.projectsStore.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    return this.projectsStore.delete(id);
  }
  
  // Message methods
  async getMessages(): Promise<Message[]> {
    return Array.from(this.messagesStore.values());
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const newMessage: Message = { 
      ...message, 
      id, 
      createdAt: new Date() 
    };
    this.messagesStore.set(id, newMessage);
    return newMessage;
  }
  
  // About content methods
  async getAboutContent(): Promise<AboutContent | undefined> {
    return this.aboutContentStore;
  }
  
  async updateAboutContent(content: InsertAboutContent): Promise<AboutContent> {
    if (this.aboutContentStore) {
      this.aboutContentStore = { ...this.aboutContentStore, ...content };
    } else {
      this.aboutContentStore = { ...content, id: 1 };
    }
    return this.aboutContentStore;
  }
}

export const storage = new MemStorage();

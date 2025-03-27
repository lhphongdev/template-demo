import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { pgStorage as storage } from "./pg-storage";
import { 
  insertUserSchema, 
  insertProjectSchema, 
  insertMessageSchema, 
  insertAboutContentSchema 
} from "@shared/schema";
import { z } from "zod";
import session from "express-session";

// Extend Express Request type to include our session properties
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Create a session (simplified for this example)
      req.session!.userId = user.id;
      
      return res.status(200).json({ 
        message: "Login successful",
        user: { id: user.id, username: user.username }
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Error logging out" });
        }
        return res.status(200).json({ message: "Logout successful" });
      });
    } else {
      return res.status(200).json({ message: "Logout successful" });
    }
  });
  
  app.get("/api/auth/status", (req: Request, res: Response) => {
    if (req.session && req.session.userId) {
      return res.status(200).json({ isAuthenticated: true });
    }
    return res.status(200).json({ isAuthenticated: false });
  });
  
  // Project routes
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      let projects;
      
      if (category) {
        projects = await storage.getProjectsByCategory(category);
      } else {
        projects = await storage.getProjects();
      }
      
      // Filter out unpublished projects if not authenticated
      if (!req.session || !req.session.userId) {
        projects = projects.filter(project => project.published);
      }
      
      return res.status(200).json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      return res.status(500).json({ message: "Error fetching projects" });
    }
  });
  
  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProjectById(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if project is published or user is authenticated
      if (!project.published && (!req.session || !req.session.userId)) {
        return res.status(403).json({ message: "Unauthorized access to unpublished project" });
      }
      
      return res.status(200).json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      return res.status(500).json({ message: "Error fetching project" });
    }
  });
  
  // Protected routes - require authentication
  const requireAuth = (req: Request, res: Response, next: () => void) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
  
  app.post("/api/projects", requireAuth, async (req: Request, res: Response) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      return res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error creating project:", error);
      return res.status(500).json({ message: "Error creating project" });
    }
  });
  
  app.put("/api/projects/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Partial validation for update
      const projectData = req.body;
      const project = await storage.updateProject(id, projectData);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      return res.status(200).json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      return res.status(500).json({ message: "Error updating project" });
    }
  });
  
  app.delete("/api/projects/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const success = await storage.deleteProject(id);
      
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      return res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      return res.status(500).json({ message: "Error deleting project" });
    }
  });
  
  // Contact form submission
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      return res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      console.error("Error sending message:", error);
      return res.status(500).json({ message: "Error sending message" });
    }
  });
  
  // About content routes
  app.get("/api/about", async (req: Request, res: Response) => {
    try {
      const aboutContent = await storage.getAboutContent();
      
      if (!aboutContent) {
        return res.status(404).json({ message: "About content not found" });
      }
      
      return res.status(200).json(aboutContent);
    } catch (error) {
      console.error("Error fetching about content:", error);
      return res.status(500).json({ message: "Error fetching about content" });
    }
  });
  
  app.put("/api/about", requireAuth, async (req: Request, res: Response) => {
    try {
      const contentData = insertAboutContentSchema.parse(req.body);
      const aboutContent = await storage.updateAboutContent(contentData);
      return res.status(200).json(aboutContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid about content data", errors: error.errors });
      }
      console.error("Error updating about content:", error);
      return res.status(500).json({ message: "Error updating about content" });
    }
  });
  
  // Admin routes
  app.get("/api/admin/messages", requireAuth, async (req: Request, res: Response) => {
    try {
      const messages = await storage.getMessages();
      return res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ message: "Error fetching messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

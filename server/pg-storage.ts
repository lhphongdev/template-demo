import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Pool } = pg;
import { IStorage } from "./storage";
import { 
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  messages, type Message, type InsertMessage,
  aboutContent, type AboutContent, type InsertAboutContent,
  insertUserSchema, insertProjectSchema, insertMessageSchema, insertAboutContentSchema
} from "@shared/schema";
import { eq } from "drizzle-orm";

import * as dotenv from 'dotenv';

dotenv.config();

// Check if we have database URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Drizzle client
const db = drizzle(pool);

export class PgStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results.length > 0 ? results[0] : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const validated = insertUserSchema.parse(user);
    const results = await db.insert(users).values(validated).returning();
    return results[0];
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    const results = await db.select().from(projects).where(eq(projects.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getProjectsByCategory(category: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.category, category));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const validated = insertProjectSchema.parse(project);
    const results = await db.insert(projects).values(validated).returning();
    return results[0];
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    // Validate the fields that are present
    const results = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    
    return results.length > 0 ? results[0] : undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
    return result.length > 0;
  }

  // Messages
  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const validated = insertMessageSchema.parse(message);
    const results = await db.insert(messages).values(validated).returning();
    return results[0];
  }

  // About content
  async getAboutContent(): Promise<AboutContent | undefined> {
    const results = await db.select().from(aboutContent);
    return results.length > 0 ? results[0] : undefined;
  }

  async updateAboutContent(content: InsertAboutContent): Promise<AboutContent> {
    // Check if any about content exists
    const existing = await this.getAboutContent();
    
    if (existing) {
      // Update existing record
      const results = await db
        .update(aboutContent)
        .set(content)
        .where(eq(aboutContent.id, existing.id))
        .returning();
      
      return results[0];
    } else {
      // Create new record
      const validated = insertAboutContentSchema.parse(content);
      const results = await db.insert(aboutContent).values(validated).returning();
      return results[0];
    }
  }

  // Initialize database with seed data
  async initSeedData() {
    // Check if we already have users
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length === 0) {
      // Create admin user
      await this.createUser({
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
      
      for (const project of sampleProjects) {
        await this.createProject(project);
      }
      
      // Create initial about content
      await this.updateAboutContent({
        title: "About the Creator",
        bio: "I'm a multidisciplinary creative professional with over 8 years of experience across branding, photography, and digital art. My work focuses on finding the intersection between aesthetic appeal and functional design.\n\nEach project is approached as a unique opportunity to solve problems and create meaningful experiences that resonate with audiences and achieve client objectives.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
        socialLinks: [
          "https://instagram.com",
          "https://behance.net",
          "https://linkedin.com",
          "https://dribbble.com"
        ]
      });
    }
  }
}

export const pgStorage = new PgStorage();
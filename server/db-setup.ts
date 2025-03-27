import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
const { Pool } = pg;
import { users, projects, messages, aboutContent } from "@shared/schema";
import { pgStorage } from "./pg-storage";

import * as dotenv from 'dotenv';

dotenv.config();

// Check if we have database URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

async function setup() {
  // Create connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  console.log("Setting up database...");
  
  try {
    // Create schema
    await db.execute(`CREATE SCHEMA IF NOT EXISTS public`);
    
    // Create tables
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT NOT NULL,
        date TEXT NOT NULL,
        published BOOLEAN DEFAULT TRUE,
        additional_images TEXT[]
      );
      
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS about_content (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        bio TEXT NOT NULL,
        image_url TEXT NOT NULL,
        social_links TEXT[]
      );
    `);
    
    console.log("Database tables created successfully");
    
    // Seed initial data
    await pgStorage.initSeedData();
    console.log("Initial data seeded successfully");
    
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run setup if this file is executed directly
// In ESM, we can't use require.main === module, but we can check import.meta.url
if (import.meta.url === `file://${process.argv[1]}`) {
  setup()
    .then(() => {
      console.log("Database setup completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database setup failed:", error);
      process.exit(1);
    });
}

export { setup };
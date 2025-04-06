import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (keeping for future use if auth is needed)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Sheet Music table
export const sheetMusic = pgTable("sheet_music", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  genre: text("genre").notNull(),
  pages: integer("pages").notNull().default(1),
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  fileType: text("file_type").notNull(), // "pdf" or "image"
  fileData: text("file_data").notNull(), // base64 encoded file
  isFavorite: boolean("is_favorite").notNull().default(false),
});

export const insertSheetMusicSchema = createInsertSchema(sheetMusic).omit({
  id: true,
  uploadDate: true,
});

// Setlist table
export const setlists = pgTable("setlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSetlistSchema = createInsertSchema(setlists).omit({
  id: true,
  createdAt: true,
});

// Setlist items table (junction between setlists and sheet music)
export const setlistItems = pgTable("setlist_items", {
  id: serial("id").primaryKey(),
  setlistId: integer("setlist_id")
    .references(() => setlists.id, { onDelete: "cascade" })
    .notNull(),
  sheetMusicId: integer("sheet_music_id")
    .references(() => sheetMusic.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull(),
});

export const insertSetlistItemSchema = createInsertSchema(setlistItems).omit({
  id: true,
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  darkMode: boolean("dark_mode").notNull().default(false),
  defaultZoom: integer("default_zoom").notNull().default(100),
  defaultScrollSpeed: integer("default_scroll_speed").notNull().default(5),
  defaultBrightness: integer("default_brightness").notNull().default(100),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SheetMusic = typeof sheetMusic.$inferSelect;
export type InsertSheetMusic = z.infer<typeof insertSheetMusicSchema>;

export type Setlist = typeof setlists.$inferSelect;
export type InsertSetlist = z.infer<typeof insertSetlistSchema>;

export type SetlistItem = typeof setlistItems.$inferSelect;
export type InsertSetlistItem = z.infer<typeof insertSetlistItemSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import {
  insertSheetMusicSchema,
  insertSetlistSchema,
  insertSetlistItemSchema,
  type SheetMusic,
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// Setup multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for sheet music
  app.get("/api/sheets", async (req: Request, res: Response) => {
    try {
      const sheets = await storage.getAllSheetMusic();
      res.json(sheets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sheet music" });
    }
  });

  app.get("/api/sheets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid sheet music ID" });
      }

      const sheet = await storage.getSheetMusic(id);
      if (!sheet) {
        return res.status(404).json({ message: "Sheet music not found" });
      }

      res.json(sheet);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sheet music" });
    }
  });

  app.post(
    "/api/sheets",
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        // Get file type from mimetype
        const fileType = req.file.mimetype.startsWith("application/pdf")
          ? "pdf"
          : "image";

        // Convert file to base64
        const fileData = req.file.buffer.toString("base64");

        // Validate and process form data
        const validationResult = insertSheetMusicSchema.safeParse({
          ...req.body,
          fileType,
          fileData,
          userId: 1, // Default user ID for now
          pages: parseInt(req.body.pages) || 1,
        });

        if (!validationResult.success) {
          const validationError = fromZodError(validationResult.error);
          return res.status(400).json({ message: validationError.message });
        }

        const newSheet = await storage.createSheetMusic(validationResult.data);
        res.status(201).json(newSheet);
      } catch (error) {
        console.error("Error uploading sheet music:", error);
        res.status(500).json({ message: "Failed to upload sheet music" });
      }
    }
  );

  app.patch("/api/sheets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid sheet music ID" });
      }

      const sheet = await storage.getSheetMusic(id);
      if (!sheet) {
        return res.status(404).json({ message: "Sheet music not found" });
      }

      // Only allow updating certain fields
      const updateData: Partial<SheetMusic> = {};
      if (req.body.title) updateData.title = req.body.title;
      if (req.body.artist) updateData.artist = req.body.artist;
      if (req.body.genre) updateData.genre = req.body.genre;
      if (req.body.isFavorite !== undefined)
        updateData.isFavorite = req.body.isFavorite;

      const updatedSheet = await storage.updateSheetMusic(id, updateData);
      res.json(updatedSheet);
    } catch (error) {
      res.status(500).json({ message: "Failed to update sheet music" });
    }
  });

  app.delete("/api/sheets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid sheet music ID" });
      }

      const sheet = await storage.getSheetMusic(id);
      if (!sheet) {
        return res.status(404).json({ message: "Sheet music not found" });
      }

      await storage.deleteSheetMusic(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sheet music" });
    }
  });

  // API routes for setlists
  app.get("/api/setlists", async (req: Request, res: Response) => {
    try {
      const setlists = await storage.getAllSetlists();
      res.json(setlists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch setlists" });
    }
  });

  app.get("/api/setlists/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid setlist ID" });
      }

      const setlist = await storage.getSetlist(id);
      if (!setlist) {
        return res.status(404).json({ message: "Setlist not found" });
      }

      // Get all sheets in the setlist
      const items = await storage.getSetlistItems(id);

      res.json({
        ...setlist,
        items,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch setlist" });
    }
  });

  app.post("/api/setlists", async (req: Request, res: Response) => {
    try {
      const validationResult = insertSetlistSchema.safeParse({
        ...req.body,
        userId: 1, // Default user ID for now
      });

      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ message: validationError.message });
      }

      const newSetlist = await storage.createSetlist(validationResult.data);
      res.status(201).json(newSetlist);
    } catch (error) {
      res.status(500).json({ message: "Failed to create setlist" });
    }
  });

  app.patch("/api/setlists/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid setlist ID" });
      }

      const setlist = await storage.getSetlist(id);
      if (!setlist) {
        return res.status(404).json({ message: "Setlist not found" });
      }

      const updatedSetlist = await storage.updateSetlist(id, req.body);
      res.json(updatedSetlist);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setlist" });
    }
  });

  app.delete("/api/setlists/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid setlist ID" });
      }

      const setlist = await storage.getSetlist(id);
      if (!setlist) {
        return res.status(404).json({ message: "Setlist not found" });
      }

      await storage.deleteSetlist(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete setlist" });
    }
  });

  // API routes for setlist items
  app.post("/api/setlists/:id/items", async (req: Request, res: Response) => {
    try {
      const setlistId = parseInt(req.params.id);
      if (isNaN(setlistId)) {
        return res.status(400).json({ message: "Invalid setlist ID" });
      }

      const setlist = await storage.getSetlist(setlistId);
      if (!setlist) {
        return res.status(404).json({ message: "Setlist not found" });
      }

      // Get current items to determine the next order
      const items = await storage.getSetlistItems(setlistId);
      const nextOrder = items.length;

      const validationResult = insertSetlistItemSchema.safeParse({
        setlistId,
        sheetMusicId: req.body.sheetMusicId,
        order: nextOrder,
      });

      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ message: validationError.message });
      }

      // Check if sheet music exists
      const sheet = await storage.getSheetMusic(req.body.sheetMusicId);
      if (!sheet) {
        return res.status(404).json({ message: "Sheet music not found" });
      }

      const newItem = await storage.addSheetToSetlist(validationResult.data);
      res.status(201).json({
        ...newItem,
        sheet,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to add sheet to setlist" });
    }
  });

  app.delete(
    "/api/setlists/:setlistId/items/:sheetId",
    async (req: Request, res: Response) => {
      try {
        const setlistId = parseInt(req.params.setlistId);
        const sheetId = parseInt(req.params.sheetId);

        if (isNaN(setlistId) || isNaN(sheetId)) {
          return res.status(400).json({ message: "Invalid IDs" });
        }

        const success = await storage.removeSheetFromSetlist(setlistId, sheetId);
        if (!success) {
          return res
            .status(404)
            .json({ message: "Sheet music not found in setlist" });
        }

        res.status(204).send();
      } catch (error) {
        res
          .status(500)
          .json({ message: "Failed to remove sheet from setlist" });
      }
    }
  );

  app.patch(
    "/api/setlists/:setlistId/items/:sheetId",
    async (req: Request, res: Response) => {
      try {
        const setlistId = parseInt(req.params.setlistId);
        const sheetId = parseInt(req.params.sheetId);
        const newOrder = parseInt(req.body.order);

        if (isNaN(setlistId) || isNaN(sheetId) || isNaN(newOrder)) {
          return res.status(400).json({ message: "Invalid parameters" });
        }

        const success = await storage.reorderSetlistItem(
          setlistId,
          sheetId,
          newOrder
        );
        if (!success) {
          return res
            .status(404)
            .json({ message: "Sheet music not found in setlist" });
        }

        // Return updated items
        const items = await storage.getSetlistItems(setlistId);
        res.json(items);
      } catch (error) {
        res.status(500).json({ message: "Failed to reorder setlist item" });
      }
    }
  );

  // API routes for settings
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      // Using default user ID for now
      const userId = 1;
      let settings = await storage.getSettings(userId);

      // If no settings exist, create default settings
      if (!settings) {
        settings = await storage.updateSettings(userId, {});
      }

      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", async (req: Request, res: Response) => {
    try {
      // Using default user ID for now
      const userId = 1;

      // Validate settings data
      const validationSchema = z.object({
        darkMode: z.boolean().optional(),
        defaultZoom: z.number().min(50).max(200).optional(),
        defaultScrollSpeed: z.number().min(1).max(10).optional(),
        defaultBrightness: z.number().min(0).max(100).optional(),
      });

      const validationResult = validationSchema.safeParse(req.body);

      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ message: validationError.message });
      }

      const updatedSettings = await storage.updateSettings(
        userId,
        validationResult.data
      );
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

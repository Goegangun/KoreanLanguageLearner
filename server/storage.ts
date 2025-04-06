import {
  users,
  sheetMusic,
  setlists,
  setlistItems,
  settings,
  type User,
  type InsertUser,
  type SheetMusic,
  type InsertSheetMusic,
  type Setlist,
  type InsertSetlist,
  type SetlistItem,
  type InsertSetlistItem,
  type Settings,
  type InsertSettings,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Sheet music operations
  getAllSheetMusic(): Promise<SheetMusic[]>;
  getSheetMusic(id: number): Promise<SheetMusic | undefined>;
  createSheetMusic(sheet: InsertSheetMusic): Promise<SheetMusic>;
  updateSheetMusic(id: number, sheet: Partial<SheetMusic>): Promise<SheetMusic | undefined>;
  deleteSheetMusic(id: number): Promise<boolean>;
  
  // Setlist operations
  getAllSetlists(): Promise<Setlist[]>;
  getSetlist(id: number): Promise<Setlist | undefined>;
  createSetlist(setlist: InsertSetlist): Promise<Setlist>;
  updateSetlist(id: number, setlist: Partial<Setlist>): Promise<Setlist | undefined>;
  deleteSetlist(id: number): Promise<boolean>;
  
  // Setlist item operations
  getSetlistItems(setlistId: number): Promise<(SetlistItem & { sheet: SheetMusic })[]>;
  addSheetToSetlist(item: InsertSetlistItem): Promise<SetlistItem>;
  removeSheetFromSetlist(setlistId: number, sheetMusicId: number): Promise<boolean>;
  reorderSetlistItem(setlistId: number, sheetMusicId: number, newOrder: number): Promise<boolean>;
  
  // Settings operations
  getSettings(userId: number): Promise<Settings | undefined>;
  updateSettings(userId: number, newSettings: Partial<Settings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sheetMusic: Map<number, SheetMusic>;
  private setlists: Map<number, Setlist>;
  private setlistItems: Map<number, SetlistItem>;
  private settings: Map<number, Settings>;
  
  private currentUserId: number;
  private currentSheetMusicId: number;
  private currentSetlistId: number;
  private currentSetlistItemId: number;
  private currentSettingsId: number;

  constructor() {
    this.users = new Map();
    this.sheetMusic = new Map();
    this.setlists = new Map();
    this.setlistItems = new Map();
    this.settings = new Map();
    
    this.currentUserId = 1;
    this.currentSheetMusicId = 1;
    this.currentSetlistId = 1;
    this.currentSetlistItemId = 1;
    this.currentSettingsId = 1;
    
    // Create a default user for demo
    this.createUser({
      username: "demo",
      password: "password",
    });
    
    // Add sample sheet music for testing
    const samplePdfBase64 = "JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDEgMCBSIC9MYXN0TW9kaWZpZWQgKEQ6MjAyMzAxMjUxMzU1MDErMDAnMDAnKSAvUmVzb3VyY2VzIDIgMCBSIC9NZWRpYUJveCBbMC4wMDAwMDAgMC4wMDAwMDAgNTk1LjI3NjAwMCA4NDEuODkwMDAwXSAvQ3JvcEJveCBbMC4wMDAwMDAgMC4wMDAwMDAgNTk1LjI3NjAwMCA4NDEuODkwMDAwXSAvQmxlZWRCb3ggWzAuMDAwMDAwIDAuMDAwMDAwIDU5NS4yNzYwMDAgODQxLjg5MDAwMF0gL1RyaW1Cb3ggWzAuMDAwMDAwIDAuMDAwMDAwIDU5NS4yNzYwMDAgODQxLjg5MDAwMF0gL0FydEJveCBbMC4wMDAwMDAgMC4wMDAwMDAgNTk1LjI3NjAwMCA4NDEuODkwMDAwXSAvQ29udGVudHMgNiAwIFIgL1JvdGF0ZSAwIC9Hcm91cCA8PCAvVHlwZSAvR3JvdXAgL1MgL1RyYW5zcGFyZW5jeSAvQ1MgL0RldmljZVJHQiA+PiAvQW5ub3RzIFsgXSAvUERGQSAxID4+CmVuZG9iago2IDAgb2JqCjw8IC9GaWx0ZXIgL0ZsYXRlRGVjb2RlIC9MZW5ndGggMTc0ID4+CnN0cmVhbQp4nJXOvQoCMRAE4P1gud7Z7P7k7vUCKytrQbxGsPMLhCtt1FZfX5F4hfgANjbDxwwRZqb2SCwVBuIRbwEzr/NCsNIZ7jAR1VIjWqo7H51GtOFYmVhb1CvGXKYF+TWZZ61vnQ5p3/Pme2+hOywDDs6cQGpRl1iqd5RDTy5GZ6YO+4m+k3+JO30LJ/3r9wuAuSktCmVuZHN0cmVhbQplbmRvYmoKMSAwIG9iago8PCAvVHlwZSAvUGFnZXMgL0tpZHMgWyA1IDAgUiBdIC9Db3VudCAxID4+CmVuZG9iagozIDAgb2JqCjw8IC9UeXBlIC9GaW5uLXhQREYgL0NyZWF0aW9uRGF0ZSAoRDoyMDIzMDEyNTEzNTUwMSswMCcwMCcpIC9NZXRhZGF0YSA0IDAgUiA+PgplbmRvYmoKNCAwIG9iago8PCAvTGVuZ3RoIDc3OCAvVHlwZSAvTWV0YWRhdGEgL1R5cGUgL01ldGFkYXRhIC9TdWJ0eXBlIC9YTUwgPj4Kc3RyZWFtCjw/eHBhY2tldCBiZWdpbj0n77u/JyBpZD0nVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkJz8+CjxIOpYAlkBDAuQP+tF4YRAmNSDAhOA==";
    
    this.createSheetMusic({
      title: "모래 위에 성 (Castle on the Sand)",
      artist: "더 플레이버스 (The Flavors)",
      uploadDate: new Date(),
      fileData: samplePdfBase64,
      fileType: "application/pdf",
      tags: ["Pop", "Korean"],
      userId: 1
    });
    
    this.createSheetMusic({
      title: "너의 의미 (Your Meaning)",
      artist: "아이유 (IU)",
      uploadDate: new Date(),
      fileData: samplePdfBase64,
      fileType: "application/pdf",
      tags: ["Ballad", "Korean"],
      userId: 1
    });
    
    this.createSheetMusic({
      title: "Autumn Leaves",
      artist: "Joseph Kosma",
      uploadDate: new Date(),
      fileData: samplePdfBase64,
      fileType: "application/pdf",
      tags: ["Jazz", "Standard"],
      userId: 1
    });
    
    // Create sample setlists
    const setlist1 = this.createSetlist({
      name: "버스킹 세트 1 (Busking Set 1)",
      description: "경복궁 근처 버스킹용 세트리스트",
      userId: 1
    });
    
    // Add sheets to setlist
    this.addSheetToSetlist({
      setlistId: setlist1.id,
      sheetMusicId: 1,
      order: 1
    });
    
    this.addSheetToSetlist({
      setlistId: setlist1.id,
      sheetMusicId: 2,
      order: 2
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Sheet music operations
  async getAllSheetMusic(): Promise<SheetMusic[]> {
    return Array.from(this.sheetMusic.values());
  }

  async getSheetMusic(id: number): Promise<SheetMusic | undefined> {
    return this.sheetMusic.get(id);
  }

  async createSheetMusic(sheet: InsertSheetMusic): Promise<SheetMusic> {
    const id = this.currentSheetMusicId++;
    const uploadDate = new Date();
    const newSheet: SheetMusic = { ...sheet, id, uploadDate };
    this.sheetMusic.set(id, newSheet);
    return newSheet;
  }

  async updateSheetMusic(id: number, sheet: Partial<SheetMusic>): Promise<SheetMusic | undefined> {
    const existingSheet = this.sheetMusic.get(id);
    if (!existingSheet) return undefined;
    
    const updatedSheet = { ...existingSheet, ...sheet };
    this.sheetMusic.set(id, updatedSheet);
    return updatedSheet;
  }

  async deleteSheetMusic(id: number): Promise<boolean> {
    return this.sheetMusic.delete(id);
  }

  // Setlist operations
  async getAllSetlists(): Promise<Setlist[]> {
    return Array.from(this.setlists.values());
  }

  async getSetlist(id: number): Promise<Setlist | undefined> {
    return this.setlists.get(id);
  }

  async createSetlist(setlist: InsertSetlist): Promise<Setlist> {
    const id = this.currentSetlistId++;
    const createdAt = new Date();
    const newSetlist: Setlist = { ...setlist, id, createdAt };
    this.setlists.set(id, newSetlist);
    return newSetlist;
  }

  async updateSetlist(id: number, setlist: Partial<Setlist>): Promise<Setlist | undefined> {
    const existingSetlist = this.setlists.get(id);
    if (!existingSetlist) return undefined;
    
    const updatedSetlist = { ...existingSetlist, ...setlist };
    this.setlists.set(id, updatedSetlist);
    return updatedSetlist;
  }

  async deleteSetlist(id: number): Promise<boolean> {
    // Delete all setlist items for this setlist
    Array.from(this.setlistItems.values())
      .filter((item) => item.setlistId === id)
      .forEach((item) => this.setlistItems.delete(item.id));
    
    return this.setlists.delete(id);
  }

  // Setlist item operations
  async getSetlistItems(setlistId: number): Promise<(SetlistItem & { sheet: SheetMusic })[]> {
    const items = Array.from(this.setlistItems.values())
      .filter((item) => item.setlistId === setlistId)
      .sort((a, b) => a.order - b.order);
    
    return items.map((item) => {
      const sheet = this.sheetMusic.get(item.sheetMusicId);
      if (!sheet) {
        throw new Error(`Sheet music with id ${item.sheetMusicId} not found`);
      }
      return { ...item, sheet };
    });
  }

  async addSheetToSetlist(item: InsertSetlistItem): Promise<SetlistItem> {
    const id = this.currentSetlistItemId++;
    const newItem: SetlistItem = { ...item, id };
    this.setlistItems.set(id, newItem);
    return newItem;
  }

  async removeSheetFromSetlist(setlistId: number, sheetMusicId: number): Promise<boolean> {
    const itemToDelete = Array.from(this.setlistItems.values()).find(
      (item) => item.setlistId === setlistId && item.sheetMusicId === sheetMusicId
    );
    
    if (!itemToDelete) return false;
    
    this.setlistItems.delete(itemToDelete.id);
    
    // Reorder remaining items
    const remainingItems = Array.from(this.setlistItems.values())
      .filter((item) => item.setlistId === setlistId)
      .sort((a, b) => a.order - b.order);
    
    remainingItems.forEach((item, index) => {
      this.setlistItems.set(item.id, { ...item, order: index });
    });
    
    return true;
  }

  async reorderSetlistItem(setlistId: number, sheetMusicId: number, newOrder: number): Promise<boolean> {
    const items = Array.from(this.setlistItems.values())
      .filter((item) => item.setlistId === setlistId)
      .sort((a, b) => a.order - b.order);
    
    const itemToMove = items.find((item) => item.sheetMusicId === sheetMusicId);
    if (!itemToMove) return false;
    
    const oldOrder = itemToMove.order;
    if (oldOrder === newOrder) return true;
    
    // Update orders
    items.forEach((item) => {
      let newItemOrder = item.order;
      
      if (oldOrder < newOrder) {
        // Moving down
        if (item.order > oldOrder && item.order <= newOrder) {
          newItemOrder = item.order - 1;
        } else if (item.sheetMusicId === sheetMusicId) {
          newItemOrder = newOrder;
        }
      } else {
        // Moving up
        if (item.order >= newOrder && item.order < oldOrder) {
          newItemOrder = item.order + 1;
        } else if (item.sheetMusicId === sheetMusicId) {
          newItemOrder = newOrder;
        }
      }
      
      this.setlistItems.set(item.id, { ...item, order: newItemOrder });
    });
    
    return true;
  }

  // Settings operations
  async getSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(
      (setting) => setting.userId === userId
    );
  }

  async updateSettings(userId: number, newSettings: Partial<Settings>): Promise<Settings> {
    let setting = await this.getSettings(userId);
    
    if (setting) {
      // Update existing settings
      const updatedSettings = { ...setting, ...newSettings };
      this.settings.set(setting.id, updatedSettings);
      return updatedSettings;
    } else {
      // Create new settings
      const id = this.currentSettingsId++;
      const defaultSettings: Settings = {
        id,
        userId,
        darkMode: false,
        defaultZoom: 100,
        defaultScrollSpeed: 5,
        defaultBrightness: 100,
      };
      
      const newSettingObject = { ...defaultSettings, ...newSettings };
      this.settings.set(id, newSettingObject);
      return newSettingObject;
    }
  }
}

export const storage = new MemStorage();

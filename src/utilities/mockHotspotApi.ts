// Mock API service to simulate database operations for hotspot types
// Since we don't have a backend, this simulates CRUD operations

export interface HotspotType {
  id: number;
  name: string;
  addition: number;
  multiplier: number;
  isActive: boolean;
}

// Simulated database - in a real app, this would be API calls
let mockHotspotTypes: HotspotType[] = [
  {
    id: 1,
    name: "Rush Zone",
    addition: 40,
    multiplier: 1,
    isActive: true,
  },
  {
    id: 2,
    name: "Peak Demand",
    addition: 60,
    multiplier: 1.2,
    isActive: true,
  },
  {
    id: 3,
    name: "Prime Time",
    addition: 80,
    multiplier: 1.5,
    isActive: true,
  },
  {
    id: 4,
    name: "Surge Area",
    addition: 100,
    multiplier: 2,
    isActive: true,
  },
  {
    id: 5,
    name: "Express Zone",
    addition: 50,
    multiplier: 1.3,
    isActive: true,
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const mockHotspotApi = {
  // GET /api/hotspot-types
  async getHotspotTypes(): Promise<HotspotType[]> {
    await delay(300); // Simulate network delay
    return [...mockHotspotTypes];
  },

  // GET /api/hotspot-types/:id
  async getHotspotType(id: number): Promise<HotspotType | null> {
    await delay(200);
    return mockHotspotTypes.find(type => type.id === id) || null;
  },

  // POST /api/hotspot-types
  async createHotspotType(data: Omit<HotspotType, 'id'>): Promise<HotspotType> {
    await delay(400);
    const newId = Math.max(...mockHotspotTypes.map(t => t.id)) + 1;
    const newHotspotType: HotspotType = {
      id: newId,
      ...data,
    };
    mockHotspotTypes.push(newHotspotType);
    return newHotspotType;
  },

  // PUT /api/hotspot-types/:id
  async updateHotspotType(id: number, data: Partial<HotspotType>): Promise<HotspotType | null> {
    await delay(300);
    const index = mockHotspotTypes.findIndex(type => type.id === id);
    if (index === -1) return null;

    mockHotspotTypes[index] = { ...mockHotspotTypes[index], ...data };
    return mockHotspotTypes[index];
  },

  // DELETE /api/hotspot-types/:id
  async deleteHotspotType(id: number): Promise<boolean> {
    await delay(300);
    const index = mockHotspotTypes.findIndex(type => type.id === id);
    if (index === -1) return false;

    mockHotspotTypes.splice(index, 1);
    return true;
  },

  // PATCH /api/hotspot-types/:id/toggle
  async toggleHotspotType(id: number): Promise<HotspotType | null> {
    await delay(200);
    const index = mockHotspotTypes.findIndex(type => type.id === id);
    if (index === -1) return null;

    mockHotspotTypes[index].isActive = !mockHotspotTypes[index].isActive;
    return mockHotspotTypes[index];
  }
};

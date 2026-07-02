import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { Property, Floor, Room, Bed } from '@/types';

export class PropertyService {
  /**
   * Properties APIs
   */
  public static async getProperties(): Promise<Property[]> {
    const response: any = await apiClient.get(API_ENDPOINTS.PROPERTIES.LIST);
    return response.data;
  }

  public static async getPropertyDetail(id: string): Promise<Property | null> {
    const response: any = await apiClient.get(API_ENDPOINTS.PROPERTIES.DETAIL(id));
    return response.data;
  }

  public static async createProperty(payload: Partial<Property>): Promise<Property> {
    const response: any = await apiClient.post(API_ENDPOINTS.PROPERTIES.CREATE, payload);
    return response.data;
  }

  public static async updateProperty(id: string, payload: Partial<Property>): Promise<Property> {
    const response: any = await apiClient.put(API_ENDPOINTS.PROPERTIES.UPDATE(id), payload);
    return response.data;
  }

  public static async uploadImages(id: string, fileUrls: string[]): Promise<Property> {
    const response: any = await apiClient.post(API_ENDPOINTS.PROPERTIES.UPLOAD_IMAGES(id), { fileUrls });
    return response.data;
  }

  public static async uploadSingleImage(id: string, imageUrl: string): Promise<any> {
    const response: any = await apiClient.post(API_ENDPOINTS.PROPERTIES.UPLOAD_IMAGES(id), { imageUrl });
    return response.data;
  }

  public static async deleteImage(id: string, imageId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PROPERTIES.DELETE_IMAGE(id, imageId));
  }

  /**
   * Floor APIs
   */
  public static async addFloor(propertyId: string, name: string): Promise<Floor> {
    const response: any = await apiClient.post(API_ENDPOINTS.FLOORS.CREATE(propertyId), { name });
    return response.data;
  }

  public static async updateFloor(propertyId: string, floorId: string, name: string): Promise<Floor> {
    const response: any = await apiClient.put(API_ENDPOINTS.FLOORS.UPDATE(propertyId, floorId), { name });
    return response.data;
  }

  public static async deleteFloor(propertyId: string, floorId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.FLOORS.DELETE(propertyId, floorId));
  }

  /**
   * Room APIs
   */
  public static async addRoom(floorId: string, payload: Partial<Room>): Promise<Room> {
    const response: any = await apiClient.post(API_ENDPOINTS.ROOMS.CREATE(floorId), payload);
    return response.data;
  }

  public static async updateRoom(roomId: string, payload: Partial<Room>): Promise<Room> {
    const response: any = await apiClient.put(API_ENDPOINTS.ROOMS.UPDATE(roomId), payload);
    return response.data;
  }

  public static async deleteRoom(roomId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ROOMS.DELETE(roomId));
  }

  /**
   * Bed APIs
   */
  public static async addBed(
    roomId: string,
    bedNumber: string,
    payload?: { rent?: number; security_deposit?: number }
  ): Promise<Bed> {
    const response: any = await apiClient.post(API_ENDPOINTS.BEDS.CREATE(roomId), {
      bedNumber,
      ...payload,
    });
    return response.data;
  }

  public static async updateBed(bedId: string, payload: any): Promise<void> {
    await apiClient.put(API_ENDPOINTS.BEDS.UPDATE(bedId), payload);
  }

  public static async updateBedStatus(bedId: string, status: Bed['status']): Promise<void> {
    await this.updateBed(bedId, { status });
  }

  public static async deleteBed(bedId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.BEDS.DELETE(bedId));
  }
}

export default PropertyService;

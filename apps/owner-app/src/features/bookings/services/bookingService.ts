import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { Booking } from '@/types';

export class BookingService {
  public static async getBookings(): Promise<Booking[]> {
    const response: any = await apiClient.get(API_ENDPOINTS.BOOKINGS.LIST);
    return response.data;
  }

  public static async verifyBooking(id: string, status: Booking['status'], remarks?: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.BOOKINGS.VERIFY(id), { status, remarks });
  }
}

export default BookingService;

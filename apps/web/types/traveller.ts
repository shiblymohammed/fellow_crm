export type Gender = 'male' | 'female' | 'other';
export type TravellerType = 'adult' | 'child' | 'infant';

export interface Traveller {
  id: string;
  tenantId: string;
  bookingId: string;
  customerId?: string;
  name: string;
  dateOfBirth?: string;
  gender?: Gender;
  type: TravellerType;
  passportNumber?: string;
  passportExpiry?: string;
  placeOfBirth?: string;
  nationality?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTravellerDto {
  bookingId: string;
  customerId?: string;
  name: string;
  dateOfBirth?: string;
  gender?: Gender;
  type: TravellerType;
  passportNumber?: string;
  passportExpiry?: string;
  placeOfBirth?: string;
  nationality?: string;
}

export interface UpdateTravellerDto {
  customerId?: string;
  name?: string;
  dateOfBirth?: string;
  gender?: Gender;
  type?: TravellerType;
  passportNumber?: string;
  passportExpiry?: string;
  placeOfBirth?: string;
  nationality?: string;
}

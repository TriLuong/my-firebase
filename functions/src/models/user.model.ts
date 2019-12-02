export type Roles = "Admin" | "Driver" | "Rep" | "Truct";

export type DevicePlatform = "Web" | "IOS" | "Android";

export interface IUser {
  name: string;
  role: Roles;
  email: string;
  phone: string;
  truck: boolean;
  available: boolean;
  notes: string;
  truckNumber: string;
  timezone: string;
  id?: string;
  index?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deviceToken?: string;
  devicePlatform?: DevicePlatform;
  longitude?: string;
  latitude?: string;
  address?: string;
  password?: string;
  photoURL?: string;
}

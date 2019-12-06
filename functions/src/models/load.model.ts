export type LoadStatus =
  | "New"
  | "Delivered"
  | "AssignedNotDelivered"
  | "PickedUpNotDelivered";
export type TransitMode = "Intermodal" | "Truckload";
export interface ILoad {
  load: string;
  returnRail: number;
  yarnPull: number;
  loadedRail: number;
  appointmentTime: Date;
  driverId: string;
  repId: string;
  status: LoadStatus;
  reservation: number;
  index?: number;
  id?: string;
  updatedAt?: Date;
  createdAt?: Date;
  transitMode: TransitMode;
  customer: string;
  dropOffLocation: string;
  pickUpLocation: string;
  pickUp: string;
  appointment: string;
  release: string;
  notes: string;
}

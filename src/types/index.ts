export type TurnStatus = 'active' | 'cancelled' | 'completed';

export interface ITurn {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  status: TurnStatus;
}

export type ReservationStatus = 'pending' | 'dispatched' | 'cancelled';

export interface IReservation {
  id: string;
  turnId: string;
  clientName: string;
  idCard: string;
  reservationDate: string;
  status: ReservationStatus;
}

export interface IUser {
  id: string;
  email: string;
  password: string;
}
import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type ReservationStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentMethod = "card" | "agency";

export interface CarReservationInsert {
  reference_code: string;
  car_id: string;
  car_name: string;
  pickup_date: string;
  return_date?: string | null;
  pickup_location: string;
  return_location?: string | null;
  add_ons: string[];
  total_price: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  driver_license?: string | null;
  payment_method: PaymentMethod;
  status?: ReservationStatus;
}

export interface ExcursionReservationInsert {
  reference_code: string;
  excursion_id: string;
  excursion_title: string;
  date: string;
  persons: number;
  car_type: string;
  add_ons: string[];
  total_price: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  payment_method: PaymentMethod;
  status?: ReservationStatus;
}

export interface AirportTransferReservationInsert {
  reference_code: string;
  airport: string;
  pickup_location: string;
  date: string;
  time: string;
  passengers: number;
  car_preference: string;
  total_price: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  payment_method: PaymentMethod;
  status?: ReservationStatus;
}

export interface CarReservationRow extends CarReservationInsert {
  id: string;
  created_at: string;
  status: ReservationStatus;
}

export interface ExcursionReservationRow extends ExcursionReservationInsert {
  id: string;
  created_at: string;
  status: ReservationStatus;
}

export interface AirportTransferReservationRow extends AirportTransferReservationInsert {
  id: string;
  created_at: string;
  status: ReservationStatus;
}

export interface AdminReservationsPayload {
  carReservations: CarReservationRow[];
  excursionReservations: ExcursionReservationRow[];
  airportReservations: AirportTransferReservationRow[];
}

const handlePostgrestError = (error: PostgrestError | null) => {
  if (error) {
    throw new Error(error.message);
  }
};

export async function createCarReservation(payload: CarReservationInsert) {
  const { data, error } = await supabase
    .from("car_reservations")
    .insert({
      status: payload.status ?? "pending",
      ...payload,
    })
    .select()
    .single();

  handlePostgrestError(error);
  return data as CarReservationRow;
}

export async function createExcursionReservation(payload: ExcursionReservationInsert) {
  const { data, error } = await supabase
    .from("excursion_reservations")
    .insert({
      status: payload.status ?? "pending",
      ...payload,
    })
    .select()
    .single();

  handlePostgrestError(error);
  return data as ExcursionReservationRow;
}

export async function createAirportTransferReservation(payload: AirportTransferReservationInsert) {
  const { data, error } = await supabase
    .from("airport_reservations")
    .insert({
      status: payload.status ?? "pending",
      ...payload,
    })
    .select()
    .single();

  handlePostgrestError(error);
  return data as AirportTransferReservationRow;
}

export async function fetchAdminReservations(): Promise<AdminReservationsPayload> {
  const [{ data: carReservations, error: carError }, { data: excursionReservations, error: excursionError }, { data: airportReservations, error: airportError }] =
    await Promise.all([
      supabase.from("car_reservations").select().order("pickup_date", { ascending: true }),
      supabase.from("excursion_reservations").select().order("date", { ascending: true }),
      supabase.from("airport_reservations").select().order("date", { ascending: true }),
    ]);

  handlePostgrestError(carError);
  handlePostgrestError(excursionError);
  handlePostgrestError(airportError);

  return {
    carReservations: (carReservations ?? []) as CarReservationRow[],
    excursionReservations: (excursionReservations ?? []) as ExcursionReservationRow[],
    airportReservations: (airportReservations ?? []) as AirportTransferReservationRow[],
  };
}


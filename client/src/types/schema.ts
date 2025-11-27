// Car data structure
export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  image: string;
  images: string[];
  price: number;
  transmission: 'Automatic' | 'Manual';
  fuel: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  seats: number;
  luggage: number;
  horsepower: number;
  consumption: string;
  description: string;
  features: string[];
  available: boolean;
  discount?: number;
}

// Excursion data structure
export interface Excursion {
  id: string;
  destination: string;
  title: string;
  description: string;
  image: string;
  duration: 'Half Day' | 'Full Day' | 'Multi-Day';
  price: number;
  price3?: number;
  highlights: string[];
  included: string[];
}

// Booking data structure
export interface Booking {
  id: string;
  carId?: string;
  excursionId?: string;
  pickupDate: string;
  returnDate?: string;
  pickupLocation: string;
  returnLocation?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  driverLicense: string;
  addOns: string[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}


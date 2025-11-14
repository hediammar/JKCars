import CarCard from '../CarCard';

export default function CarCardExample() {
  const mockCar = {
    id: "1",
    name: "BMW 5 Series",
    brand: "BMW",
    model: "5 Series 520d",
    year: 2024,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80"],
    price: 120,
    transmission: "Automatic" as const,
    fuel: "Diesel" as const,
    seats: 5,
    luggage: 3,
    horsepower: 190,
    consumption: "5.2L/100km",
    description: "Experience luxury and performance with the BMW 5 Series.",
    features: ["Leather Seats", "Navigation", "Climate Control"],
    available: true,
    discount: 10
  };

  return <CarCard car={mockCar} />;
}

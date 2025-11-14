import ExcursionCard from '../ExcursionCard';

export default function ExcursionCardExample() {
  const mockExcursion = {
    id: "1",
    destination: "Tunis Medina",
    title: "Tunis Medina & Carthage Heritage Tour",
    description: "Explore the historic heart of Tunisia with a guided tour through the UNESCO-listed Medina of Tunis and the ancient ruins of Carthage.",
    image: "https://images.unsplash.com/photo-1591604021695-0c69b9f1e4b0?w=800&q=80",
    duration: "Full Day" as const,
    price: 85,
    highlights: [
      "UNESCO World Heritage Medina",
      "Ancient Carthage Ruins",
      "Bardo Museum Visit",
      "Traditional Tunisian Lunch"
    ],
    included: ["Professional Guide", "Transportation", "Lunch", "Museum Entrance"]
  };

  return <ExcursionCard excursion={mockExcursion} />;
}

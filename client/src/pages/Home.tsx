import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import CarCard from '@/components/CarCard';
import FeatureCard from '@/components/FeatureCard';
import { Car as CarType } from '@shared/schema';
import { Car, Shield, HeadphonesIcon, Award, MapPin, Clock } from 'lucide-react';
import carsDataRaw from '@/data/cars.json';

const carsData = carsDataRaw as CarType[];

export default function Home() {
  const featuredCars = carsData.slice(0, 3);

  return (
    <div className="min-h-screen">
      <Hero />

      <section className="py-20 bg-gradient-to-br from-brand-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose JK Cars?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the best car rental service in Tunisia with our premium fleet and exceptional customer care
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Car}
              title="Premium Fleet"
              description="Choose from our selection of premium vehicles, all less than 2 years old and meticulously maintained."
              index={0}
            />
            <FeatureCard
              icon={Award}
              title="Best Rates"
              description="Competitive pricing with no hidden fees. What you see is what you pay, guaranteed."
              index={1}
            />
            <FeatureCard
              icon={HeadphonesIcon}
              title="24/7 Support"
              description="Round-the-clock customer support across Tunisia. We're always here when you need us."
              index={2}
            />
            <FeatureCard
              icon={Shield}
              title="Full Insurance"
              description="Comprehensive insurance coverage included with every rental for your peace of mind."
              index={3}
            />
            <FeatureCard
              icon={MapPin}
              title="Nationwide Coverage"
              description="Pick up and drop off at any location across Tunisia, from Tunis to Djerba."
              index={4}
            />
            <FeatureCard
              icon={Clock}
              title="Flexible Rentals"
              description="Rent by the hour, day, week, or month. Flexible terms that adapt to your needs."
              index={5}
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Vehicles
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our handpicked selection of premium cars
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car, index) => (
              <CarCard key={car.id} car={car} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import CarCard from '@/components/CarCard';
import FeatureCard from '@/components/FeatureCard';
import { Car as CarType } from '@shared/schema';
import { Car, Shield, HeadphonesIcon, Award, MapPin, Clock } from 'lucide-react';
import carsDataRaw from '@/data/cars.json';
import { useLanguage } from '@/contexts/LanguageContext';

const carsData = carsDataRaw as CarType[];

export default function Home() {
  const { t } = useLanguage();
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
              {t('home.whyChoose')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.whyChooseDesc')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Car}
              title={t('home.features.premiumFleet.title')}
              description={t('home.features.premiumFleet.description')}
              index={0}
            />
            <FeatureCard
              icon={Award}
              title={t('home.features.bestRates.title')}
              description={t('home.features.bestRates.description')}
              index={1}
            />
            <FeatureCard
              icon={HeadphonesIcon}
              title={t('home.features.support.title')}
              description={t('home.features.support.description')}
              index={2}
            />
            <FeatureCard
              icon={Shield}
              title={t('home.features.insurance.title')}
              description={t('home.features.insurance.description')}
              index={3}
            />
            <FeatureCard
              icon={MapPin}
              title={t('home.features.coverage.title')}
              description={t('home.features.coverage.description')}
              index={4}
            />
            <FeatureCard
              icon={Clock}
              title={t('home.features.flexible.title')}
              description={t('home.features.flexible.description')}
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
              {t('home.featuredVehicles')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.featuredVehiclesDesc')}
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

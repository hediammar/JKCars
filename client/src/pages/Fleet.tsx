import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import CarCard from '@/components/CarCard';
import { Car } from '@/types/schema';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';
import carsDataRaw from '@/data/cars.json';
import { useLanguage } from '@/contexts/LanguageContext';

const carsData = carsDataRaw as Car[];

export default function Fleet() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [transmissionFilter, setTransmissionFilter] = useState('all');
  const [fuelFilter, setFuelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('price-low');

  const brands = useMemo(() => {
    return ['all', ...Array.from(new Set(carsData.map(car => car.brand)))];
  }, []);

  const filteredAndSortedCars = useMemo(() => {
    let filtered = carsData.filter(car => {
      const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          car.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = brandFilter === 'all' || car.brand === brandFilter;
      const matchesTransmission = transmissionFilter === 'all' || car.transmission === transmissionFilter;
      const matchesFuel = fuelFilter === 'all' || car.fuel === fuelFilter;
      
      return matchesSearch && matchesBrand && matchesTransmission && matchesFuel;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, brandFilter, transmissionFilter, fuelFilter, sortBy]);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-brand-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('fleet.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('fleet.description')}
          </p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="w-5 h-5 text-brand-600" />
            <h3 className="text-lg font-semibold">{t('fleet.filters')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder={t('fleet.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-cars"
              />
            </div>

            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger data-testid="select-brand-filter">
                <SelectValue placeholder={t('fleet.vehicleType')} />
              </SelectTrigger>
              <SelectContent>
                {brands.map(brand => (
                  <SelectItem key={brand} value={brand}>
                    {brand === 'all' ? t('fleet.allBrands') : brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={transmissionFilter} onValueChange={setTransmissionFilter}>
              <SelectTrigger data-testid="select-transmission-filter">
                <SelectValue placeholder={t('fleet.transmission')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.select')}</SelectItem>
                <SelectItem value="Automatic">Automatic</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
              </SelectContent>
            </Select>

            <Select value={fuelFilter} onValueChange={setFuelFilter}>
              <SelectTrigger data-testid="select-fuel-filter">
                <SelectValue placeholder={t('fleet.fuel')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.select')}</SelectItem>
                <SelectItem value="Petrol">Petrol</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
                <SelectItem value="Electric">Electric</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="select-sort">
                <SelectValue placeholder={t('fleet.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">{t('fleet.priceLowHigh')}</SelectItem>
                <SelectItem value="price-high">{t('fleet.priceHighLow')}</SelectItem>
                <SelectItem value="name">{t('fleet.nameAZ')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-4 text-gray-600">
          <span className="font-medium">{filteredAndSortedCars.length}</span> {t('fleet.vehiclesAvailable')}
        </div>

        {filteredAndSortedCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedCars.map((car, index) => (
              <CarCard key={car.id} car={car} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">{t('fleet.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

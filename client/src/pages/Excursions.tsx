import { useState } from 'react';
import { motion } from 'framer-motion';
import ExcursionCard from '@/components/ExcursionCard';
import { Excursion } from '@shared/schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import excursionsDataRaw from '@/data/excursions.json';
import { useLanguage } from '@/contexts/LanguageContext';

const excursionsData = excursionsDataRaw as Excursion[];

export default function Excursions() {
  const { t } = useLanguage();
  const [selectedExcursion, setSelectedExcursion] = useState<Excursion | null>(null);
  const [persons, setPersons] = useState(1);
  const [date, setDate] = useState('');
  const [carType, setCarType] = useState('sedan');
  const [addOns, setAddOns] = useState<string[]>([]);

  const addOnPrices = {
    guide: 30,
    lunch: 25,
    airport: 40,
  };

  const carTypePrices = {
    sedan: 0,
    suv: 20,
    minivan: 35,
  };

  const calculateTotal = () => {
    if (!selectedExcursion) return 0;
    
    let total = selectedExcursion.price * persons;
    total += carTypePrices[carType as keyof typeof carTypePrices];
    
    addOns.forEach(addon => {
      total += addOnPrices[addon as keyof typeof addOnPrices];
    });
    
    return total;
  };

  const handleAddOnToggle = (addon: string) => {
    setAddOns(prev =>
      prev.includes(addon)
        ? prev.filter(a => a !== addon)
        : [...prev, addon]
    );
  };

  const handleBooking = () => {
    console.log('Booking excursion:', {
      excursion: selectedExcursion,
      persons,
      date,
      carType,
      addOns,
      total: calculateTotal()
    });
    alert(`Booking confirmed! Total: ${calculateTotal()}DT`);
    setSelectedExcursion(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-brand-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('excursions.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('excursions.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {excursionsData.map((excursion, index) => (
            <ExcursionCard
              key={excursion.id}
              excursion={excursion}
              index={index}
              onBook={(exc) => setSelectedExcursion(exc)}
            />
          ))}
        </div>
      </div>

      <Dialog open={!!selectedExcursion} onOpenChange={() => setSelectedExcursion(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t('excursions.bookExcursion')}</DialogTitle>
          </DialogHeader>

          {selectedExcursion && (
            <div className="space-y-6">
              <div className="bg-brand-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{selectedExcursion.title}</h3>
                <p className="text-sm text-gray-600">{selectedExcursion.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">{t('excursions.selectDate')}</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    data-testid="input-excursion-date"
                  />
                </div>

                <div>
                  <Label htmlFor="persons">{t('excursions.numberOfPersons')}</Label>
                  <Input
                    id="persons"
                    type="number"
                    min="1"
                    value={persons}
                    onChange={(e) => setPersons(parseInt(e.target.value) || 1)}
                    data-testid="input-persons"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="carType">{t('excursions.vehicleType')}</Label>
                <Select value={carType} onValueChange={setCarType}>
                  <SelectTrigger data-testid="select-car-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan (+0DT)</SelectItem>
                    <SelectItem value="suv">SUV (+20DT)</SelectItem>
                    <SelectItem value="minivan">Minivan (+35DT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-3 block">{t('excursions.addons')}</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="guide"
                      checked={addOns.includes('guide')}
                      onCheckedChange={() => handleAddOnToggle('guide')}
                      data-testid="checkbox-guide"
                    />
                    <label htmlFor="guide" className="text-sm cursor-pointer">
                      {t('excursions.professionalGuide')} (+30DT)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="lunch"
                      checked={addOns.includes('lunch')}
                      onCheckedChange={() => handleAddOnToggle('lunch')}
                      data-testid="checkbox-lunch"
                    />
                    <label htmlFor="lunch" className="text-sm cursor-pointer">
                      {t('excursions.traditionalLunch')} (+25DT)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="airport"
                      checked={addOns.includes('airport')}
                      onCheckedChange={() => handleAddOnToggle('airport')}
                      data-testid="checkbox-airport"
                    />
                    <label htmlFor="airport" className="text-sm cursor-pointer">
                      {t('excursions.airportDropoff')} (+40DT)
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">{t('excursions.totalPrice')}</span>
                  <span className="text-3xl font-bold text-brand-600" data-testid="text-total-price">
                    {calculateTotal()}DT
                  </span>
                </div>
                <Button
                  onClick={() => {
                    if (!date) return;
                    
                    const params = new URLSearchParams({
                      type: 'excursion',
                      excursionId: selectedExcursion.id,
                      date,
                      persons: persons.toString(),
                      carType,
                      addOns: addOns.join(','),
                      totalPrice: calculateTotal().toString(),
                    });
                    
                    window.location.href = `/booking?${params.toString()}`;
                  }}
                  className="w-full"
                  data-testid="button-confirm-booking"
                  disabled={!date}
                >
                  {t('booking.continue')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import { Excursion } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, MapPin, Users, Calendar, CheckCircle2 } from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Dayjs } from 'dayjs';
import excursionsDataRaw from '@/data/excursions.json';
import { useLanguage } from '@/contexts/LanguageContext';

const excursionsData = excursionsDataRaw as Excursion[];

export default function ExcursionDetails() {
  const { t } = useLanguage();
  const [, params] = useRoute('/excursion/:id');
  const excursion = useMemo(() => excursionsData.find(e => e.id === params?.id), [params]);
  
  const [persons, setPersons] = useState(1);
  const [date, setDate] = useState<Dayjs | null>(null);
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
    if (!excursion) return 0;
    
    let total = excursion.price * persons;
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
    const dateString = date ? date.format('YYYY-MM-DD') : '';
    console.log('Booking excursion:', {
      excursion,
      persons,
      date: dateString,
      carType,
      addOns,
      total: calculateTotal()
    });
    alert(`Booking confirmed! Total: ${calculateTotal()}DT`);
  };

  if (!excursion) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('excursionDetails.notFound')}</h2>
          <Link href="/excursions">
            <Button>{t('excursionDetails.backToExcursions')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-brand-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/excursions">
          <Button variant="ghost" className="mb-6" data-testid="button-back-to-excursions">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('excursionDetails.backToExcursions')}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="relative h-96">
                <img
                  src={excursion.image}
                  alt={excursion.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <Badge className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border-white/30 text-white text-lg px-4 py-2">
                  {excursion.duration}
                </Badge>

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-brand-200 text-sm mb-2">
                    <MapPin className="w-5 h-5" />
                    {excursion.destination}
                  </div>
                  <h1 className="text-white text-4xl font-bold mb-2">{excursion.title}</h1>
                  <div className="flex items-center gap-4 text-brand-200">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{excursion.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span>{t('excursionDetails.groupTour')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">{t('excursionDetails.aboutThisExcursion')}</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{excursion.description}</p>
              
              <h3 className="text-xl font-semibold mb-4">{t('excursionDetails.highlights')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {excursion.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-4">{t('excursionDetails.whatsIncluded')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {excursion.included.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">{t('excursionDetails.pricePerPerson')}</div>
                <div className="text-4xl font-bold text-brand-600">
                  {excursion.price}DT
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <Label className="mb-3 block">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {t('excursions.selectDate')}
                  </Label>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden" data-testid="input-excursion-date">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateCalendar
                        value={date}
                        onChange={(newValue) => setDate(newValue)}
                        sx={{
                          width: '100%',
                          '& .MuiPickersCalendarHeader-root': {
                            paddingTop: '8px',
                          },
                          '& .MuiPickersDay-root': {
                            '&.Mui-selected': {
                              backgroundColor: '#f6b21b',
                              '&:hover': {
                                backgroundColor: '#c48e15',
                              },
                            },
                            '&:hover': {
                              backgroundColor: '#fef3cf',
                            },
                          },
                          '& .MuiPickersDay-today': {
                            border: '1px solid #f6b21b',
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </div>

                <div>
                  <Label htmlFor="persons">
                    <Users className="w-4 h-4 inline mr-2" />
                    {t('excursions.numberOfPersons')}
                  </Label>
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

              <div className="mb-6">
                <Label htmlFor="carType">{t('excursions.vehicleType')}</Label>
                <Select value={carType} onValueChange={setCarType}>
                  <SelectTrigger data-testid="select-car-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">{t('excursionDetails.vehicleSedan')}</SelectItem>
                    <SelectItem value="suv">{t('excursionDetails.vehicleSUV')}</SelectItem>
                    <SelectItem value="minivan">{t('excursionDetails.vehicleMinivan')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-6">
                <Label className="mb-3 block">{t('excursions.addons')}</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="guide"
                        checked={addOns.includes('guide')}
                        onCheckedChange={() => handleAddOnToggle('guide')}
                        data-testid="checkbox-guide"
                      />
                      <label htmlFor="guide" className="text-sm cursor-pointer">{t('excursions.professionalGuide')}</label>
                    </div>
                    <span className="text-sm text-gray-600">+30DT</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="lunch"
                        checked={addOns.includes('lunch')}
                        onCheckedChange={() => handleAddOnToggle('lunch')}
                        data-testid="checkbox-lunch"
                      />
                      <label htmlFor="lunch" className="text-sm cursor-pointer">{t('excursions.traditionalLunch')}</label>
                    </div>
                    <span className="text-sm text-gray-600">+25DT</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="airport"
                        checked={addOns.includes('airport')}
                        onCheckedChange={() => handleAddOnToggle('airport')}
                        data-testid="checkbox-airport"
                      />
                      <label htmlFor="airport" className="text-sm cursor-pointer">{t('excursions.airportDropoff')}</label>
                    </div>
                    <span className="text-sm text-gray-600">+40DT</span>
                  </div>
                </div>
              </div>

              {date && (
                <div className="bg-brand-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{t('excursions.totalPrice')}</span>
                    <span className="text-2xl font-bold text-brand-600" data-testid="text-total-price">
                      {calculateTotal()}DT
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  if (!date) return;
                  
                  const params = new URLSearchParams({
                    type: 'excursion',
                    excursionId: excursion.id,
                    date: date.format('YYYY-MM-DD'),
                    persons: persons.toString(),
                    carType,
                    addOns: addOns.join(','),
                    totalPrice: calculateTotal().toString(),
                  });
                  
                  window.location.href = `/booking?${params.toString()}`;
                }}
                className="w-full"
                size="lg"
                disabled={!date}
                data-testid="button-confirm-booking"
              >
                {t('booking.continue')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


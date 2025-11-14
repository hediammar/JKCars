import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plane, MapPin, Users, Car } from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Dayjs } from 'dayjs';
import { TimePicker, type TimePickerValue } from 'react-accessible-time-picker';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AirportTransfers() {
  const { t } = useLanguage();
  const [airport, setAirport] = useState('');
  const [pickupLocation, setPickupLocation] = useState('hammamet');
  const [date, setDate] = useState<Dayjs | null>(null);
  const [time, setTime] = useState<TimePickerValue | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [carPreference, setCarPreference] = useState('sedan');

  const airportPrices = {
    'tunis-carthage': 80,
    'enfidha': 40,
    'monastir': 30,
  };

  const carPrices = {
    sedan: 0,
    suv: 15,
    minivan: 25,
  };

  const calculateTotal = () => {
    if (!airport) return 0;
    const basePrice = airportPrices[airport as keyof typeof airportPrices];
    const carExtra = carPrices[carPreference as keyof typeof carPrices];
    return basePrice + carExtra;
  };

  const handleBooking = () => {
    if (!airport || !date || !time) return;
    
    const dateString = date.format('YYYY-MM-DD');
    const timeString = `${time.hour.padStart(2, '0')}:${time.minute.padStart(2, '0')}`;
    
    const params = new URLSearchParams({
      type: 'airport-transfer',
      airport,
      pickupLocation,
      date: dateString,
      time: timeString,
      passengers: passengers.toString(),
      carPreference,
      totalPrice: calculateTotal().toString(),
    });
    
    window.location.href = `/booking?${params.toString()}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-brand-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 mb-6 shadow-xl shadow-brand-500/30">
            <Plane className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('airportTransfers.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('airportTransfers.description')}
          </p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="space-y-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="airport">
                  <Plane className="w-4 h-4 inline mr-2" />
                  {t('airportTransfers.airport')}
                </Label>
                <Select value={airport} onValueChange={setAirport}>
                  <SelectTrigger data-testid="select-airport">
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tunis-carthage">Tunis-Carthage (80DT)</SelectItem>
                    <SelectItem value="enfidha">Enfidha-Hammamet (40DT)</SelectItem>
                    <SelectItem value="monastir">Monastir (30DT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pickupLocation">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  {t('airportTransfers.pickupLocation')}
                </Label>
                <Select value={pickupLocation} onValueChange={setPickupLocation}>
                  <SelectTrigger data-testid="select-pickup-location-airport">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hammamet">Hammamet</SelectItem>
                    <SelectItem value="tunis">Tunis</SelectItem>
                    <SelectItem value="sousse">Sousse</SelectItem>
                    <SelectItem value="monastir">Monastir</SelectItem>
                    <SelectItem value="nabeul">Nabeul</SelectItem>
                    <SelectItem value="custom">Custom Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="mb-3 block">{t('airportTransfers.date')}</Label>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden" data-testid="input-transfer-date">
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

              <div className="space-y-4">
                <div>
                  <Label htmlFor="time" className="mb-3 block">{t('airportTransfers.time')}</Label>
                  <div className="border-2 border-gray-200 rounded-lg p-3" data-testid="input-transfer-time">
                    <TimePicker
                      value={time || { hour: '12', minute: '00' }}
                      onChange={(newTime) => setTime(newTime)}
                      is24Hour={true}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="passengers">
                    <Users className="w-4 h-4 inline mr-2" />
                    {t('airportTransfers.passengers')}
                  </Label>
                  <Input
                    id="passengers"
                    type="number"
                    min="1"
                    max="8"
                    value={passengers}
                    onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
                    data-testid="input-transfer-passengers"
                  />
                </div>

                <div>
                  <Label htmlFor="carPreference">
                    <Car className="w-4 h-4 inline mr-2" />
                    {t('airportTransfers.vehicle')}
                  </Label>
                  <Select value={carPreference} onValueChange={setCarPreference}>
                    <SelectTrigger data-testid="select-transfer-car">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Sedan (+0DT)</SelectItem>
                      <SelectItem value="suv">SUV (+15DT)</SelectItem>
                      <SelectItem value="minivan">Minivan (+25DT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {airport && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-brand-50 to-brand-100/50 rounded-xl p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-700">{t('airportTransfers.totalPrice')}</span>
                <span className="text-4xl font-bold text-brand-600" data-testid="text-transfer-total">
                  {calculateTotal()}DT
                </span>
              </div>
              <p className="text-sm text-gray-600">{t('airportTransfers.includesFees')}</p>
            </motion.div>
          )}

          <Button
            onClick={handleBooking}
            disabled={!airport || !date || !time || !time.hour || !time.minute}
            className="w-full"
            size="lg"
            data-testid="button-book-transfer"
          >
            {t('booking.continue')}
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="text-brand-600 text-3xl font-bold mb-2">24/7</div>
            <div className="text-gray-600">{t('airportTransfers.availableAnytime')}</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="text-brand-600 text-3xl font-bold mb-2">15 min</div>
            <div className="text-gray-600">{t('airportTransfers.pickupGuarantee')}</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="text-brand-600 text-3xl font-bold mb-2">100%</div>
            <div className="text-gray-600">{t('airportTransfers.onTimeService')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

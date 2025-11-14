import { useState, useMemo } from 'react';
import { useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import { Car } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Fuel, Settings, Luggage, Gauge, Droplets, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs, { Dayjs } from 'dayjs';
import carsDataRaw from '@/data/cars.json';

const carsData = carsDataRaw as Car[];

export default function CarDetails() {
  const [, params] = useRoute('/car/:id');
  const car = useMemo(() => carsData.find(c => c.id === params?.id), [params]);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [pickupDate, setPickupDate] = useState<Dayjs | null>(null);
  const [returnDate, setReturnDate] = useState<Dayjs | null>(null);
  const [pickupLocation, setPickupLocation] = useState('hammamet');
  const [returnLocation, setReturnLocation] = useState('hammamet');
  const [addOns, setAddOns] = useState<string[]>([]);

  const addOnPrices = {
    gps: 5,
    babySeat: 8,
    insurance: 15,
    driver: 40,
  };

  const calculateTotal = () => {
    if (!car || !pickupDate || !returnDate) return 0;
    
    const days = Math.max(1, returnDate.diff(pickupDate, 'day') + 1);
    const basePrice = car.discount ? car.price * (1 - car.discount / 100) : car.price;
    let total = basePrice * days;
    
    addOns.forEach(addon => {
      total += addOnPrices[addon as keyof typeof addOnPrices] * days;
    });
    
    return Math.round(total);
  };

  const handleAddOnToggle = (addon: string) => {
    setAddOns(prev =>
      prev.includes(addon)
        ? prev.filter(a => a !== addon)
        : [...prev, addon]
    );
  };

  const nextImage = () => {
    if (car) {
      setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
    }
  };

  const prevImage = () => {
    if (car) {
      setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length);
    }
  };

  if (!car) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Car not found</h2>
          <Link href="/fleet">
            <Button>Back to Fleet</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-brand-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/fleet">
          <Button variant="ghost" className="mb-6" data-testid="button-back-to-fleet">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Fleet
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="relative h-96 group">
                <img
                  src={car.images[currentImageIndex]}
                  alt={car.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {car.discount && (
                  <Badge className="absolute top-4 right-4 bg-red-500 text-white border-0 shadow-lg text-lg px-4 py-2">
                    {car.discount}% OFF
                  </Badge>
                )}

                {car.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      data-testid="button-prev-image"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      data-testid="button-next-image"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-white text-4xl font-bold mb-2">{car.name}</h1>
                  <p className="text-brand-200 text-lg">{car.model} • {car.year}</p>
                </div>
              </div>

              {car.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {car.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex ? 'border-brand-500' : 'border-transparent'
                      }`}
                      data-testid={`button-thumbnail-${index}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-50 rounded-lg">
                    <Users className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Passengers</div>
                    <div className="font-semibold">{car.seats} Seats</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-50 rounded-lg">
                    <Settings className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Transmission</div>
                    <div className="font-semibold">{car.transmission}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-50 rounded-lg">
                    <Fuel className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Fuel Type</div>
                    <div className="font-semibold">{car.fuel}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-50 rounded-lg">
                    <Luggage className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Luggage</div>
                    <div className="font-semibold">{car.luggage} Bags</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-50 rounded-lg">
                    <Gauge className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Horsepower</div>
                    <div className="font-semibold">{car.horsepower} HP</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-50 rounded-lg">
                    <Droplets className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Consumption</div>
                    <div className="font-semibold">{car.consumption}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{car.description}</p>
              
              <h3 className="text-xl font-semibold mb-3">Features</h3>
              <div className="flex flex-wrap gap-2">
                {car.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">Price per day</div>
                <div className="text-4xl font-bold text-brand-600">
                  {car.discount ? (
                    <>
                      <span className="line-through text-gray-400 text-2xl mr-2">{car.price}DT</span>
                      {Math.round(car.price * (1 - car.discount / 100))}DT
                    </>
                  ) : (
                    `${car.price}DT`
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <Label className="mb-3 block">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Pickup Date
                  </Label>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden" data-testid="input-pickup-date">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateCalendar
                        value={pickupDate}
                        onChange={(newValue) => setPickupDate(newValue)}
                        minDate={dayjs()}
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
                  <Label className="mb-3 block">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Return Date
                  </Label>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden" data-testid="input-return-date">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateCalendar
                        value={returnDate}
                        onChange={(newValue) => setReturnDate(newValue)}
                        minDate={pickupDate || dayjs()}
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
                  <Label htmlFor="pickupLocation">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Pickup Location
                  </Label>
                  <Select value={pickupLocation} onValueChange={setPickupLocation}>
                    <SelectTrigger data-testid="select-pickup-location">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hammamet">Hammamet</SelectItem>
                      <SelectItem value="tunis">Tunis</SelectItem>
                      <SelectItem value="sousse">Sousse</SelectItem>
                      <SelectItem value="monastir">Monastir</SelectItem>
                      <SelectItem value="sfax">Sfax</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="returnLocation">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Return Location
                  </Label>
                  <Select value={returnLocation} onValueChange={setReturnLocation}>
                    <SelectTrigger data-testid="select-return-location">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hammamet">Hammamet</SelectItem>
                      <SelectItem value="tunis">Tunis</SelectItem>
                      <SelectItem value="sousse">Sousse</SelectItem>
                      <SelectItem value="monastir">Monastir</SelectItem>
                      <SelectItem value="sfax">Sfax</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-6">
                <Label className="mb-3 block">Add-ons</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="gps"
                        checked={addOns.includes('gps')}
                        onCheckedChange={() => handleAddOnToggle('gps')}
                        data-testid="checkbox-gps"
                      />
                      <label htmlFor="gps" className="text-sm cursor-pointer">GPS Navigation</label>
                    </div>
                    <span className="text-sm text-gray-600">+5DT/day</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="babySeat"
                        checked={addOns.includes('babySeat')}
                        onCheckedChange={() => handleAddOnToggle('babySeat')}
                        data-testid="checkbox-baby-seat"
                      />
                      <label htmlFor="babySeat" className="text-sm cursor-pointer">Baby Seat</label>
                    </div>
                    <span className="text-sm text-gray-600">+8DT/day</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="insurance"
                        checked={addOns.includes('insurance')}
                        onCheckedChange={() => handleAddOnToggle('insurance')}
                        data-testid="checkbox-insurance"
                      />
                      <label htmlFor="insurance" className="text-sm cursor-pointer">Extra Insurance</label>
                    </div>
                    <span className="text-sm text-gray-600">+15DT/day</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="driver"
                        checked={addOns.includes('driver')}
                        onCheckedChange={() => handleAddOnToggle('driver')}
                        data-testid="checkbox-driver"
                      />
                      <label htmlFor="driver" className="text-sm cursor-pointer">Driver Service</label>
                    </div>
                    <span className="text-sm text-gray-600">+40DT/day</span>
                  </div>
                </div>
              </div>

              {pickupDate && returnDate && (
                <div className="bg-brand-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Price:</span>
                    <span className="text-2xl font-bold text-brand-600" data-testid="text-car-total-price">
                      {calculateTotal()}DT
                    </span>
                  </div>
                </div>
              )}

              <Button 
                className="w-full" 
                size="lg" 
                data-testid="button-book-now-car"
                disabled={!pickupDate || !returnDate}
                onClick={() => {
                  if (!pickupDate || !returnDate) return;
                  
                  const params = new URLSearchParams({
                    type: 'car',
                    carId: car.id,
                    pickupDate: pickupDate.format('YYYY-MM-DD'),
                    returnDate: returnDate.format('YYYY-MM-DD'),
                    pickupLocation,
                    returnLocation,
                    addOns: addOns.join(','),
                    totalPrice: calculateTotal().toString(),
                  });
                  
                  window.location.href = `/booking?${params.toString()}`;
                }}
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

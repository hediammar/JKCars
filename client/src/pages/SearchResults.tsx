import { useState, useMemo, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { Car as CarType } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Edit, Users, Luggage, Settings, Check, ArrowRight, Fuel } from 'lucide-react';
import { format, parse } from 'date-fns';
import carsDataRaw from '@/data/cars.json';

const carsData = carsDataRaw as CarType[];

interface SearchParams {
  pickup: string;
  return: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
}

export default function SearchResults() {
  const [location, setLocation] = useLocation();
  const [sortBy, setSortBy] = useState('price');
  const [vehicleType, setVehicleType] = useState('all');
  const [transmission, setTransmission] = useState('all');
  const [minSeats, setMinSeats] = useState('all');
  const [queryString, setQueryString] = useState(window.location.search);

  // Update query string when location changes
  useEffect(() => {
    setQueryString(window.location.search);
  }, [location]);

  // Parse URL parameters
  const searchParams = useMemo(() => {
    const params = new URLSearchParams(queryString);
    const parsed = {
      pickup: params.get('pickup') || '',
      return: params.get('return') || '',
      pickupDate: params.get('pickupDate') || '',
      returnDate: params.get('returnDate') || '',
      pickupTime: params.get('pickupTime') || '12:00',
      returnTime: params.get('returnTime') || '12:00',
    } as SearchParams;
    console.log('Parsed URL params:', parsed, 'from queryString:', queryString);
    return parsed;
  }, [queryString]);

  // Filter and sort cars
  const filteredCars = useMemo(() => {
    let filtered = [...carsData];

    // Filter by vehicle type (simplified - using car category)
    if (vehicleType !== 'all') {
      // This would need to be enhanced based on actual car categories
      filtered = filtered.filter(car => {
        if (vehicleType === 'sedan') return car.name.toLowerCase().includes('sedan') || car.seats <= 5;
        if (vehicleType === 'suv') return car.name.toLowerCase().includes('suv') || car.seats > 5;
        if (vehicleType === 'wagon') return car.name.toLowerCase().includes('wagon') || car.name.toLowerCase().includes('variant');
        return true;
      });
    }

    // Filter by transmission
    if (transmission !== 'all') {
      filtered = filtered.filter(car => 
        car.transmission.toLowerCase() === transmission.toLowerCase()
      );
    }

    // Filter by minimum seats
    if (minSeats !== 'all') {
      const minSeatsNum = parseInt(minSeats);
      filtered = filtered.filter(car => car.seats >= minSeatsNum);
    }

    // Sort cars
    filtered.sort((a, b) => {
      if (sortBy === 'price') {
        const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
        const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
        return priceA - priceB;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return filtered;
  }, [sortBy, vehicleType, transmission, minSeats]);

  const formatDate = (dateString: string) => {
    try {
      const date = parse(dateString, 'yyyy-MM-dd', new Date());
      return format(date, 'MMM dd');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${period}`;
    } catch {
      return timeString;
    }
  };

  // Calculate number of days between pickup and return dates (inclusive - both days count)
  const days = useMemo(() => {
    try {
      console.log('Calculating days with params:', searchParams);
      
      if (!searchParams.pickupDate || !searchParams.returnDate) {
        console.log('Missing dates, returning 1');
        return 1;
      }
      
      const pickup = parse(searchParams.pickupDate, 'yyyy-MM-dd', new Date());
      const returnDate = parse(searchParams.returnDate, 'yyyy-MM-dd', new Date());
      
      console.log('Parsed dates:', { pickup, returnDate });
      
      // Validate dates
      if (isNaN(pickup.getTime()) || isNaN(returnDate.getTime())) {
        console.log('Invalid dates, returning 1');
        return 1;
      }
      
      // Calculate difference in milliseconds, then convert to days
      const diffTime = returnDate.getTime() - pickup.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      console.log('Date calculation:', {
        diffTime,
        diffDays,
        pickupTime: pickup.getTime(),
        returnTime: returnDate.getTime()
      });
      
      // Add 1 because both pickup and return days count in car rentals
      // Same logic as CarDetails.tsx: returnDate.diff(pickupDate, 'day') + 1
      const calculatedDays = Math.max(1, diffDays + 1);
      
      console.log('Final calculated days:', calculatedDays);
      
      return calculatedDays;
    } catch (error) {
      console.error('Error calculating days:', error);
      return 1;
    }
  }, [searchParams.pickupDate, searchParams.returnDate]);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-brand-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">JK Cars</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <span>
                  {searchParams.pickup} {formatDate(searchParams.pickupDate)} | {formatTime(searchParams.pickupTime)} - {formatDate(searchParams.returnDate)} | {formatTime(searchParams.returnTime)}
                </span>
                <button
                  onClick={() => setLocation('/')}
                  className="text-brand-600 hover:text-brand-700"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8">
          WHICH CAR DO YOU WANT TO DRIVE?
        </h2>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>

            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger>
                <SelectValue placeholder="Vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sedan">Sedan</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
                <SelectItem value="wagon">Wagon</SelectItem>
              </SelectContent>
            </Select>

            <Select value={transmission} onValueChange={setTransmission}>
              <SelectTrigger>
                <SelectValue placeholder="Transmission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automatic">Automatic</SelectItem>
              </SelectContent>
            </Select>

            <Select value={minSeats} onValueChange={setMinSeats}>
              <SelectTrigger>
                <SelectValue placeholder="Minimum seats" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="4">4+ Seats</SelectItem>
                <SelectItem value="5">5+ Seats</SelectItem>
                <SelectItem value="7">7+ Seats</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredCars.length} {filteredCars.length === 1 ? 'car' : 'cars'} available
          </p>
        </div>

        {/* Car Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car, index) => (
            <CarListingCard 
              key={car.id} 
              car={car} 
              index={index} 
              days={days}
              searchParams={searchParams}
            />
          ))}
        </div>

        {filteredCars.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg mb-4">No cars found matching your criteria</p>
            <Button onClick={() => setLocation('/')} variant="outline">
              Modify Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface CarListingCardProps {
  car: CarType;
  index: number;
  days: number;
  searchParams: SearchParams;
}

function CarListingCard({ car, index, days, searchParams }: CarListingCardProps) {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bookingOption, setBookingOption] = useState('best-price');
  const [mileageOption, setMileageOption] = useState('limited');
  
  // Ensure days is a valid number
  const rentalDays = typeof days === 'number' && !isNaN(days) && days > 0 ? days : 1;
  
  console.log('CarListingCard received days prop:', days, 'rentalDays:', rentalDays, 'car:', car.name);
  
  // Ensure price is a valid number
  const carPrice = typeof car.price === 'number' && !isNaN(car.price) ? car.price : 0;
  const dailyPrice = car.discount 
    ? Math.round(carPrice * (1 - car.discount / 100))
    : carPrice;
  
  // Calculate additional costs
  const flexibleDailyFee = 2.03; // DT per day for flexible option
  const unlimitedKmDailyFee = 1.88; // DT per day for unlimited kilometers
  
  const baseTotalPrice = dailyPrice * rentalDays;
  const flexibleFee = bookingOption === 'flexible' ? flexibleDailyFee * rentalDays : 0;
  const mileageFee = mileageOption === 'unlimited' ? unlimitedKmDailyFee * rentalDays : 0;
  const totalPrice = baseTotalPrice + flexibleFee + mileageFee;

  const getCategory = () => {
    if (car.seats > 5) return 'SUV';
    if (car.name.toLowerCase().includes('wagon') || car.name.toLowerCase().includes('variant')) {
      return 'Station Wagon';
    }
    return 'Sedan';
  };

  const handleNext = () => {
    setIsDialogOpen(false);
    // Navigate directly to booking page with all booking information
    const params = new URLSearchParams({
      type: 'car',
      carId: car.id,
      pickupDate: searchParams.pickupDate,
      returnDate: searchParams.returnDate,
      pickupLocation: searchParams.pickup,
      returnLocation: searchParams.return,
      addOns: '', // No add-ons selected in search results, but bookingOption and mileageOption are included in price
      totalPrice: Math.round(totalPrice).toString(),
      // Include booking options for reference (optional)
      bookingOption,
      mileageOption,
    });
    window.location.href = `/booking?${params.toString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
        {/* Car Image */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={car.image}
            alt={car.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Car+Image';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {car.discount && (
            <Badge className="absolute top-4 right-4 bg-red-500 text-white border-0 shadow-lg">
              {car.discount}% OFF
            </Badge>
          )}
          
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white text-2xl font-bold">{car.name}</h3>
            <p className="text-brand-200 text-sm">{car.model}</p>
          </div>
        </div>

        <div className="p-6">
          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4 text-brand-500" />
              <span className="text-sm">{car.seats} Seats</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Settings className="w-4 h-4 text-brand-500" />
              <span className="text-sm">{car.transmission}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Fuel className="w-4 h-4 text-brand-500" />
              <span className="text-sm">{car.fuel}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-brand-600">
                {car.discount ? (
                  <>
                    <span className="line-through text-gray-400 text-xl mr-2">{car.price}DT</span>
                    {dailyPrice}DT
                  </>
                ) : (
                  `${dailyPrice}DT`
                )}
              </div>
              <div className="text-sm text-gray-500">per day</div>
              <div className="text-xs text-gray-400 mt-1">Total: {baseTotalPrice.toFixed(2)}DT</div>
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2 text-green-600 mb-4 text-sm">
            <Check className="w-4 h-4" />
            <span>Unlimited kilometers available</span>
          </div>

          {/* Select Car Button */}
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="w-full group/btn"
          >
            Select Car
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Booking Options Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Booking option</DialogTitle>
            <DialogDescription>
              Select your booking preferences and mileage options for {car.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Booking Option Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Booking option</h3>
              <RadioGroup value={bookingOption} onValueChange={setBookingOption}>
                <div className="space-y-3">
                  {/* Best Price Option */}
                  <Label 
                    htmlFor="best-price" 
                    className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <RadioGroupItem value="best-price" id="best-price" className="mt-1" />
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Best price</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Pay now, cancel and rebook for a fee
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-700">Included</div>
                    </div>
                  </Label>

                  {/* Stay Flexible Option */}
                  <Label 
                    htmlFor="flexible" 
                    className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <RadioGroupItem value="flexible" id="flexible" className="mt-1" />
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">Stay flexible</span>
                          <Badge variant="secondary" className="text-xs">Popular</Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Pay at pickup, free cancellation and rebooking any time before pickup time
                        </div>
                      </div>
                      <div className="text-sm font-medium text-brand-600">
                        +{flexibleDailyFee.toFixed(2)}DT/day
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Mileage Section */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900">Mileage</h3>
              <RadioGroup value={mileageOption} onValueChange={setMileageOption}>
                <div className="space-y-3">
                  {/* Limited Kilometers Option */}
                  <Label 
                    htmlFor="limited" 
                    className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <RadioGroupItem value="limited" id="limited" className="mt-1" />
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">2,208 km</div>
                        <div className="text-sm text-gray-600 mt-1">
                          +0.41DT / for every additional km
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-700">Included</div>
                    </div>
                  </Label>

                  {/* Unlimited Kilometers Option */}
                  <Label 
                    htmlFor="unlimited" 
                    className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <RadioGroupItem value="unlimited" id="unlimited" className="mt-1" />
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Unlimited kilometers</div>
                        <div className="text-sm text-gray-600 mt-1">
                          All kilometers are included in the price
                        </div>
                      </div>
                      <div className="text-sm font-medium text-brand-600">
                        +{unlimitedKmDailyFee.toFixed(2)}DT/day
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Price Summary */}
            <div className="border-t pt-6 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Base price ({rentalDays} {rentalDays === 1 ? 'day' : 'days'})</span>
                <span>{baseTotalPrice.toFixed(2)}DT</span>
              </div>
              {flexibleFee > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Flexible booking</span>
                  <span>+{flexibleFee.toFixed(2)}DT</span>
                </div>
              )}
              {mileageFee > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Unlimited kilometers</span>
                  <span>+{mileageFee.toFixed(2)}DT</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>{totalPrice.toFixed(2)}DT</span>
              </div>
            </div>

            {/* Next Button */}
            <Button 
              onClick={handleNext}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-lg font-semibold"
            >
              Next
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}


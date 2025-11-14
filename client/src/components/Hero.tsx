import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Car, MapPin, Calendar, Search, X, Plane } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { TimePicker, type TimePickerValue } from 'react-accessible-time-picker';
import { cn } from '@/lib/utils';
import locationsData from '@/data/locations.json';

interface Location {
  id: string;
  name: string;
  type: 'airport' | 'city';
  city: string;
}

const locations = locationsData as Location[];

export default function Hero() {
  const [, setLocation] = useLocation();
  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');
  const [differentReturn, setDifferentReturn] = useState(false);
  const [pickupDate, setPickupDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [pickupTime, setPickupTime] = useState<TimePickerValue | null>({ hour: '12', minute: '00' });
  const [returnTime, setReturnTime] = useState<TimePickerValue | null>({ hour: '12', minute: '00' });
  
  // Autocomplete states
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showReturnSuggestions, setShowReturnSuggestions] = useState(false);
  const [selectedPickupIndex, setSelectedPickupIndex] = useState(-1);
  const [selectedReturnIndex, setSelectedReturnIndex] = useState(-1);
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const returnInputRef = useRef<HTMLInputElement>(null);
  const pickupContainerRef = useRef<HTMLDivElement>(null);
  const returnContainerRef = useRef<HTMLDivElement>(null);
  const pickupSuggestionsRef = useRef<HTMLDivElement>(null);
  const returnSuggestionsRef = useRef<HTMLDivElement>(null);

  // Filter locations based on input
  const filteredPickupLocations = useMemo(() => {
    if (!pickupLocation.trim()) return [];
    const query = pickupLocation.toLowerCase();
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query) ||
        loc.city.toLowerCase().includes(query)
    );
  }, [pickupLocation]);

  const filteredReturnLocations = useMemo(() => {
    if (!returnLocation.trim()) return [];
    const query = returnLocation.toLowerCase();
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query) ||
        loc.city.toLowerCase().includes(query)
    );
  }, [returnLocation]);

  // Handle location selection
  const selectPickupLocation = (location: Location) => {
    setPickupLocation(location.name);
    setShowPickupSuggestions(false);
    setSelectedPickupIndex(-1);
  };

  const selectReturnLocation = (location: Location) => {
    setReturnLocation(location.name);
    setShowReturnSuggestions(false);
    setSelectedReturnIndex(-1);
  };

  // Handle keyboard navigation for pickup
  const handlePickupKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showPickupSuggestions || filteredPickupLocations.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedPickupIndex((prev) =>
        prev < filteredPickupLocations.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedPickupIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedPickupIndex >= 0) {
        selectPickupLocation(filteredPickupLocations[selectedPickupIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowPickupSuggestions(false);
      setSelectedPickupIndex(-1);
    }
  };

  // Handle keyboard navigation for return
  const handleReturnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showReturnSuggestions || filteredReturnLocations.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedReturnIndex((prev) =>
        prev < filteredReturnLocations.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedReturnIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedReturnIndex >= 0) {
        selectReturnLocation(filteredReturnLocations[selectedReturnIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowReturnSuggestions(false);
      setSelectedReturnIndex(-1);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickupContainerRef.current &&
        !pickupContainerRef.current.contains(event.target as Node) &&
        pickupSuggestionsRef.current &&
        !pickupSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowPickupSuggestions(false);
      }
      if (
        returnContainerRef.current &&
        !returnContainerRef.current.contains(event.target as Node) &&
        returnSuggestionsRef.current &&
        !returnSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowReturnSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate number of days between pickup and return dates (inclusive - both days count)
  const rentalDays = useMemo(() => {
    if (!pickupDate || !returnDate) return 1;
    const diffDays = differenceInDays(returnDate, pickupDate);
    // Add 1 because both pickup and return days count in car rentals
    return Math.max(1, diffDays + 1);
  }, [pickupDate, returnDate]);

  const handleSearch = () => {
    if (!pickupLocation || !pickupDate || !returnDate) {
      return;
    }

    // Format time from TimePickerValue to HH:mm format
    const formatTime = (time: TimePickerValue | null): string => {
      if (!time) return '12:00';
      const hour = time.hour.padStart(2, '0');
      const minute = time.minute.padStart(2, '0');
      return `${hour}:${minute}`;
    };

    const params = new URLSearchParams({
      pickup: pickupLocation,
      return: differentReturn && returnLocation ? returnLocation : pickupLocation,
      pickupDate: format(pickupDate, 'yyyy-MM-dd'),
      returnDate: format(returnDate, 'yyyy-MM-dd'),
      pickupTime: formatTime(pickupTime),
      returnTime: formatTime(returnTime),
    });

    setLocation(`/search?${params.toString()}`);
  };

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/assets/hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
          
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Drive the Future of Tunisia
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-brand-100 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Rent premium vehicles or book your next excursion from Hammamet to anywhere in Tunisia
          </motion.p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="space-y-6">
              {/* Pickup & Return Location */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Pickup & Return
                </label>
                <div className="relative" ref={pickupContainerRef}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <Input
                    ref={pickupInputRef}
                    type="text"
                    placeholder="Airport, city or address"
                    value={pickupLocation}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPickupLocation(value);
                      if (value.trim()) {
                        setShowPickupSuggestions(true);
                      } else {
                        setShowPickupSuggestions(false);
                      }
                      setSelectedPickupIndex(-1);
                    }}
                    onFocus={() => {
                      if (filteredPickupLocations.length > 0) {
                        setShowPickupSuggestions(true);
                      }
                    }}
                    onKeyDown={handlePickupKeyDown}
                    className="pl-10 h-12 text-base"
                  />
                  {showPickupSuggestions && filteredPickupLocations.length > 0 && (
                    <div
                      ref={pickupSuggestionsRef}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                    >
                      {filteredPickupLocations.map((location, index) => (
                        <button
                          key={location.id}
                          type="button"
                          onClick={() => selectPickupLocation(location)}
                          className={cn(
                            "w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors",
                            index === selectedPickupIndex && "bg-gray-50"
                          )}
                        >
                          {location.type === 'airport' ? (
                            <Plane className="w-5 h-5 text-brand-600 flex-shrink-0" />
                          ) : (
                            <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {location.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {location.city}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {!differentReturn && (
                  <button
                    onClick={() => setDifferentReturn(true)}
                    className="mt-2 text-sm text-brand-600 hover:text-brand-700 font-medium"
                  >
                    + Different return location
                  </button>
                )}
                {differentReturn && (
                  <div className="mt-3 relative" ref={returnContainerRef}>
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <Input
                      ref={returnInputRef}
                      type="text"
                      placeholder="Return location"
                      value={returnLocation}
                      onChange={(e) => {
                        const value = e.target.value;
                        setReturnLocation(value);
                        if (value.trim()) {
                          setShowReturnSuggestions(true);
                        } else {
                          setShowReturnSuggestions(false);
                        }
                        setSelectedReturnIndex(-1);
                      }}
                      onFocus={() => {
                        if (filteredReturnLocations.length > 0) {
                          setShowReturnSuggestions(true);
                        }
                      }}
                      onKeyDown={handleReturnKeyDown}
                      className="pl-10 h-12 text-base"
                    />
                    <button
                      onClick={() => {
                        setDifferentReturn(false);
                        setReturnLocation('');
                        setShowReturnSuggestions(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    {showReturnSuggestions && filteredReturnLocations.length > 0 && (
                      <div
                        ref={returnSuggestionsRef}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                      >
                        {filteredReturnLocations.map((location, index) => (
                          <button
                            key={location.id}
                            type="button"
                            onClick={() => selectReturnLocation(location)}
                            className={cn(
                              "w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors",
                              index === selectedReturnIndex && "bg-gray-50"
                            )}
                          >
                            {location.type === 'airport' ? (
                              <Plane className="w-5 h-5 text-brand-600 flex-shrink-0" />
                            ) : (
                              <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {location.name}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {location.city}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dates and Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Pickup Date
                  </label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-12",
                            !pickupDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {pickupDate ? format(pickupDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={pickupDate}
                          onSelect={setPickupDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="border-2 border-transparent rounded-lg p-1 w-48 h-12 flex items-center justify-center overflow-hidden">
                      <TimePicker
                        value={pickupTime || { hour: '12', minute: '00' }}
                        onChange={(newTime) => setPickupTime(newTime)}
                        is24Hour={true}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Return Date
                  </label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-12",
                            !returnDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {returnDate ? format(returnDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={returnDate}
                          onSelect={setReturnDate}
                          disabled={(date) => 
                            pickupDate ? date < pickupDate : date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="border-2 border-transparent rounded-lg p-1 w-48 h-12 flex items-center justify-center overflow-hidden">
                      <TimePicker
                        value={returnTime || { hour: '12', minute: '00' }}
                        onChange={(newTime) => setReturnTime(newTime)}
                        is24Hour={true}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Show Cars Button */}
              <Button
                onClick={handleSearch}
                size="lg"
                className="w-full h-14 text-lg font-semibold shadow-lg"
                disabled={!pickupLocation || !pickupDate || !returnDate}
              >
                Show Cars
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-16 flex justify-center gap-12 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-300">10+</div>
            <div className="text-sm text-brand-100 mt-1">Premium Cars</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-300">20+</div>
            <div className="text-sm text-brand-100 mt-1">Destinations</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-300">500+</div>
            <div className="text-sm text-brand-100 mt-1">Happy Clients</div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-1.5 bg-white rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
      </motion.div>
    </div>
  );
}

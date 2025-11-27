import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Check, Car, User, CreditCard, CheckCircle2, Download, Plane, MapPin, Building2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import carsDataRaw from '@/data/cars.json';
import excursionsDataRaw from '@/data/excursions.json';
import { Car as CarType } from '@/types/schema';
import { Excursion } from '@/types/schema';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  createCarReservation, 
  createExcursionReservation, 
  createAirportTransferReservation,
  PaymentMethod,
  ReservationStatus
} from '@/lib/reservations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const carsData = carsDataRaw as CarType[];
const excursionsData = excursionsDataRaw as Excursion[];

// Country codes for phone numbers with flags
const countryCodes = [
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
];

export default function Booking() {
  const [location] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState('');
  const [searchParams, setSearchParams] = useState(window.location.search);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+216');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationality, setNationality] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [idType, setIdType] = useState<'id' | 'passport'>('id');
  const [idNumber, setIdNumber] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('agency');

  // Update search params when location changes
  useEffect(() => {
    setSearchParams(window.location.search);
  }, [location]);

  // Parse URL params - use searchParams state to get query string
  const bookingData = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    const type = params.get('type') || 'car';
    
    console.log('Booking page - URL search params:', searchParams);
    console.log('Booking page - Parsed params:', {
      type,
      carId: params.get('carId'),
      excursionId: params.get('excursionId'),
      airport: params.get('airport'),
      totalPrice: params.get('totalPrice'),
    });
    
    // If no search params, return null
    if (!searchParams || searchParams === '?' || searchParams === '') {
      console.log('No search params found');
      return null;
    }
    
    if (type === 'car') {
      const carId = params.get('carId');
      const car = carsData.find(c => c.id === carId);
      if (!car) return null;
      
      const pickupDate = params.get('pickupDate');
      const returnDate = params.get('returnDate');
      const pickupLocation = params.get('pickupLocation') || '';
      const returnLocation = params.get('returnLocation') || '';
      const addOns = params.get('addOns')?.split(',') || [];
      const totalPrice = parseInt(params.get('totalPrice') || '0');
      
      const days = pickupDate && returnDate 
        ? Math.max(1, Math.floor((new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
        : 1;
      
      return {
        type: 'car',
        car,
        pickupDate,
        returnDate,
        pickupLocation,
        returnLocation,
        addOns,
        totalPrice,
        days,
      };
    } else if (type === 'excursion') {
      const excursionId = params.get('excursionId');
      const excursion = excursionsData.find(e => e.id === excursionId);
      if (!excursion) return null;
      
      const date = params.get('date') || '';
      const persons = parseInt(params.get('persons') || '1');
      const carType = params.get('carType') || 'sedan';
      const addOns = params.get('addOns')?.split(',') || [];
      const totalPrice = parseInt(params.get('totalPrice') || '0');
      
      return {
        type: 'excursion',
        excursion,
        date,
        persons,
        carType,
        addOns,
        totalPrice,
      };
    } else if (type === 'airport-transfer') {
      const airport = params.get('airport') || '';
      const pickupLocation = params.get('pickupLocation') || '';
      const date = params.get('date') || '';
      const time = params.get('time') || '';
      const passengers = parseInt(params.get('passengers') || '1');
      const carPreference = params.get('carPreference') || 'sedan';
      const totalPrice = parseInt(params.get('totalPrice') || '0');
      
      return {
        type: 'airport-transfer',
        airport,
        pickupLocation,
        date,
        time,
        passengers,
        carPreference,
        totalPrice,
      };
    }
    
    return null;
  }, [searchParams]);

  const totalPrice = bookingData?.totalPrice || 0;

  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!bookingData) {
      return;
    }

    if (!customerName || !customerEmail || !phoneNumber || !nationality || !dateOfBirth || !idNumber) {
      const message = t('booking.missingDetails') || 'Please complete all required information before confirming.';
      setSubmissionError(message);
      toast({
        title: t('booking.missingDetails') || 'Missing details',
        description: message,
        variant: 'destructive',
      });
      setStep(2);
      return;
    }

    const status: ReservationStatus = paymentMethod === 'card' ? 'confirmed' : 'pending';
    const referenceCode = 'TND' + Math.random().toString(36).substr(2, 9).toUpperCase();

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      let savedReference = referenceCode;

      if (bookingData.type === 'car' && bookingData.car && bookingData.pickupDate) {
        const reservation = await createCarReservation({
          reference_code: referenceCode,
          car_id: bookingData.car.id,
          car_name: `${bookingData.car.name} ${bookingData.car.model}`,
          pickup_date: bookingData.pickupDate,
          return_date: bookingData.returnDate || null,
          pickup_location: bookingData.pickupLocation || '',
          return_location: bookingData.returnLocation || null,
          add_ons: bookingData.addOns ?? [],
          total_price: totalPrice,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: `${phonePrefix}${phoneNumber}`,
          driver_license: driverLicense || null,
          payment_method: paymentMethod,
          status,
        });
        savedReference = reservation.reference_code ?? reservation.id;
      } else if (bookingData.type === 'excursion' && bookingData.excursion && bookingData.date) {
        const reservation = await createExcursionReservation({
          reference_code: referenceCode,
          excursion_id: bookingData.excursion.id,
          excursion_title: bookingData.excursion.title,
          date: bookingData.date,
          persons: bookingData.persons,
          car_type: bookingData.carType,
          add_ons: bookingData.addOns ?? [],
          total_price: totalPrice,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: `${phonePrefix}${phoneNumber}`,
          payment_method: paymentMethod,
          status,
        });
        savedReference = reservation.reference_code ?? reservation.id;
      } else if (bookingData.type === 'airport-transfer' && bookingData.date) {
        const reservation = await createAirportTransferReservation({
          reference_code: referenceCode,
          airport: bookingData.airport || 'tunis-carthage',
          pickup_location: bookingData.pickupLocation || '',
          date: bookingData.date,
          time: bookingData.time || '',
          passengers: bookingData.passengers || 1,
          car_preference: bookingData.carPreference || 'sedan',
          total_price: totalPrice,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: `${phonePrefix}${phoneNumber}`,
          payment_method: paymentMethod,
          status,
        });
        savedReference = reservation.reference_code ?? reservation.id;
      } else {
        throw new Error('Booking data is incomplete. Please restart your reservation.');
      }

      setBookingId(savedReference);
      setStep(4);
      toast({
        title: 'Booking confirmed',
        description: `Reservation saved with reference ${savedReference}`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to confirm your booking. Please try again.';
      setSubmissionError(message);
      toast({
        title: 'Booking failed',
        description: message,
        variant: 'destructive',
      });
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const carTypeLabels = {
    sedan: 'Sedan',
    suv: 'SUV',
    minivan: 'Minivan',
  };

  const airportLabels = {
    'tunis-carthage': 'Tunis-Carthage',
    'enfidha': 'Enfidha-Hammamet',
    'monastir': 'Monastir',
  };

  const generatePDF = () => {
    if (!bookingData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Colors
    const primaryColor = [0, 123, 255]; // Blue
    const darkColor = [31, 41, 55]; // Dark gray
    const lightGray = [243, 244, 246]; // Light gray

    // Compact Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Logo/Company Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('JK CARS', margin, 18);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium Car Rental & Excursions | Hammamet, Tunisia', margin, 26);

    yPosition = 42;

    // Title
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('BOOKING CONFIRMATION', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    // Booking ID and Date (on same line)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Booking ID: ${bookingId}`, margin, yPosition);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 12;

    // Customer Information Section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('CUSTOMER INFORMATION', margin, yPosition);
    yPosition += 6;

    const customerData = [
      ['Full Name:', customerName],
      ['Email:', customerEmail],
      ['Phone:', `${phonePrefix}${phoneNumber}`],
    ];

    if (bookingData.type === 'car' && driverLicense) {
      customerData.push(['Driver\'s License:', driverLicense]);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: customerData,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Booking Details Section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('BOOKING DETAILS', margin, yPosition);
    yPosition += 6;

    let bookingDetailsData: string[][] = [];

    if (bookingData.type === 'car' && bookingData.car) {
      bookingDetailsData = [
        ['Service Type:', 'Car Rental'],
        ['Vehicle:', `${bookingData.car.name} - ${bookingData.car.model}`],
        ['Year:', bookingData.car.year.toString()],
        ['Pickup Location:', bookingData.pickupLocation.charAt(0).toUpperCase() + bookingData.pickupLocation.slice(1)],
        ['Return Location:', bookingData.returnLocation.charAt(0).toUpperCase() + bookingData.returnLocation.slice(1)],
        ['Pickup Date:', bookingData.pickupDate ? new Date(bookingData.pickupDate).toLocaleDateString() : 'N/A'],
        ['Return Date:', bookingData.returnDate ? new Date(bookingData.returnDate).toLocaleDateString() : 'N/A'],
        ['Rental Period:', `${bookingData.days} ${bookingData.days === 1 ? 'day' : 'days'}`],
      ];

      if (bookingData.addOns.length > 0) {
        const addOnLabels: { [key: string]: string } = {
          gps: 'GPS Navigation',
          babySeat: 'Baby Seat',
          insurance: 'Extra Insurance',
          driver: 'Driver Service',
        };
        bookingDetailsData.push(['Add-ons:', bookingData.addOns.map(a => addOnLabels[a] || a).join(', ')]);
      }
    } else if (bookingData.type === 'excursion' && bookingData.excursion) {
      bookingDetailsData = [
        ['Service Type:', 'Excursion'],
        ['Excursion:', bookingData.excursion.title],
        ['Destination:', bookingData.excursion.destination],
        ['Date:', bookingData.date ? new Date(bookingData.date).toLocaleDateString() : 'N/A'],
        ['Number of Persons:', bookingData.persons.toString()],
        ['Vehicle Type:', carTypeLabels[bookingData.carType as keyof typeof carTypeLabels]],
      ];

      if (bookingData.addOns.length > 0) {
        const addOnLabels: { [key: string]: string } = {
          guide: 'Professional Guide',
          lunch: 'Traditional Lunch',
          airport: 'Airport Drop-off',
        };
        bookingDetailsData.push(['Add-ons:', bookingData.addOns.map(a => addOnLabels[a] || a).join(', ')]);
      }
    } else if (bookingData.type === 'airport-transfer') {
      bookingDetailsData = [
        ['Service Type:', 'Airport Transfer'],
        ['Airport:', airportLabels[bookingData.airport as keyof typeof airportLabels]],
        ['Pickup/Drop-off Location:', (bookingData.pickupLocation || '').charAt(0).toUpperCase() + (bookingData.pickupLocation || '').slice(1)],
        ['Date:', bookingData.date ? new Date(bookingData.date).toLocaleDateString() : 'N/A'],
        ['Time:', bookingData.time || 'N/A'],
        ['Passengers:', (bookingData.passengers || 1).toString()],
        ['Vehicle:', carTypeLabels[bookingData.carPreference as keyof typeof carTypeLabels]],
      ];
    }

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: bookingDetailsData,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Payment Information Section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('PAYMENT INFORMATION', margin, yPosition);
    yPosition += 6;

    const paymentData = [
      ['Payment Method:', paymentMethod === 'card' ? 'Paid by Card' : 'Pay at Agency'],
      ['Total Amount:', `${totalPrice}DT`],
    ];

    if (paymentMethod === 'agency') {
      paymentData.push(['Payment Status:', 'Pending - To be paid at pickup']);
      paymentData.push(['Note:', 'Please bring valid ID and driver\'s license']);
    } else {
      paymentData.push(['Payment Status:', 'Paid']);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: paymentData,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 12;

    // Total Amount Highlight Box (more compact)
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(margin, yPosition - 3, pageWidth - (margin * 2), 15, 3, 3, 'F');
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Total Amount:', margin + 5, yPosition + 4);
    
    doc.setFontSize(18);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`${totalPrice}DT`, pageWidth - margin - 5, yPosition + 4, { align: 'right' });

    yPosition += 20;

    // Compact Footer
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for choosing JK Cars!', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 4;
    doc.text('Email: info@jkcars.tn | Phone: +216 XX XXX XXX | Hammamet, Tunisia', pageWidth / 2, yPosition, { align: 'center' });

    // Save PDF
    doc.save(`Booking_${bookingId}.pdf`);
  };

  const steps = [
    { number: 1, title: bookingData?.type === 'car' ? t('booking.carInfo') : bookingData?.type === 'excursion' ? t('booking.excursionInfo') : t('booking.transferInfo'), icon: Car },
    { number: 2, title: t('booking.yourDetails'), icon: User },
    { number: 3, title: t('booking.payment'), icon: CreditCard },
    { number: 4, title: t('booking.confirmation'), icon: CheckCircle2 },
  ];

  const progress = (step / 4) * 100;

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingData) {
      window.location.href = '/';
    }
  }, [bookingData]);

  if (!bookingData) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No booking data found</h2>
          <Button onClick={() => window.location.href = '/'}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const addOnPrices = {
    gps: 5,
    babySeat: 8,
    insurance: 15,
    driver: 40,
    guide: 30,
    lunch: 25,
    airport: 40,
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-brand-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('booking.completeBooking')}
          </h1>
        </motion.div>

        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.number}
                  className={`flex flex-col items-center ${
                    step >= s.number ? 'text-brand-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      step >= s.number
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                        : 'bg-gray-200'
                    }`}
                  >
                    {step > s.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{s.title}</span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-4">{t('booking.bookingSummary')}</h2>
                <div className="bg-brand-50 rounded-lg p-6">
                  {bookingData.type === 'car' && bookingData.car && (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={bookingData.car.images[0]}
                          alt={bookingData.car.name}
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="text-xl font-bold">{bookingData.car.name}</h3>
                          <p className="text-gray-600">{bookingData.car.model} • {bookingData.car.year}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pickup Location</span>
                          <span className="font-semibold capitalize">{bookingData.pickupLocation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Return Location</span>
                          <span className="font-semibold capitalize">{bookingData.returnLocation}</span>
                        </div>
                        {bookingData.pickupDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pickup Date</span>
                            <span className="font-semibold">{new Date(bookingData.pickupDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {bookingData.returnDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Return Date</span>
                            <span className="font-semibold">{new Date(bookingData.returnDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rental Period</span>
                          <span className="font-semibold">{bookingData.days} {bookingData.days === 1 ? 'day' : 'days'}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base Rental ({bookingData.days} {bookingData.days === 1 ? 'day' : 'days'} × {bookingData.car.discount ? Math.round(bookingData.car.price * (1 - bookingData.car.discount / 100)) : bookingData.car.price}DT)</span>
                          <span className="font-semibold">
                            {((bookingData.car.discount ? Math.round(bookingData.car.price * (1 - bookingData.car.discount / 100)) : bookingData.car.price) * bookingData.days)}DT
                          </span>
                        </div>
                        {bookingData.addOns.map((addon) => (
                          <div key={addon} className="flex justify-between">
                            <span className="text-gray-600">
                              {addon === 'gps' ? 'GPS Navigation' : 
                               addon === 'babySeat' ? 'Baby Seat' :
                               addon === 'insurance' ? 'Extra Insurance' :
                               addon === 'driver' ? 'Driver Service' : addon}
                            </span>
                            <span className="font-semibold">+{addOnPrices[addon as keyof typeof addOnPrices] * bookingData.days}DT</span>
                          </div>
                        ))}
                        <div className="border-t border-brand-200 pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-2xl text-brand-600">{totalPrice}DT</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {bookingData.type === 'excursion' && bookingData.excursion && (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={bookingData.excursion.image}
                          alt={bookingData.excursion.title}
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="text-xl font-bold">{bookingData.excursion.title}</h3>
                          <p className="text-gray-600">{bookingData.excursion.destination}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        {bookingData.date && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date</span>
                            <span className="font-semibold">{new Date(bookingData.date).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Number of Persons</span>
                          <span className="font-semibold">{bookingData.persons}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vehicle Type</span>
                          <span className="font-semibold">{carTypeLabels[bookingData.carType as keyof typeof carTypeLabels]}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Excursion ({bookingData.persons} {bookingData.persons === 1 ? 'person' : 'persons'} × {bookingData.excursion.price}DT)</span>
                          <span className="font-semibold">{bookingData.excursion.price * bookingData.persons}DT</span>
                        </div>
                        {bookingData.carType !== 'sedan' && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{carTypeLabels[bookingData.carType as keyof typeof carTypeLabels]} Upgrade</span>
                            <span className="font-semibold">
                              +{bookingData.carType === 'suv' ? 20 : 35}DT
                            </span>
                          </div>
                        )}
                        {bookingData.addOns.map((addon) => (
                          <div key={addon} className="flex justify-between">
                            <span className="text-gray-600">
                              {addon === 'guide' ? 'Professional Guide' : 
                               addon === 'lunch' ? 'Traditional Lunch' :
                               addon === 'airport' ? 'Airport Drop-off' : addon}
                            </span>
                            <span className="font-semibold">+{addOnPrices[addon as keyof typeof addOnPrices]}DT</span>
                          </div>
                        ))}
                        <div className="border-t border-brand-200 pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-2xl text-brand-600">{totalPrice}DT</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {bookingData.type === 'airport-transfer' && (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-32 h-24 bg-brand-100 rounded-lg flex items-center justify-center">
                          <Plane className="w-12 h-12 text-brand-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Airport Transfer</h3>
                          <p className="text-gray-600">{airportLabels[bookingData.airport as keyof typeof airportLabels]}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Airport</span>
                          <span className="font-semibold">{airportLabels[bookingData.airport as keyof typeof airportLabels]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pickup/Drop-off Location</span>
                          <span className="font-semibold capitalize">{bookingData.pickupLocation}</span>
                        </div>
                        {bookingData.date && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date</span>
                            <span className="font-semibold">{new Date(bookingData.date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {bookingData.time && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Time</span>
                            <span className="font-semibold">{bookingData.time}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Passengers</span>
                          <span className="font-semibold">{bookingData.passengers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vehicle</span>
                          <span className="font-semibold">{carTypeLabels[bookingData.carPreference as keyof typeof carTypeLabels]}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="border-t border-brand-200 pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-2xl text-brand-600">{totalPrice}DT</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <Button onClick={handleNextStep} className="w-full" size="lg" data-testid="button-next-step-1">
                  {t('booking.continueToDetails')}
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-4">{t('booking.yourDetails')}</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">{t('booking.fullName')}</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Mohamed Salah"
                      required
                      data-testid="input-customer-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">{t('booking.email')}</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="mohamed@gmail.com"
                      required
                      data-testid="input-customer-email"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="phonePrefix">{t('booking.phonePrefix')}</Label>
                      <Select value={phonePrefix} onValueChange={setPhonePrefix}>
                        <SelectTrigger id="phonePrefix" data-testid="select-phone-prefix" className="w-full">
                          <SelectValue placeholder={t('booking.phonePrefix')}>
                            {(() => {
                              const selected = countryCodes.find(cc => cc.code === phonePrefix);
                              if (selected) {
                                return (
                                  <div className="flex items-center gap-2">
                                    <span>{selected.flag}</span>
                                    <span>{selected.code}</span>
                                  </div>
                                );
                              }
                              return phonePrefix;
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] z-[100]">
                          {countryCodes.map((cc) => (
                            <SelectItem key={cc.code} value={cc.code} className="cursor-pointer">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{cc.flag}</span>
                                <span className="font-medium">{cc.code}</span>
                                <span className="text-muted-foreground text-sm ml-1">({cc.country})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="phoneNumber">{t('booking.phoneNumber')}</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="50123456"
                        required
                        data-testid="input-phone-number"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="nationality">{t('booking.nationality')}</Label>
                    <Input
                      id="nationality"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="Tunisian"
                      required
                      data-testid="input-nationality"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">{t('booking.dateOfBirth')}</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      min="1900-01-01"
                      required
                      data-testid="input-date-of-birth"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label>{t('booking.idType')}</Label>
                    <RadioGroup value={idType} onValueChange={(value) => setIdType(value as 'id' | 'passport')}>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="id" id="id-card" />
                          <Label htmlFor="id-card" className="cursor-pointer">{t('booking.idCard')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="passport" id="passport" />
                          <Label htmlFor="passport" className="cursor-pointer">{t('booking.passport')}</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="idNumber">{t('booking.idNumber')}</Label>
                    <Input
                      id="idNumber"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder={idType === 'id' ? '12345678' : 'A1234567'}
                      required
                      data-testid="input-id-number"
                    />
                  </div>
                  {bookingData.type === 'car' && (
                    <div>
                      <Label htmlFor="driverLicense">{t('booking.driverLicense')}</Label>
                      <Input
                        id="driverLicense"
                        value={driverLicense}
                        onChange={(e) => setDriverLicense(e.target.value)}
                        placeholder="TUN123456789"
                        required
                        data-testid="input-driver-license"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => setStep(1)} variant="outline" className="flex-1" data-testid="button-back-step-2">
                    {t('booking.back')}
                  </Button>
                  <Button onClick={handleNextStep} className="flex-1" data-testid="button-next-step-2">
                    {t('booking.continue')}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-4">{t('booking.paymentInfo')}</h2>
                
                {/* Pay at Agency Information */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-6 h-6 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{t('booking.payAtAgency')}</h3>
                      <p className="text-sm text-gray-700 mb-3">
                        {t('booking.payAtAgencyDesc')}
                      </p>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">{t('booking.paymentMethods')}:</span> {t('booking.cashOrCard')}</p>
                        <p><span className="font-medium">{t('booking.location')}:</span> {t('booking.agencyOffice')}</p>
                        <p><span className="font-medium">{t('booking.note')}:</span> {t('booking.bringValidId')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-brand-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{t('booking.totalAmount')}</span>
                    <span className="text-2xl font-bold text-brand-600">{totalPrice}DT</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{t('booking.toBePaidAtPickup')}</p>
                </div>

                {submissionError && (
                  <div className="bg-red-50 border border-red-200 text-sm text-red-700 rounded-lg p-3">
                    {submissionError}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button onClick={() => setStep(2)} variant="outline" className="flex-1" data-testid="button-back-step-3">
                    {t('booking.back')}
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    className="flex-1" 
                    data-testid="button-confirm-payment"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('booking.processing') : t('booking.confirmBooking')}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 mb-6 shadow-2xl shadow-green-500/30"
                >
                  <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
                </motion.div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('booking.bookingConfirmed')}</h2>
                <p className="text-gray-600 mb-6">{t('booking.bookingConfirmedDesc')}</p>
                
                <div className="bg-brand-50 rounded-lg p-6 mb-6 inline-block">
                  <div className="text-sm text-gray-600 mb-1">{t('booking.bookingId')}</div>
                  <div className="text-3xl font-bold text-brand-600" data-testid="text-booking-id">{bookingId}</div>
                </div>
                
                {/* Payment Method Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-2 text-gray-700">
                    <Building2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium">{t('booking.paymentPayAtAgency')}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    {t('booking.bringIdAndLicense')}
                  </p>
                </div>
                
                <p className="text-gray-600 mb-8">
                  {t('booking.confirmationEmail')} <span className="font-semibold">{customerEmail}</span>
                </p>
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    variant="outline" 
                    className="gap-2" 
                    onClick={generatePDF}
                    data-testid="button-download-pdf"
                  >
                    <Download className="w-4 h-4" />
                    {t('booking.downloadPDF')}
                  </Button>
                  <Button onClick={() => window.location.href = '/'} data-testid="button-back-home">
                    {t('booking.backToHome')}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

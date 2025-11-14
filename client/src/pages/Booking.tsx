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
import { Car as CarType } from '@shared/schema';
import { Excursion } from '@shared/schema';

const carsData = carsDataRaw as CarType[];
const excursionsData = excursionsDataRaw as Excursion[];

export default function Booking() {
  const [location] = useLocation();
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState('');
  const [searchParams, setSearchParams] = useState(window.location.search);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'agency'>('agency');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

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

  const handleSubmit = () => {
    const id = 'TND' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setBookingId(id);
    setStep(4);
    console.log('Booking completed:', { id, customerName, customerEmail, totalPrice });
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
      ['Phone:', customerPhone],
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
    { number: 1, title: bookingData?.type === 'car' ? 'Car Info' : bookingData?.type === 'excursion' ? 'Excursion Info' : 'Transfer Info', icon: Car },
    { number: 2, title: 'Your Details', icon: User },
    { number: 3, title: 'Payment', icon: CreditCard },
    { number: 4, title: 'Confirmation', icon: CheckCircle2 },
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
            Complete Your Booking
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
                <h2 className="text-2xl font-bold mb-4">Booking Summary</h2>
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
                  Continue to Details
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
                <h2 className="text-2xl font-bold mb-4">Your Details</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">Full Name</Label>
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
                    <Label htmlFor="customerEmail">Email Address</Label>
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
                  <div>
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+216 50 123 456"
                      required
                      data-testid="input-customer-phone"
                    />
                  </div>
                  {bookingData.type === 'car' && (
                    <div>
                      <Label htmlFor="driverLicense">Driver's License Number</Label>
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
                    Back
                  </Button>
                  <Button onClick={handleNextStep} className="flex-1" data-testid="button-next-step-2">
                    Continue to Payment
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
                <h2 className="text-2xl font-bold mb-4">Payment Information</h2>
                
                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Select Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'card' | 'agency')}>
                    <div className="space-y-3">
                      {/* Card Payment Option */}
                      <Label 
                        htmlFor="payment-card" 
                        className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <RadioGroupItem value="card" id="payment-card" className="mt-1" />
                        <div className="flex-1 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-brand-600" />
                            <div>
                              <div className="font-medium text-gray-900">Pay by Card</div>
                              <div className="text-sm text-gray-600 mt-1">
                                Secure online payment with credit or debit card
                              </div>
                            </div>
                          </div>
                        </div>
                      </Label>

                      {/* Pay at Agency Option */}
                      <Label 
                        htmlFor="payment-agency" 
                        className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <RadioGroupItem value="agency" id="payment-agency" className="mt-1" />
                        <div className="flex-1 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="font-medium text-gray-900">Pay at Agency</div>
                              <div className="text-sm text-gray-600 mt-1">
                                Pay in cash or card when you pick up your vehicle
                              </div>
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Card Payment Form - Only show if card is selected */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="5123 4567 8901 2346"
                        maxLength={19}
                        required={paymentMethod === 'card'}
                        data-testid="input-card-number"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardExpiry">Expiry Date</Label>
                        <Input
                          id="cardExpiry"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          required={paymentMethod === 'card'}
                          data-testid="input-card-expiry"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardCvv">CVV</Label>
                        <Input
                          id="cardCvv"
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123"
                          maxLength={3}
                          required={paymentMethod === 'card'}
                          data-testid="input-card-cvv"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Pay at Agency Information */}
                {paymentMethod === 'agency' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
                    <div className="flex items-start gap-3">
                      <Building2 className="w-6 h-6 text-green-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Pay at Agency</h3>
                        <p className="text-sm text-gray-700 mb-3">
                          You will pay when you pick up your vehicle at our agency location.
                        </p>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><span className="font-medium">Payment Methods:</span> Cash or Card</p>
                          <p><span className="font-medium">Location:</span> Our agency office</p>
                          <p><span className="font-medium">Note:</span> Please bring a valid ID and driver's license</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total Amount */}
                <div className="bg-brand-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-brand-600">{totalPrice}DT</span>
                  </div>
                  {paymentMethod === 'agency' && (
                    <p className="text-sm text-gray-600 mt-2">To be paid at pickup</p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => setStep(2)} variant="outline" className="flex-1" data-testid="button-back-step-3">
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    className="flex-1" 
                    data-testid="button-confirm-payment"
                    disabled={paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvv)}
                  >
                    {paymentMethod === 'card' ? 'Confirm Payment' : 'Confirm Booking'}
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
                
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-6">Your reservation has been successfully completed</p>
                
                <div className="bg-brand-50 rounded-lg p-6 mb-6 inline-block">
                  <div className="text-sm text-gray-600 mb-1">Booking ID</div>
                  <div className="text-3xl font-bold text-brand-600" data-testid="text-booking-id">{bookingId}</div>
                </div>
                
                {/* Payment Method Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-2 text-gray-700">
                    {paymentMethod === 'card' ? (
                      <>
                        <CreditCard className="w-5 h-5 text-brand-600" />
                        <span className="font-medium">Payment: Paid by Card</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Payment: Pay at Agency</span>
                      </>
                    )}
                  </div>
                  {paymentMethod === 'agency' && (
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      Please bring your ID and driver's license when picking up your vehicle
                    </p>
                  )}
                </div>
                
                <p className="text-gray-600 mb-8">
                  A confirmation email has been sent to <span className="font-semibold">{customerEmail}</span>
                </p>
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    variant="outline" 
                    className="gap-2" 
                    onClick={generatePDF}
                    data-testid="button-download-pdf"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                  <Button onClick={() => window.location.href = '/'} data-testid="button-back-home">
                    Back to Home
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

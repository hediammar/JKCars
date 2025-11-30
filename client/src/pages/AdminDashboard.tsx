import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { DateRange } from 'react-day-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  fetchAdminReservations,
  updateCarReservationStatus,
  updateExcursionReservationStatus,
  updateAirportReservationStatus,
  createCarReservation,
  createExcursionReservation,
  createAirportTransferReservation,
  type AdminReservationsPayload,
  type PaymentMethod,
  type ReservationStatus,
} from '@/lib/reservations';
import carsDataRaw from '@/data/cars.json';
import excursionsDataRaw from '@/data/excursions.json';
import type { Car as CarType, Excursion as ExcursionType } from '@/types/schema';
import {
  CalendarDays,
  ShieldCheck,
  LogOut,
  RefreshCw,
  Lock,
  Users2,
  Plus,
} from 'lucide-react';

type AdminEventType = 'car' | 'excursion' | 'airport';

interface AdminEvent {
  id: string;
  reference: string;
  type: AdminEventType;
  title: string;
  subtitle: string;
  startDate: string;
  endDate?: string | null;
  status: ReservationStatus;
  paymentMethod: PaymentMethod;
  customer: string;
  totalPrice: number;
}

const carsData = carsDataRaw as CarType[];
const excursionsData = excursionsDataRaw as ExcursionType[];

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'TND',
  minimumFractionDigits: 0,
}).format(value);

const generateReferenceCode = () => {
  return `REF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
};

const isDateWithinRange = (targetISO: string, startISO: string, endISO?: string | null) => {
  const target = dayjs(targetISO).startOf('day');
  const start = dayjs(startISO).startOf('day');
  const end = dayjs(endISO ?? startISO).startOf('day');
  return (
    target.isSame(start) ||
    target.isSame(end) ||
    (target.isAfter(start) && target.isBefore(end))
  );
};

const collectDateStrings = (startISO: string, endISO?: string | null) => {
  const result: string[] = [];
  let cursor = dayjs(startISO).startOf('day');
  const last = dayjs(endISO ?? startISO).startOf('day');

  while (cursor.isBefore(last) || cursor.isSame(last)) {
    result.push(cursor.format('YYYY-MM-DD'));
    cursor = cursor.add(1, 'day');
  }

  return result;
};

const statusVariants: Record<ReservationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border border-amber-200',
  confirmed: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  completed: 'bg-blue-100 text-blue-800 border border-blue-200',
  cancelled: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const statusLabels: Record<ReservationStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => new Date());
  const [selectedReservation, setSelectedReservation] = useState<AdminEvent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createReservationType, setCreateReservationType] = useState<'car' | 'excursion' | 'airport'>('car');
  const [createReservationDateRange, setCreateReservationDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedCarForAvailability, setSelectedCarForAvailability] = useState<CarType | null>(null);
  
  // Create reservation form state
  const [createForm, setCreateForm] = useState({
    // Car reservation
    car_id: '',
    pickup_date: '',
    return_date: '',
    pickup_location: '',
    return_location: '',
    add_ons: [] as string[],
    // Excursion reservation
    excursion_id: '',
    excursion_date: '',
    persons: 1,
    car_type: 'sedan',
    // Airport reservation
    airport: 'TUN',
    airport_date: '',
    airport_time: '',
    passengers: 1,
    car_preference: 'sedan',
    // Common
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    payment_method: 'card' as PaymentMethod,
    driver_license: '',
  });

  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setAuthLoading(false);
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const reservationsQuery = useQuery<AdminReservationsPayload>({
    queryKey: ['admin-reservations'],
    queryFn: fetchAdminReservations,
    enabled: !!session,
    refetchInterval: 60_000,
  });

  const events = useMemo<AdminEvent[]>(() => {
    if (!reservationsQuery.data) return [];
    const { carReservations, excursionReservations, airportReservations } = reservationsQuery.data;

    const carEvents: AdminEvent[] = carReservations.map((reservation) => ({
      id: reservation.id,
      reference: reservation.reference_code,
      type: 'car',
      title: reservation.car_name,
      subtitle: `${reservation.pickup_location} → ${reservation.return_location ?? reservation.pickup_location}`,
      startDate: reservation.pickup_date,
      endDate: reservation.return_date,
      status: reservation.status,
      paymentMethod: reservation.payment_method,
      customer: reservation.customer_name,
      totalPrice: reservation.total_price,
    }));

    const excursionEvents: AdminEvent[] = excursionReservations.map((reservation) => ({
      id: reservation.id,
      reference: reservation.reference_code,
      type: 'excursion',
      title: reservation.excursion_title,
      subtitle: `${reservation.persons} ${reservation.persons > 1 ? 'personnes' : 'personne'} • ${reservation.car_type === 'sedan' ? 'Berline' : reservation.car_type === 'suv' ? 'SUV' : 'Minibus'}`,
      startDate: reservation.date,
      endDate: reservation.date,
      status: reservation.status,
      paymentMethod: reservation.payment_method,
      customer: reservation.customer_name,
      totalPrice: reservation.total_price,
    }));

    const airportEvents: AdminEvent[] = airportReservations.map((reservation) => ({
      id: reservation.id,
      reference: reservation.reference_code,
      type: 'airport',
      title: `${reservation.airport.toUpperCase()} Transfer`,
      subtitle: `${reservation.pickup_location} • ${reservation.time}`,
      startDate: reservation.date,
      endDate: reservation.date,
      status: reservation.status,
      paymentMethod: reservation.payment_method,
      customer: reservation.customer_name,
      totalPrice: reservation.total_price,
    }));

    return [...carEvents, ...excursionEvents, ...airportEvents].sort((a, b) =>
      dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf()
    );
  }, [reservationsQuery.data]);

  const calendarData = useMemo(() => {
    if (!reservationsQuery.data) return [];
    const dateMap = new Map<string, { day: Date; events: Array<{ id: number; name: string; time: string; datetime: string; reservationId: string }> }>();
    
    events.forEach((event, index) => {
      const startDate = new Date(event.startDate);
      const dates = collectDateStrings(event.startDate, event.endDate);
      
      dates.forEach((dateStr) => {
        const date = new Date(dateStr);
        const dateKey = dateStr;
        
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { day: date, events: [] });
        }
        
        const eventTime = event.type === 'airport' 
          ? (reservationsQuery.data?.airportReservations.find(r => r.id === event.id)?.time || '')
          : dayjs(startDate).format('HH:mm');
        
        dateMap.get(dateKey)!.events.push({
          id: index,
          name: event.title,
          time: eventTime,
          datetime: startDate.toISOString(),
          reservationId: event.id,
        });
      });
    });
    
    return Array.from(dateMap.values());
  }, [reservationsQuery.data, events]);


  const selectedDayReservations = useMemo(() => {
    if (!selectedDate) return [];
    const target = dayjs(selectedDate).format('YYYY-MM-DD');
    return events.filter((event) => isDateWithinRange(target, event.startDate, event.endDate));
  }, [selectedDate, events]);

  const reservedCarIds = useMemo(() => {
    if (!reservationsQuery.data || !selectedDate) return new Set<string>();
    const target = dayjs(selectedDate).format('YYYY-MM-DD');
    const reserved = reservationsQuery.data.carReservations
      .filter((reservation) => isDateWithinRange(target, reservation.pickup_date, reservation.return_date))
      .map((reservation) => reservation.car_id);
    return new Set(reserved);
  }, [reservationsQuery.data, selectedDate]);

  const carAvailability = useMemo(() => {
    return carsData.map((car) => ({
      ...car,
      reserved: reservedCarIds.has(car.id),
    }));
  }, [reservedCarIds]);

  // Available cars for the selected date range in create dialog
  const availableCarsForDateRange = useMemo(() => {
    if (!createReservationDateRange?.from || !createReservationDateRange?.to || !reservationsQuery.data) {
      return [];
    }
    
    const startDate = dayjs(createReservationDateRange.from).format('YYYY-MM-DD');
    const endDate = dayjs(createReservationDateRange.to).format('YYYY-MM-DD');
    
    // Get all dates in the selected range
    const selectedDates: string[] = [];
    let currentDate = dayjs(startDate);
    const end = dayjs(endDate);
    while (currentDate.isBefore(end) || currentDate.isSame(end)) {
      selectedDates.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(1, 'day');
    }
    
    // Find cars that are reserved on any of the selected dates
    const reservedCarIds = new Set(
      reservationsQuery.data.carReservations
        .filter((reservation) => {
          const pickup = dayjs(reservation.pickup_date).format('YYYY-MM-DD');
          const returnDate = reservation.return_date 
            ? dayjs(reservation.return_date).format('YYYY-MM-DD')
            : pickup;
          
          // Check if reservation overlaps with any date in the selected range
          return selectedDates.some(date => isDateWithinRange(date, pickup, returnDate));
        })
        .map((reservation) => reservation.car_id)
    );
    
    return carsData.filter((car) => !reservedCarIds.has(car.id));
  }, [createReservationDateRange, reservationsQuery.data]);

  // Get available dates for a specific car
  const getCarAvailableDates = useMemo(() => {
    return (carId: string) => {
      if (!reservationsQuery.data) return [];
      
      const reservedDates = new Set<string>();
      reservationsQuery.data.carReservations
        .filter((reservation) => reservation.car_id === carId)
        .forEach((reservation) => {
          const dates = collectDateStrings(reservation.pickup_date, reservation.return_date);
          dates.forEach(date => reservedDates.add(date));
        });
      
      // Get dates for the next 90 days
      const availableDates: Date[] = [];
      const today = dayjs().startOf('day');
      for (let i = 0; i < 90; i++) {
        const date = today.add(i, 'day');
        const dateStr = date.format('YYYY-MM-DD');
        if (!reservedDates.has(dateStr)) {
          availableDates.push(date.toDate());
        }
      }
      
      return availableDates;
    };
  }, [reservationsQuery.data]);

  const summaryStats = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    const pending = events.filter((event) => event.status === 'pending').length;
    const todayCount = events.filter((event) => isDateWithinRange(today, event.startDate, event.endDate)).length;
    const upcoming = events.filter((event) => dayjs(event.startDate).isAfter(dayjs().subtract(1, 'day'))).length;

    return {
      pending,
      today: todayCount,
      upcoming,
    };
  }, [events]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      toast({
        title: 'Échec de la connexion',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setEmail('');
      setPassword('');
      toast({
        title: 'Bienvenue',
        description: 'Session administrateur sécurisée.',
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Déconnexion',
      description: 'Session terminée en toute sécurité.',
    });
  };

  const handleStatusUpdate = async (reservation: AdminEvent, newStatus: ReservationStatus) => {
    try {
      if (reservation.type === 'car') {
        await updateCarReservationStatus(reservation.id, newStatus);
      } else if (reservation.type === 'excursion') {
        await updateExcursionReservationStatus(reservation.id, newStatus);
      } else if (reservation.type === 'airport') {
        await updateAirportReservationStatus(reservation.id, newStatus);
      }
      
      await queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      const statusLabels: Record<ReservationStatus, string> = {
        pending: 'en attente',
        confirmed: 'confirmée',
        completed: 'terminée',
        cancelled: 'annulée',
      };
      toast({
        title: 'Statut mis à jour',
        description: `Le statut de la réservation a été changé en ${statusLabels[newStatus]}.`,
      });
    } catch (error) {
      toast({
        title: 'Échec de la mise à jour',
        description: error instanceof Error ? error.message : 'Échec de la mise à jour du statut de la réservation.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateReservation = async () => {
    try {
      const referenceCode = generateReferenceCode();
      
      if (createReservationType === 'car') {
        if (!createReservationDateRange?.from || !createReservationDateRange?.to) {
          throw new Error('Veuillez sélectionner une période (date de prise en charge et date de retour)');
        }
        if (!createForm.car_id) {
          throw new Error('Veuillez sélectionner une voiture');
        }
        
        const car = carsData.find(c => c.id === createForm.car_id);
        if (!car) throw new Error('Voiture introuvable');
        
        const pickupDate = dayjs(createReservationDateRange.from).format('YYYY-MM-DD');
        const returnDate = dayjs(createReservationDateRange.to).format('YYYY-MM-DD');
        const days = dayjs(createReservationDateRange.to).diff(dayjs(createReservationDateRange.from), 'day') + 1;
        const totalPrice = car.price * days;
        
        await createCarReservation({
          reference_code: referenceCode,
          car_id: createForm.car_id,
          car_name: `${car.name} ${car.model}`,
          pickup_date: pickupDate,
          return_date: returnDate,
          pickup_location: createForm.pickup_location,
          return_location: createForm.return_location || null,
          add_ons: createForm.add_ons,
          total_price: totalPrice,
          customer_name: createForm.customer_name,
          customer_email: createForm.customer_email,
          customer_phone: createForm.customer_phone,
          driver_license: createForm.driver_license || null,
          payment_method: createForm.payment_method,
          status: 'pending',
        });
      } else if (createReservationType === 'excursion') {
        const excursion = excursionsData.find(e => e.id === createForm.excursion_id);
        if (!excursion) throw new Error('Excursion introuvable');
        
        const basePrice = createForm.persons <= 3 ? excursion.price : (excursion.price3 || excursion.price);
        const carTypePrices = { sedan: 0, suv: 20, minivan: 35 };
        const totalPrice = basePrice + (carTypePrices[createForm.car_type as keyof typeof carTypePrices] || 0);
        
        await createExcursionReservation({
          reference_code: referenceCode,
          excursion_id: createForm.excursion_id,
          excursion_title: excursion.title,
          date: createForm.excursion_date,
          persons: createForm.persons,
          car_type: createForm.car_type,
          add_ons: createForm.add_ons,
          total_price: totalPrice,
          customer_name: createForm.customer_name,
          customer_email: createForm.customer_email,
          customer_phone: createForm.customer_phone,
          payment_method: createForm.payment_method,
          status: 'pending',
        });
      } else if (createReservationType === 'airport') {
        const airportPrices = { sedan: 50, suv: 70, minivan: 90 };
        const totalPrice = airportPrices[createForm.car_preference as keyof typeof airportPrices] || 50;
        
        await createAirportTransferReservation({
          reference_code: referenceCode,
          airport: createForm.airport,
          pickup_location: createForm.pickup_location,
          date: createForm.airport_date,
          time: createForm.airport_time,
          passengers: createForm.passengers,
          car_preference: createForm.car_preference,
          total_price: totalPrice,
          customer_name: createForm.customer_name,
          customer_email: createForm.customer_email,
          customer_phone: createForm.customer_phone,
          payment_method: createForm.payment_method,
          status: 'pending',
        });
      }
      
      await queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      setIsCreateDialogOpen(false);
      setCreateReservationDateRange(undefined);
      setCreateForm({
        car_id: '',
        pickup_date: '',
        return_date: '',
        pickup_location: '',
        return_location: '',
        add_ons: [],
        excursion_id: '',
        excursion_date: '',
        persons: 1,
        car_type: 'sedan',
        airport: 'TUN',
        airport_date: '',
        airport_time: '',
        passengers: 1,
        car_preference: 'sedan',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        payment_method: 'card',
        driver_license: '',
      });
      const typeLabels: Record<'car' | 'excursion' | 'airport', string> = {
        car: 'location de voiture',
        excursion: 'excursion',
        airport: 'transfert aéroport',
      };
      toast({
        title: 'Réservation créée',
        description: `Nouvelle réservation de ${typeLabels[createReservationType]} créée avec succès.`,
      });
    } catch (error) {
      toast({
        title: 'Échec de la création',
        description: error instanceof Error ? error.message : 'Échec de la création de la réservation.',
        variant: 'destructive',
      });
    }
  };

  const getReservationDetails = (reservation: AdminEvent) => {
    if (!reservationsQuery.data) return null;
    
    if (reservation.type === 'car') {
      return reservationsQuery.data.carReservations.find(r => r.id === reservation.id);
    } else if (reservation.type === 'excursion') {
      return reservationsQuery.data.excursionReservations.find(r => r.id === reservation.id);
    } else if (reservation.type === 'airport') {
      return reservationsQuery.data.airportReservations.find(r => r.id === reservation.id);
    }
    return null;
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Sécurisation du canal administrateur…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl">Accès Back Office</CardTitle>
            <p className="text-sm text-gray-500">
              L'authentification multi-facteurs est requise. Utilisez vos identifiants administrateur Supabase.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              {authError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                  {authError}
                </div>
              )}
              <Button type="submit" className="w-full">
                Connexion sécurisée
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Astuce : Restreignez cette route avec VPN + Supabase RLS pour une sécurité maximale.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-widest text-brand-600 mb-2">Back Office</p>
          <h1 className="text-3xl font-bold text-gray-900">Centre de Contrôle des Opérations</h1>
          <p className="text-gray-600 mt-2">
            Surveillez les réservations, la capacité de la flotte et les excursions en temps réel.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => reservationsQuery.refetch()}
            disabled={reservationsQuery.isFetching}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${reservationsQuery.isFetching ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button variant="destructive" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Approbations en attente</p>
              <p className="text-2xl font-semibold">{summaryStats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Réservations d'aujourd'hui</p>
              <p className="text-2xl font-semibold">{summaryStats.today}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Users2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Réservations à venir</p>
              <p className="text-2xl font-semibold">{summaryStats.upcoming}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Calendrier et File Quotidienne</CardTitle>
                <p className="text-sm text-gray-500">Sélectionnez une date pour examiner toutes les réservations de ce jour.</p>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Nouvelle Réservation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <FullScreenCalendar
                data={calendarData}
                onDayClick={(day) => setSelectedDate(day)}
                onNewEventClick={() => setIsCreateDialogOpen(true)}
                onEventClick={(event) => {
                  // Find the reservation by ID if available, otherwise by name
                  const matchingReservation = event.reservationId
                    ? events.find(e => String(e.id) === String(event.reservationId))
                    : events.find(e => e.title === event.name);
                  if (matchingReservation) {
                    setSelectedReservation(matchingReservation);
                  }
                }}
              />
            </div>
            {selectedDate && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    Réservations pour le {dayjs(selectedDate).format('D MMMM YYYY')}
                  </h3>
                  <Badge variant="outline">{selectedDayReservations.length} programmée{selectedDayReservations.length > 1 ? 's' : ''}</Badge>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {selectedDayReservations.length === 0 && (
                    <p className="text-sm text-gray-500">Aucune réservation pour la date sélectionnée.</p>
                  )}
                  {selectedDayReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="border rounded-lg p-3 space-y-1 bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedReservation(reservation)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">{reservation.title}</div>
                        <Badge className={statusVariants[reservation.status]}>
                          {statusLabels[reservation.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{reservation.subtitle}</p>
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>{reservation.customer}</span>
                        <span>{formatCurrency(reservation.totalPrice)}</span>
                      </div>
                      <div className="text-xs text-gray-400">Ref: {reservation.reference}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Disponibilité de la Flotte</CardTitle>
            <p className="text-sm text-gray-500">
              Vue en temps réel des véhicules bloqués à la date sélectionnée.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {carAvailability.slice(0, 8).map((car) => (
              <div 
                key={car.id} 
                className="flex items-center justify-between text-sm border-b pb-3 last:border-b-0 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                onClick={() => setSelectedCarForAvailability(car)}
              >
                <div>
                  <p className="font-semibold">{car.name}</p>
                  <p className="text-xs text-gray-500">{car.model}</p>
                </div>
                <Badge className={car.reserved ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}>
                  {car.reserved ? 'Réservé' : 'Disponible'}
                </Badge>
              </div>
            ))}
            {carAvailability.length > 8 && (
              <p className="text-xs text-gray-500 text-center">
                Affichage de {carAvailability.slice(0, 8).length} sur {carAvailability.length} véhicules.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2">
          <CardTitle>Registre des Réservations</CardTitle>
          <p className="text-sm text-gray-500">
            Vue consolidée de toutes les locations de voitures, excursions et transferts aéroport.
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium capitalize">{reservation.type}</TableCell>
                  <TableCell>{reservation.reference}</TableCell>
                  <TableCell>{reservation.customer}</TableCell>
                  <TableCell>
                    {dayjs(reservation.startDate).format('MMM D')} → {dayjs(reservation.endDate ?? reservation.startDate).format('MMM D')}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusVariants[reservation.status]}>
                      {statusLabels[reservation.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(reservation.totalPrice)}</TableCell>
                </TableRow>
              ))}
              {events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    Aucune réservation pour le moment. Une fois les réservations créées, elles apparaîtront ici instantanément.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reservation Details Dialog */}
      <Dialog open={!!selectedReservation} onOpenChange={(open) => !open && setSelectedReservation(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la Réservation</DialogTitle>
            <DialogDescription>
              Consultez et gérez les informations de la réservation
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (() => {
            const details = getReservationDetails(selectedReservation);
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Code de Référence</Label>
                    <p className="font-semibold">{selectedReservation.reference}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Statut</Label>
                    <div className="mt-1">
                      <Select
                        value={selectedReservation.status}
                        onValueChange={(value) => handleStatusUpdate(selectedReservation, value as ReservationStatus)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="confirmed">Confirmée</SelectItem>
                          <SelectItem value="completed">Terminée</SelectItem>
                          <SelectItem value="cancelled">Annulée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {details && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500">Nom du Client</Label>
                        <p className="font-medium">{details.customer_name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Email du Client</Label>
                        <p className="font-medium">{details.customer_email}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Téléphone du Client</Label>
                        <p className="font-medium">{details.customer_phone}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Méthode de Paiement</Label>
                        <p className="font-medium capitalize">{details.payment_method === 'card' ? 'Carte' : 'Agence'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Prix Total</Label>
                        <p className="font-medium">{formatCurrency(details.total_price)}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Créé le</Label>
                        <p className="font-medium">{dayjs(details.created_at).format('MMM D, YYYY HH:mm')}</p>
                      </div>
                    </div>

                    {selectedReservation.type === 'car' && 'car_id' in details && (
                      <div className="space-y-2 border-t pt-4">
                        <h4 className="font-semibold">Détails de la Location de Voiture</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-gray-500">Voiture</Label>
                            <p className="font-medium">{selectedReservation.title}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Date de Prise en Charge</Label>
                            <p className="font-medium">{dayjs('pickup_date' in details ? details.pickup_date : '').format('D MMM YYYY')}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Date de Retour</Label>
                            <p className="font-medium">
                              {'return_date' in details && details.return_date
                                ? dayjs(details.return_date).format('D MMM YYYY')
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Lieu de Prise en Charge</Label>
                            <p className="font-medium">{'pickup_location' in details ? details.pickup_location : 'N/A'}</p>
                          </div>
                          {'driver_license' in details && details.driver_license && (
                            <div>
                              <Label className="text-xs text-gray-500">Permis de Conduire</Label>
                              <p className="font-medium">{details.driver_license}</p>
                            </div>
                          )}
                          {'add_ons' in details && details.add_ons && details.add_ons.length > 0 && (
                            <div>
                              <Label className="text-xs text-gray-500">Options Supplémentaires</Label>
                              <p className="font-medium">{details.add_ons.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedReservation.type === 'excursion' && 'excursion_id' in details && (
                      <div className="space-y-2 border-t pt-4">
                        <h4 className="font-semibold">Détails de l'Excursion</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-gray-500">Excursion</Label>
                            <p className="font-medium">{selectedReservation.title}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Date</Label>
                            <p className="font-medium">{dayjs('date' in details ? details.date : '').format('D MMM YYYY')}</p>
                          </div>
                          {'persons' in details && (
                            <div>
                              <Label className="text-xs text-gray-500">Personnes</Label>
                              <p className="font-medium">{details.persons}</p>
                            </div>
                          )}
                          {'car_type' in details && (
                            <div>
                              <Label className="text-xs text-gray-500">Type de Voiture</Label>
                              <p className="font-medium capitalize">{details.car_type === 'sedan' ? 'Berline' : details.car_type === 'suv' ? 'SUV' : 'Minibus'}</p>
                            </div>
                          )}
                          {'add_ons' in details && details.add_ons && details.add_ons.length > 0 && (
                            <div>
                              <Label className="text-xs text-gray-500">Options Supplémentaires</Label>
                              <p className="font-medium">{details.add_ons.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedReservation.type === 'airport' && 'airport' in details && (
                      <div className="space-y-2 border-t pt-4">
                        <h4 className="font-semibold">Détails du Transfert Aéroport</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-gray-500">Aéroport</Label>
                            <p className="font-medium">{details.airport}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Date</Label>
                            <p className="font-medium">{dayjs('date' in details ? details.date : '').format('D MMM YYYY')}</p>
                          </div>
                          {'time' in details && (
                            <div>
                              <Label className="text-xs text-gray-500">Heure</Label>
                              <p className="font-medium">{details.time}</p>
                            </div>
                          )}
                          {'passengers' in details && (
                            <div>
                              <Label className="text-xs text-gray-500">Passagers</Label>
                              <p className="font-medium">{details.passengers}</p>
                            </div>
                          )}
                          {'car_preference' in details && (
                            <div>
                              <Label className="text-xs text-gray-500">Préférence de Voiture</Label>
                              <p className="font-medium capitalize">{details.car_preference === 'sedan' ? 'Berline' : details.car_preference === 'suv' ? 'SUV' : 'Minibus'}</p>
                            </div>
                          )}
                          {'pickup_location' in details && (
                            <div>
                              <Label className="text-xs text-gray-500">Lieu de Prise en Charge</Label>
                              <p className="font-medium">{details.pickup_location}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Create Reservation Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une Nouvelle Réservation</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle réservation au système
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type de Réservation</Label>
              <Select
                value={createReservationType}
                onValueChange={(value) => {
                  setCreateReservationType(value as 'car' | 'excursion' | 'airport');
                  setCreateReservationDateRange(undefined);
                  setCreateForm({ ...createForm, car_id: '', pickup_date: '', return_date: '' });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Location de Voiture</SelectItem>
                  <SelectItem value="excursion">Excursion</SelectItem>
                  <SelectItem value="airport">Transfert Aéroport</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {createReservationType === 'car' && (
              <>
                <div>
                  <Label className="mb-3 block">
                    Période de Location * (Date de Prise en Charge - Date de Retour)
                  </Label>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <Calendar
                      mode="range"
                      selected={createReservationDateRange}
                      onSelect={setCreateReservationDateRange}
                      disabled={(date: Date) => date < new Date()}
                      numberOfMonths={1}
                      className="rounded-lg"
                    />
                  </div>
                  {createReservationDateRange?.from && createReservationDateRange?.to && (
                    <p className="text-xs text-gray-500 mt-2">
                      {availableCarsForDateRange.length} voiture{availableCarsForDateRange.length > 1 ? 's' : ''} disponible{availableCarsForDateRange.length > 1 ? 's' : ''} pour cette période
                    </p>
                  )}
                </div>
                {createReservationDateRange?.from && createReservationDateRange?.to && (
                  <div>
                    <Label>Voiture *</Label>
                    <Select
                      value={createForm.car_id}
                      onValueChange={(value) => setCreateForm({ ...createForm, car_id: value })}
                      disabled={availableCarsForDateRange.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          availableCarsForDateRange.length === 0 
                            ? "Aucune voiture disponible pour cette période" 
                            : "Sélectionnez une voiture"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCarsForDateRange.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-gray-500">
                            Aucune voiture disponible pour cette période
                          </div>
                        ) : (
                          availableCarsForDateRange.map((car) => (
                            <SelectItem key={car.id} value={car.id}>
                              {car.name} {car.model} - {formatCurrency(car.price)}/jour
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date de Retour</Label>
                    <Input
                      type="date"
                      value={createForm.return_date}
                      onChange={(e) => setCreateForm({ ...createForm, return_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Lieu de Prise en Charge *</Label>
                    <Input
                      value={createForm.pickup_location}
                      onChange={(e) => setCreateForm({ ...createForm, pickup_location: e.target.value })}
                      placeholder="ex. : Tunis"
                    />
                  </div>
                  <div>
                    <Label>Lieu de Retour</Label>
                    <Input
                      value={createForm.return_location}
                      onChange={(e) => setCreateForm({ ...createForm, return_location: e.target.value })}
                      placeholder="ex. : Tunis"
                    />
                  </div>
                </div>
                <div>
                  <Label>Permis de Conduire</Label>
                  <Input
                    value={createForm.driver_license}
                    onChange={(e) => setCreateForm({ ...createForm, driver_license: e.target.value })}
                    placeholder="Numéro de permis de conduire"
                  />
                </div>
              </>
            )}

            {createReservationType === 'excursion' && (
              <>
                <div>
                  <Label>Excursion *</Label>
                  <Select
                    value={createForm.excursion_id}
                    onValueChange={(value) => setCreateForm({ ...createForm, excursion_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une excursion" />
                    </SelectTrigger>
                    <SelectContent>
                      {excursionsData.map((excursion) => (
                        <SelectItem key={excursion.id} value={excursion.id}>
                          {excursion.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={createForm.excursion_date}
                      onChange={(e) => setCreateForm({ ...createForm, excursion_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Personnes *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={createForm.persons}
                      onChange={(e) => setCreateForm({ ...createForm, persons: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Type de Voiture *</Label>
                  <Select
                    value={createForm.car_type}
                    onValueChange={(value) => setCreateForm({ ...createForm, car_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Berline</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="minivan">Minibus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {createReservationType === 'airport' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Aéroport *</Label>
                    <Select
                      value={createForm.airport}
                      onValueChange={(value) => setCreateForm({ ...createForm, airport: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TUN">Tunis-Carthage (TUN)</SelectItem>
                        <SelectItem value="MIR">Monastir (MIR)</SelectItem>
                        <SelectItem value="DJE">Djerba (DJE)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={createForm.airport_date}
                      onChange={(e) => setCreateForm({ ...createForm, airport_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Heure *</Label>
                    <Input
                      type="time"
                      value={createForm.airport_time}
                      onChange={(e) => setCreateForm({ ...createForm, airport_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Passagers *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={createForm.passengers}
                      onChange={(e) => setCreateForm({ ...createForm, passengers: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Préférence de Voiture *</Label>
                    <Select
                      value={createForm.car_preference}
                      onValueChange={(value) => setCreateForm({ ...createForm, car_preference: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedan">Berline</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="minivan">Minibus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Lieu de Prise en Charge *</Label>
                    <Input
                      value={createForm.pickup_location}
                      onChange={(e) => setCreateForm({ ...createForm, pickup_location: e.target.value })}
                      placeholder="ex. : Nom de l'hôtel ou adresse"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="border-t pt-4 space-y-4">
              <h4 className="font-semibold">Informations Client</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom du Client *</Label>
                  <Input
                    value={createForm.customer_name}
                    onChange={(e) => setCreateForm({ ...createForm, customer_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email du Client *</Label>
                  <Input
                    type="email"
                    value={createForm.customer_email}
                    onChange={(e) => setCreateForm({ ...createForm, customer_email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Téléphone du Client *</Label>
                  <Input
                    value={createForm.customer_phone}
                    onChange={(e) => setCreateForm({ ...createForm, customer_phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Méthode de Paiement *</Label>
                  <Select
                    value={createForm.payment_method}
                    onValueChange={(value) => setCreateForm({ ...createForm, payment_method: value as PaymentMethod })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Carte</SelectItem>
                      <SelectItem value="agency">Agence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateReservation}
              disabled={createReservationType === 'car' && (!createReservationDateRange?.from || !createReservationDateRange?.to || !createForm.car_id)}
            >
              Créer la Réservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Car Availability Calendar Dialog */}
      <Dialog open={!!selectedCarForAvailability} onOpenChange={(open) => !open && setSelectedCarForAvailability(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Disponibilité - {selectedCarForAvailability?.name} {selectedCarForAvailability?.model}</DialogTitle>
            <DialogDescription>
              Calendrier des dates disponibles pour cette voiture (90 prochains jours)
            </DialogDescription>
          </DialogHeader>
          {selectedCarForAvailability && (() => {
            const availableDates = getCarAvailableDates(selectedCarForAvailability.id);
            return (
              <div className="space-y-4">
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <Calendar
                    mode="multiple"
                    selected={availableDates}
                    disabled={(date: Date) => {
                      const dateStr = dayjs(date).format('YYYY-MM-DD');
                      return !availableDates.some(ad => dayjs(ad).format('YYYY-MM-DD') === dateStr);
                    }}
                    numberOfMonths={2}
                    className="rounded-lg"
                    modifiers={{
                      available: availableDates,
                    }}
                    modifiersClassNames={{
                      available: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
                    }}
                  />
                </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#f6b21b] border border-emerald-300 rounded"></div>
                  <span>Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                  <span>Réservé</span>
                </div>
              </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}


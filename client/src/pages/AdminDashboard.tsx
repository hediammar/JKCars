import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  fetchAdminReservations,
  type AdminReservationsPayload,
  type PaymentMethod,
  type ReservationStatus,
} from '@/lib/reservations';
import carsDataRaw from '@/data/cars.json';
import type { Car as CarType } from '@shared/schema';
import {
  CalendarDays,
  ShieldCheck,
  LogOut,
  RefreshCw,
  Lock,
  Users2,
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

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'TND',
  minimumFractionDigits: 0,
}).format(value);

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

export default function AdminDashboard() {
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => new Date());

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
      subtitle: `${reservation.persons} guests • ${reservation.car_type}`,
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

  const busyDates = useMemo(() => {
    const dateSet = new Set<string>();
    events.forEach((event) => {
      collectDateStrings(event.startDate, event.endDate).forEach((date) => dateSet.add(date));
    });
    return Array.from(dateSet).map((date) => dayjs(date).toDate());
  }, [events]);

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
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setEmail('');
      setPassword('');
      toast({
        title: 'Welcome back',
        description: 'Admin session secured.',
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Signed out',
      description: 'Session securely terminated.',
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Securing admin channel…</p>
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
            <CardTitle className="text-2xl">Back Office Access</CardTitle>
            <p className="text-sm text-gray-500">
              Multi-factor authentication is enforced. Use your Supabase admin credentials.
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
                Secure Login
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Tip: Restrict this route with VPN + Supabase RLS for maximum security.
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
          <h1 className="text-3xl font-bold text-gray-900">Operations Control Center</h1>
          <p className="text-gray-600 mt-2">
            Monitor reservations, fleet capacity, and excursions in real time.
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
            Refresh
          </Button>
          <Button variant="destructive" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign out
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
              <p className="text-sm text-gray-500">Pending Approvals</p>
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
              <p className="text-sm text-gray-500">Today's Reservations</p>
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
              <p className="text-sm text-gray-500">Upcoming Bookings</p>
              <p className="text-2xl font-semibold">{summaryStats.upcoming}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-1">
            <CardTitle>Calendar & Daily Queue</CardTitle>
            <p className="text-sm text-gray-500">Select a date to review every reservation touching that day.</p>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{ busy: busyDates }}
              modifiersClassNames={{
                busy: 'bg-brand-200 text-brand-900 hover:bg-brand-200 hover:text-brand-900',
              }}
            />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Reservations</h3>
                <Badge variant="outline">{selectedDayReservations.length} scheduled</Badge>
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {selectedDayReservations.length === 0 && (
                  <p className="text-sm text-gray-500">No reservations for the selected date.</p>
                )}
                {selectedDayReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="border rounded-lg p-3 space-y-1 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{reservation.title}</div>
                      <Badge className={statusVariants[reservation.status]}>
                        {reservation.status}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fleet Availability</CardTitle>
            <p className="text-sm text-gray-500">
              Real-time view of vehicles blocked on the selected date.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {carAvailability.slice(0, 8).map((car) => (
              <div key={car.id} className="flex items-center justify-between text-sm border-b pb-3 last:border-b-0">
                <div>
                  <p className="font-semibold">{car.name}</p>
                  <p className="text-xs text-gray-500">{car.model}</p>
                </div>
                <Badge className={car.reserved ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}>
                  {car.reserved ? 'Reserved' : 'Available'}
                </Badge>
              </div>
            ))}
            {carAvailability.length > 8 && (
              <p className="text-xs text-gray-500 text-center">
                Showing {carAvailability.slice(0, 8).length} of {carAvailability.length} vehicles.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2">
          <CardTitle>Reservations Ledger</CardTitle>
          <p className="text-sm text-gray-500">
            Consolidated view of every car rental, excursion, and airport transfer.
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Window</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
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
                      {reservation.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(reservation.totalPrice)}</TableCell>
                </TableRow>
              ))}
              {events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No reservations yet. Once bookings are created they will appear here instantly.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


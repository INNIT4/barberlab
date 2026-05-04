export type Barber = {
  id: string;
  name: string;
  initials: string;
  role: string;
  avatarTone: string;
  phone: string;
  servicesCount: number;
  appointmentsThisWeek: number;
  active: boolean;
};

export type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  priceMxn: number;
  category: "Corte" | "Barba" | "Combo" | "Extras";
  active: boolean;
};

export type Customer = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  email?: string;
  visits: number;
  lastVisit: string;
  favoriteService: string;
  ltv: number;
  tag?: "VIP" | "Nuevo" | "Regular";
};

export type Appointment = {
  id: string;
  time: string;
  endTime: string;
  customer: string;
  service: string;
  barberId: string;
  priceMxn: number;
  status: "confirmada" | "pendiente" | "completada";
  durationMinutes: number;
};

export const BARBERS: Barber[] = [
  {
    id: "tony",
    name: "Tony Méndez",
    initials: "TM",
    role: "Founder · Barbero principal",
    avatarTone: "oklch(0.9 0.06 25)",
    phone: "+52 662 123 4567",
    servicesCount: 6,
    appointmentsThisWeek: 34,
    active: true,
  },
  {
    id: "memo",
    name: "Memo Ruiz",
    initials: "MR",
    role: "Barbero senior",
    avatarTone: "oklch(0.9 0.05 150)",
    phone: "+52 662 222 3344",
    servicesCount: 5,
    appointmentsThisWeek: 28,
    active: true,
  },
  {
    id: "carlos",
    name: "Carlos Valenzuela",
    initials: "CV",
    role: "Barbero",
    avatarTone: "oklch(0.9 0.05 80)",
    phone: "+52 662 333 5566",
    servicesCount: 4,
    appointmentsThisWeek: 21,
    active: true,
  },
];

export const SERVICES: Service[] = [
  { id: "s1", name: "Corte clásico", durationMinutes: 30, priceMxn: 180, category: "Corte", active: true },
  { id: "s2", name: "Corte + barba", durationMinutes: 45, priceMxn: 280, category: "Combo", active: true },
  { id: "s3", name: "Fade americano", durationMinutes: 40, priceMxn: 220, category: "Corte", active: true },
  { id: "s4", name: "Arreglo de barba", durationMinutes: 20, priceMxn: 120, category: "Barba", active: true },
  { id: "s5", name: "Diseño y navaja", durationMinutes: 30, priceMxn: 180, category: "Extras", active: true },
  { id: "s6", name: "Corte niño", durationMinutes: 25, priceMxn: 130, category: "Corte", active: true },
  { id: "s7", name: "Delineado", durationMinutes: 15, priceMxn: 80, category: "Extras", active: false },
];

export const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Luis Herrera", initials: "LH", phone: "+52 662 987 6543", email: "luis@example.com", visits: 14, lastVisit: "Hace 6 días", favoriteService: "Corte + barba", ltv: 3920, tag: "VIP" },
  { id: "c2", name: "Daniel Ruiz", initials: "DR", phone: "+52 662 456 7890", visits: 8, lastVisit: "Hace 2 semanas", favoriteService: "Fade americano", ltv: 1760, tag: "Regular" },
  { id: "c3", name: "Mario Castro", initials: "MC", phone: "+52 662 111 2222", email: "mario.c@example.com", visits: 22, lastVisit: "Hace 3 días", favoriteService: "Corte + barba", ltv: 6160, tag: "VIP" },
  { id: "c4", name: "Andrés Vega", initials: "AV", phone: "+52 662 333 4444", visits: 2, lastVisit: "Hace 1 mes", favoriteService: "Corte niño", ltv: 260, tag: "Nuevo" },
  { id: "c5", name: "Raúl Félix", initials: "RF", phone: "+52 662 555 6666", visits: 11, lastVisit: "Hoy", favoriteService: "Corte clásico", ltv: 1980, tag: "Regular" },
  { id: "c6", name: "Jorge Valdez", initials: "JV", phone: "+52 662 777 8888", visits: 1, lastVisit: "Hoy", favoriteService: "Corte clásico", ltv: 180, tag: "Nuevo" },
  { id: "c7", name: "Sergio Ayala", initials: "SA", phone: "+52 662 999 0000", email: "s.ayala@example.com", visits: 18, lastVisit: "Hace 1 semana", favoriteService: "Fade americano", ltv: 3960, tag: "VIP" },
];

export const APPOINTMENTS_TODAY: Appointment[] = [
  { id: "a1", time: "09:00", endTime: "09:30", customer: "Luis Herrera", service: "Corte clásico", barberId: "tony", priceMxn: 180, status: "completada", durationMinutes: 30 },
  { id: "a2", time: "09:30", endTime: "10:15", customer: "Daniel Ruiz", service: "Corte + barba", barberId: "tony", priceMxn: 280, status: "completada", durationMinutes: 45 },
  { id: "a3", time: "10:30", endTime: "11:10", customer: "Raúl Félix", service: "Fade americano", barberId: "memo", priceMxn: 220, status: "confirmada", durationMinutes: 40 },
  { id: "a4", time: "11:00", endTime: "11:30", customer: "Jorge Valdez", service: "Corte clásico", barberId: "tony", priceMxn: 180, status: "confirmada", durationMinutes: 30 },
  { id: "a5", time: "11:30", endTime: "11:50", customer: "Mario Castro", service: "Arreglo de barba", barberId: "carlos", priceMxn: 120, status: "confirmada", durationMinutes: 20 },
  { id: "a6", time: "12:30", endTime: "13:15", customer: "Sergio Ayala", service: "Corte + barba", barberId: "memo", priceMxn: 280, status: "pendiente", durationMinutes: 45 },
  { id: "a7", time: "13:30", endTime: "14:00", customer: "Andrés Vega", service: "Corte niño", barberId: "carlos", priceMxn: 130, status: "confirmada", durationMinutes: 30 },
  { id: "a8", time: "15:00", endTime: "15:30", customer: "Pablo Soto", service: "Corte clásico", barberId: "tony", priceMxn: 180, status: "confirmada", durationMinutes: 30 },
  { id: "a9", time: "15:30", endTime: "16:15", customer: "Fernando López", service: "Corte + barba", barberId: "memo", priceMxn: 280, status: "confirmada", durationMinutes: 45 },
  { id: "a10", time: "16:30", endTime: "17:00", customer: "Iván Morales", service: "Fade americano", barberId: "tony", priceMxn: 220, status: "pendiente", durationMinutes: 30 },
];

export const WEEKLY_REVENUE = [
  { day: "Lun", revenue: 2840 },
  { day: "Mar", revenue: 3120 },
  { day: "Mié", revenue: 2580 },
  { day: "Jue", revenue: 3940 },
  { day: "Vie", revenue: 4520 },
  { day: "Sáb", revenue: 5960 },
  { day: "Dom", revenue: 0 },
];

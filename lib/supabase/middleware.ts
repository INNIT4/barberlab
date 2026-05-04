import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DASHBOARD_PREFIXES = [
  "/agenda",
  "/barberos",
  "/servicios",
  "/clientes",
  "/gastos",
  "/reportes",
  "/ajustes",
];

const AUTH_PREFIXES = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isDashboard = DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuth = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  // Protege el dashboard — sin sesión, redirige a login
  if (isDashboard && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Si ya hay sesión y entra a /login o /signup, lo mandamos a /agenda
  if (isAuth && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/agenda";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

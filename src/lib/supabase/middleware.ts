import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {

  let supabaseResponse = NextResponse.next({ request });

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

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ======================
  // ADMIN SESSION
  // ======================
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ======================
  // CUSTOMER SESSION
  // ======================
  const customerSession = request.cookies.get("customer");

  const pathname = request.nextUrl.pathname;

  // ======================
  // PROTECT DASHBOARD ADMIN
  // ======================
  if (pathname.startsWith("/dashboard")) {

    // jika bukan admin
    if (!user) {

      // tapi dia customer → redirect customer
      if (customerSession) {
        const url = request.nextUrl.clone();
        url.pathname = "/customer";
        return NextResponse.redirect(url);
      }

      // tidak login sama sekali
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // ======================
  // PROTECT DASHBOARD CUSTOMER
  // ======================
  if (pathname.startsWith("/customer")) {

    // jika tidak ada customer session
    if (!customerSession) {

      // tapi admin login
      if (user) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }

      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
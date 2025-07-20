// app/api/provider/dashboard/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Verify environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase environment variables not configured')
    }

    // Get authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )

    // Verify token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Fetch data
    const [bookings, services, reviews, stats] = await Promise.all([
      fetchUpcomingBookings(supabase, user.id),
      fetchServices(supabase, user.id),
      fetchReviews(supabase, user.id),
      fetchStats(supabase, user.id)
    ])

    return NextResponse.json({
      bookings,
      services,
      reviews,
      stats
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// Keep your existing helper functions...

// Keep the same helper functions (fetchUpcomingBookings, fetchServices, etc.)
// from previous examples// Helper functions remain the same as previous implementation
async function fetchUpcomingBookings(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      scheduled_at,
      status,
      quoted_price,
      address,
      user_notes,
      user:users(name, email),
      service:services(title)
    `)
    .eq('user_id', userId)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(5)

  if (error) throw error

  return data.map((booking: unknown) => ({
    id: booking.id,
    client: booking.user?.name || booking.user?.email?.split('@')[0] || 'Client',
    service: booking.service?.title || 'Service',
    date: new Date(booking.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    time: new Date(booking.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    status: booking.status,
    price: booking.quoted_price,
    address: booking.address,
    notes: booking.user_notes
  }))
}

async function fetchServices(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('services')
    .select(`
      id,
      title,
      base_price,
      starting_from_price,
      category,
      is_active
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) throw error

  return data.map((service: any) => ({
    id: service.id,
    name: service.title,
    rate: service.base_price ? `₹${service.base_price}/service` : 
          service.starting_from_price ? `From ₹${service.starting_from_price}` : 'Custom pricing',
    status: service.is_active ? 'Active' : 'Inactive',
    category: service.category
  }))
}

async function fetchReviews(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      booking:bookings(
        user:users(name, email),
        service:services(title)
      )
    `)
    .eq('booking.service.user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) throw error

  return data.map((review: any) => ({
    id: review.id,
    client: review.booking?.user?.name || review.booking?.user?.email?.split('@')[0] || 'Client',
    comment: review.comment || 'No comment provided',
    rating: review.rating,
    date: new Date(review.created_at).toLocaleDateString(),
    service: review.booking?.service?.title || 'Service'
  }))
}

async function fetchStats(supabase: any, userId: string) {
  const { count: bookingCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('scheduled_at', new Date().toISOString())

  const { data: earningsData } = await supabase
    .from('bookings')
    .select('quoted_price')
    .eq('user_id', userId)
    .eq('status', 'COMPLETED')

  const earnings = earningsData?.reduce((sum, booking) => sum + (booking.quoted_price || 0), 0) || 0

  const { data: ratingData } = await supabase
    .from('reviews')
    .select('rating')
    .eq('booking.service.user_id', userId)

  const avgRating = ratingData?.length 
    ? ratingData.reduce((sum, review) => sum + review.rating, 0) / ratingData.length
    : 0

  return {
    bookingCount: bookingCount || 0,
    earnings,
    rating: parseFloat(avgRating.toFixed(1))
  }
}
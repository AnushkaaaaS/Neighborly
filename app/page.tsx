// app/page.tsx
import Link from "next/link";
import { PlayCircle, Users, Handshake, Star, Heart, Home, Wrench, BookOpen, Smartphone, Search, MessageSquare } from "lucide-react";

export default function HomePage() {
  return (
    <main className="bg-slate-900 text-slate-100">
      {/* ===== Warm Navbar ===== */}
      <nav className="fixed w-full z-20 top-0 left-0 bg-slate-950/95 shadow-md flex justify-between items-center px-4 py-3 sm:px-8 sm:py-4">
        <h1 className="text-xl sm:text-2xl font-bold">
          <span className="text-emerald-400">Neighborly</span>
        </h1>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <Link href="/signup" className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-md font-medium text-sm transition">
            Book Now
          </Link>
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-6 font-medium">
          <li>
            <a href="#hero" className="hover:text-emerald-400 transition">Home</a>
          </li>
          <li>
            <a href="#about" className="hover:text-emerald-400 transition">About</a>
          </li>
          <li>
            <a href="#services" className="hover:text-emerald-400 transition">Services</a>
          </li>
          <li>
            <a href="#how-it-works" className="hover:text-emerald-400 transition">How It Works</a>
          </li>
          <li>
            <Link href="/signup" className="hover:text-emerald-400 font-medium transition">Become a Helper</Link>
          </li>
        </ul>
        <Link
          href="/signup"
          className="hidden md:block bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-md font-medium transition"
        >
          Book Now
        </Link>
      </nav>

         {/* ===== Hero ===== */}
      <section className="relative h-screen flex items-center justify-center text-center px-6" id="hero">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
        >
          <source src="/neighborhood.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70"></div>

        <div className="relative z-10 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            <span className="text-emerald-400">Neighborly</span><br />Local Help You Can Trust
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-8">
            Find trusted neighbors for home repairs, tutoring, tech help & more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link 
              href="/signup" 
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 sm:px-6 sm:py-4 rounded-lg font-medium text-base sm:text-lg shadow-lg flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5" /> Find Help Nearby
            </Link>
             <Link 
              href="/signup" 
              className="border border-slate-200 text-slate-200 hover:bg-slate-200 hover:text-slate-900 px-5 py-3 sm:px-6 sm:py-4 rounded-lg font-medium text-base sm:text-lg transition flex items-center justify-center gap-2"
            >
              <Handshake className="w-5 h-5" /> Offer Your Skills
            </Link>
          </div>
        </div>
      </section>

      {/* ===== About Section ===== */}
      <section id="about" className="py-16 sm:py-24 bg-slate-950/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 sm:gap-12 px-4 sm:px-6">
          <div className="md:w-1/2">
            <img
              src="https://images.pexels.com/photos/4247767/pexels-photo-4247767.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Neighbors helping each other"
              className="rounded-xl shadow-lg object-cover w-full h-full"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">About Neighborly</h2>
            <p className="text-slate-200 text-base sm:text-lg mb-4">
              Neighborly brings back the old-fashioned way of helping each other out, but with modern convenience.
            </p>
            <p className="text-slate-400 text-sm sm:text-base">
              It's not about professional services - it's about that home cook who makes extra meals, the retired teacher who tutors kids, or your neighbor who's great at fixing things. Real help from real people in your community.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm sm:text-base text-emerald-400">
              <Heart className="w-5 h-5" />
              <span>Building community, one helpful connection at a time</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Services ===== */}
      <section id="services" className="py-16 sm:py-24 bg-slate-950/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12">Everyday Help From Neighbors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                title: "Home Help", 
                description: "Minor repairs, gardening, pet care, or help moving furniture", 
                icon: <Home className="w-8 h-8 text-emerald-400" />
              },
              { 
                title: "Handy Helpers", 
                description: "Basic plumbing, painting, or assembling furniture", 
                icon: <Wrench className="w-8 h-8 text-emerald-400" />
              },
              { 
                title: "Learning Help", 
                description: "Homework help, language practice, or music lessons", 
                icon: <BookOpen className="w-8 h-8 text-emerald-400" />
              },
              { 
                title: "Tech Help", 
                description: "Setting up devices, troubleshooting, or teaching tech skills", 
                icon: <Smartphone className="w-8 h-8 text-emerald-400" />
              },
              { 
                title: "Food & More", 
                description: "Homemade meals, baking, or grocery pickup", 
                icon: <Heart className="w-8 h-8 text-emerald-400" />
              },
              { 
                title: "Rides & Errands", 
                description: "Local rides, prescription pickup, or post office runs", 
                icon: <Handshake className="w-8 h-8 text-emerald-400" />
              }
            ].map((service) => (
              <div 
                key={service.title} 
                className="group bg-slate-800/50 hover:bg-slate-800/70 p-6 rounded-xl border border-slate-700 hover:border-emerald-400/30 transition-all"
              >
                <div className="bg-emerald-500/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-500/20 transition">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-slate-300">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-slate-950/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">How Neighborly Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Browse Local Helpers",
                description: "Discover neighbors offering help in your area",
                icon: <Search className="w-10 h-10 text-emerald-400" />
              },
              {
                title: "Request Help",
                description: "Message directly to arrange help that works for both",
                icon: <MessageSquare className="w-10 h-10 text-emerald-400" />
              },
              {
                title: "Connect & Help",
                description: "Build relationships while helping each other",
                icon: <Heart className="w-10 h-10 text-emerald-400" />
              }
            ].map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="bg-emerald-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Reviews ===== */}
      <section id="reviews" className="py-16 sm:py-24 bg-slate-950/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12">What Neighbors Are Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Priya M.",
                review: "Found a lovely neighbor who cooks extra meals twice a week. It's been a lifesaver after my surgery!",
                role: "Home-cooked meals",
                image: "https://randomuser.me/api/portraits/women/44.jpg"
              },
              {
                name: "Rahul T.",
                review: "My son needed math help and we found a retired teacher just three streets away. So much better than a tutoring center!",
                role: "Homework help",
                image: "https://randomuser.me/api/portraits/men/32.jpg"
              },
              {
                name: "Ananya & Sanjay",
                review: "Our go-to for pet sitting when we travel. We return the favor by sharing vegetables from our garden.",
                role: "Pet care exchange",
                image: "https://randomuser.me/api/portraits/women/68.jpg"
              }
            ].map((testimonial) => (
              <div 
                key={testimonial.name} 
                className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-emerald-400/30 transition"
              >
                <div className="flex items-center justify-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full border-2 border-emerald-400 object-cover"
                  />
                </div>
                <p className="text-slate-200 mb-4 italic">"{testimonial.review}"</p>
                <h4 className="font-bold text-emerald-400">{testimonial.name}</h4>
                <p className="text-sm text-slate-400">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Become Helper CTA ===== */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-900/30 to-slate-950 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">
            Have a skill to share? Join our community!
          </h3>
          <p className="text-slate-200 mb-6 sm:mb-8">
            Whether it's a few hours a week or just occasionally, your skills can make a real difference to neighbors nearby.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition flex items-center justify-center gap-2"
            >
              <Handshake className="w-5 h-5" /> Become a Helper
            </Link>
            <Link
              href="/signup"
              className="border border-slate-200 text-slate-200 hover:bg-slate-200 hover:text-slate-900 px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5" /> Find Help Nearby
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-slate-950 py-8 text-center text-slate-400 text-sm sm:text-base">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-2">Neighborly</h2>
            <p className="text-slate-300">Real help from real neighbors</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-6">
            <Link href="#about" className="hover:text-emerald-400 transition">About</Link>
            <Link href="#services" className="hover:text-emerald-400 transition">Services</Link>
            <Link href="#how-it-works" className="hover:text-emerald-400 transition">How It Works</Link>
            <Link href="/signup" className="hover:text-emerald-400 transition">Become a Helper</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Neighborly. Bringing communities together.</p>
        </div>
      </footer>
    </main>
  );
}
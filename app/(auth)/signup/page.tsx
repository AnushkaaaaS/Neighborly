'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadScript } from "@react-google-maps/api";
import LocationAutocomplete from "@/components/LocationAutoComplete";
import {
  FiUser, FiMail, FiLock, FiMapPin, FiBriefcase, FiAward, FiInfo
} from "react-icons/fi";
import { Toaster, toast } from "sonner";
import { supabase } from "@lib/supabase";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export default function Signup() {
  const [isProvider, setIsProvider] = useState(false);
  const [location, setLocation] = useState("");
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => /.+@.+\..+/.test(email);
  const validatePassword = (pass: string) => pass.length >= 6;

  useEffect(() => {
    const interval = setInterval(() => {
      const pacItems = document.querySelectorAll('.pac-container, .pac-item, .pac-item-query');
      pacItems.forEach(el => {
        (el as HTMLElement).style.backgroundColor = '#1e293b';
        (el as HTMLElement).style.color = '#ffffff';
      });
    }, 100);
    setTimeout(() => clearInterval(interval), 1000);
  }, []);

  const handleSignup = async () => {
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;
    const fullName = (document.getElementById("name") as HTMLInputElement).value;
    const serviceType = isProvider ? (document.getElementById("service-type") as HTMLSelectElement).value : null;
    const experience = isProvider ? (document.getElementById("experience") as HTMLInputElement)?.value : null;
    const bio = isProvider ? (document.getElementById("bio") as HTMLInputElement)?.value : null;

    if (!fullName.trim()) return toast.error("Full name is required.");
    if (!validateEmail(email)) return toast.error("Please enter a valid email address.");
    if (!validatePassword(password)) return toast.error("Password must be at least 6 characters long.");
    if (!location) return toast.error("Location is required.");

    const { data: existingUser } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

    if (existingUser) {
      toast.error("An account with this email already exists. Please log in.");
      return;
    }

    const redirectToUrl = `http://localhost:3000/${isProvider ? "provider/dashboard" : "user/dashboard"}`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectToUrl,
        data: {
          full_name: fullName,
          location,
          is_provider: isProvider,
          service_type: serviceType,
          experience,
          bio,
        },
      },
    });

    if (error || !data.user) {
      toast.error("Signup failed: " + (error?.message || "Unknown error"));
      return;
    }

    const saveRes = await fetch("/api/save-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: data.user.id,
        email,
        name: fullName,
        location,
        is_provider: isProvider,
        service_type: serviceType,
        experience,
        bio,
      }),
    });

    if (saveRes.ok) {
      toast.success("Success! Please check your email to confirm your account.");
    } else {
      toast.error("Signup succeeded but saving to database failed.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full overflow-auto">
      <Toaster position="top-center" richColors />
      <style>{`
        .pac-container {
          background-color: #1e293b !important;
          color: white !important;
          border: 1px solid #334155;
        }
        .pac-item {
          background-color: #1e293b !important;
          color: white !important;
        }
        .pac-item:hover {
          background-color: #334155 !important;
        }
        .pac-item-query {
          color: #22d3ee !important;
        }
      `}</style>

      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-slate-800 to-slate-900 w-1/2 p-10">
        <img src="/img.svg" alt="Illustration" className="w-full max-w-md h-auto animate-fadeIn" />
        <h2 className="text-white text-3xl font-bold mt-6 text-center leading-snug">
          Find help or offer your skills <br /> in your neighborhood.
        </h2>
        <p className="text-slate-400 text-lg mt-4 text-center max-w-md">
          Join a trusted community where people help each other grow. Whether you're offering services or seeking support — Neighborly connects you locally.
        </p>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-16 py-20 bg-slate-900">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Create your Neighborly account
          </h1>
          <p className="text-slate-400 mt-3 text-base">
            It only takes a minute to join and connect with your community
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className={`space-y-5 ${isProvider ? 'md:col-span-1' : 'md:col-span-2'}`}>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300 flex items-center gap-2"><FiUser /> Full Name</Label>
              <Input id="name" placeholder="John Doe" className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 flex items-center gap-2"><FiMail /> Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 flex items-center gap-2"><FiLock /> Password</Label>
              <Input id="password" type="password" placeholder="••••••••" className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-300 flex items-center gap-2"><FiMapPin /> Location</Label>
              {mapsLoaded ? (
                <LoadScript
                  googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                  libraries={["places"]}
                  onLoad={() => setMapsLoaded(true)}
                  onError={() => setMapsLoaded(false)}
                >
                  <LocationAutocomplete
                    onSelect={(loc) => setLocation(loc)}
                    inputClassName="bg-slate-800 border-slate-700 text-white"
                  />
                </LoadScript>
              ) : (
                <Input
                  id="fallback-location"
                  placeholder="Enter your location"
                  className="bg-slate-800 border-slate-700 text-white"
                  onChange={(e) => setLocation(e.target.value)}
                />
              )}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="provider" onChange={(e) => setIsProvider(e.target.checked)} className="accent-emerald-400 w-4 h-4" />
              <Label htmlFor="provider" className="text-slate-300 text-sm">I'm a service provider</Label>
            </div>
          </div>

          {isProvider && (
            <div className="space-y-5 md:col-span-1">
              <div className="space-y-2">
                <Label htmlFor="service-type" className="text-slate-300 flex items-center gap-2"><FiBriefcase /> Service Type</Label>
                <select
  id="service-type"
  className="bg-slate-800 border-slate-700 text-white w-full px-3 py-2 rounded"
>
  <option value="">What services do you offer?</option>
  <option value="COOKING_HELP">Cooking Help</option>
  <option value="TUTORING">Tutoring</option>
  <option value="RIDES_AND_ERRANDS">Rides & Errands</option>
  <option value="CREATIVE_HELP">Creative Help</option>
  <option value="HOME_REPAIRS">Home Repairs</option>
  <option value="CLEANING">Cleaning</option>
  <option value="PET_CARE">Pet Care</option>
  <option value="MOVING_HELP">Moving Help</option>
  <option value="OTHER">Other</option>
</select>

              </div>
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-slate-300 flex items-center gap-2"><FiAward /> How many years are you doing this?</Label>
                <Input id="experience" type="number" className="bg-slate-800 border-slate-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-slate-300 flex items-center gap-2"><FiInfo /> Short Bio</Label>
                <Input id="bio" placeholder="Tell us more about your help" className="bg-slate-800 border-slate-700 text-white" />
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 space-y-4">
          <Button
            onClick={handleSignup}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-lg"
          >
            Sign Up
          </Button>
          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

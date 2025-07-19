'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "@lib/supabase";
import { toast, Toaster } from "sonner";

export default function Login() {
  const router = useRouter();

  const validateEmail = (email: string) => /.+@.+\..+/.test(email);
  const validatePassword = (pass: string) => pass.length >= 6;

  const handleLogin = async () => {
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;

    if (!validateEmail(email)) return toast.error("Please enter a valid email address.");
    if (!validatePassword(password)) return toast.error("Password must be at least 6 characters long.");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("Login failed: " + error.message);
    } else {
      toast.success("Welcome back!");
      const user = data.user;
      const isProvider = user?.user_metadata?.is_provider;
      router.push(isProvider ? "/provider/dashboard" : "/user/dashboard");
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/complete-profile`,
      },
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-900 text-white">
      <Toaster position="top-center" richColors />

      {/* Left - Illustration and Description */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-slate-800 to-slate-900 w-1/2 p-10">
        <img
          src="/img.svg"
          alt="Login illustration"
          className="w-full max-w-md h-auto"
        />
        <h2 className="text-white text-3xl font-bold mt-6 text-center leading-snug">
          Reconnect with your community <br /> with just a login.
        </h2>
        <p className="text-slate-400 text-lg mt-4 text-center max-w-md">
          Welcome back! Log in to access your dashboard and connect with your neighborhood.
        </p>
      </div>

      {/* Right - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-16 py-20">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Welcome Back to Neighborly
          </h1>
          <p className="text-slate-400 mt-3 text-base">
            Login to continue helping or getting help in your area.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-lg"
          >
            Log In
          </Button>



        

          <p className="text-center text-sm text-slate-400 mt-6">
            Don’t have an account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

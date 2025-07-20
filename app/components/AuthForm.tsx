'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ServiceType } from '@prisma/client'
import { supabase } from "@lib/supabase";

type AuthFormProps = {
  type: 'login' | 'signup'
}

export function AuthForm({ type }: AuthFormProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [step, setStep] = useState(1)
  const [isProvider, setIsProvider] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'CUSTOMER',
    businessName: '',
    serviceTypes: [] as ServiceType[],
    address: {
      street: '',
      city: '',
      state: '',
      zip: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
    supabase.auth.getSession().then(({ error }) => {
      if (error) console.error('Supabase connection check:', error)
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name in formData.address) {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleServiceTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    setFormData(prev => {
      const serviceTypes = checked
        ? [...prev.serviceTypes, value as ServiceType]
        : prev.serviceTypes.filter(type => type !== value)
      return { ...prev, serviceTypes }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      setIsProvider(formData.role === 'PROVIDER')
      setStep(2)
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (type === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (error) throw error
        router.refresh()
        router.push('/dashboard')
      } else {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              phone: formData.phone,
              role: formData.role
            },
            emailRedirectTo: `${location.origin}/auth/callback`
          }
        })

        if (authError) throw authError

        // Create provider profile if needed
        if (formData.role === 'PROVIDER' && authData.user) {
          const { error: profileError } = await supabase
            .from('provider_profiles')
            .insert({
              userId: authData.user.id,
              businessName: formData.businessName,
              serviceTypes: formData.serviceTypes,
              address: formData.address
            })

          if (profileError) throw profileError
        }

        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
      }
    } catch (err: unknown) {
      setError(
        err.message.includes('Email rate limit exceeded') 
          ? 'Too many attempts. Please try again later.'
          : err.message || 'Authentication failed. Please try again.'
      )
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isMounted) return null

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          <div className="font-medium">Error</div>
          <div>{error}</div>
          <button 
            onClick={() => setError(null)}
            className="mt-1 text-sm text-red-600 hover:text-red-800"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}

      {step === 1 && (
        <>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Account Type</label>
              <div className="mt-1 grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="role"
                    value="CUSTOMER"
                    checked={formData.role === 'CUSTOMER'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>I need services (Customer)</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="role"
                    value="PROVIDER"
                    checked={formData.role === 'PROVIDER'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>I provide services (Provider)</span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`flex w-full justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Continue
          </button>
        </>
      )}

      {step === 2 && isProvider && (
        <>
          <div className="space-y-4">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                value={formData.businessName}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Services Offered</label>
              <div className="mt-2 space-y-2">
                {Object.values(ServiceType).map((service) => (
                  <label key={service} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="serviceTypes"
                      value={service}
                      checked={formData.serviceTypes.includes(service)}
                      onChange={handleServiceTypeChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{service.charAt(0) + service.slice(1).toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Business Address</label>
              <input
                name="street"
                placeholder="Street"
                value={formData.address.street}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  name="city"
                  placeholder="City"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  name="state"
                  placeholder="State"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  name="zip"
                  placeholder="ZIP Code"
                  value={formData.address.zip}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating account...' : 'Complete Registration'}
            </button>
          </div>
        </>
      )}
    </form>
  )
}
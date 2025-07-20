'use client';

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const SERVICE_TAGS: Record<string, string[]> = {
  PLUMBER: ["Leak Fixing", "Bathroom Fitting", "Tap Installation", "Drain Cleaning", "Water Tank Installation"],
  ELECTRICIAN: ["Fan Repair", "Wiring", "Switchboard", "Inverter Setup", "AC Connection"],
  CLEANER: ["Kitchen", "Bathroom", "Sofa", "Carpet", "Deep Cleaning"],
  PAINTER: ["Wall Paint", "Texture", "Touch-up", "Exterior", "Waterproofing"],
  MOVER: ["Furniture Shift", "Packing", "Transport", "Intercity", "Storage Help"],
  OTHER: ["General Help", "Custom Service", "Handyman", "Installation"],
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function EditServicePage() {
  const { id } = useParams();
  const router = useRouter();
  const locationRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/provider/get-service?id=${id}`);
        const json = await res.json();
        
        const availableTimeMap: Record<string, { from: string; to: string }[]> = {};
        if (Array.isArray(json.availableTime)) {
          for (const time of json.availableTime) {
            const [day, slot] = time.split(":");
            const [from, to] = slot.split("-");
            if (!availableTimeMap[day]) availableTimeMap[day] = [];
            availableTimeMap[day].push({ from, to });
          }
        }

        setForm({
          ...json,
          basePrice: json.basePrice?.toString() || "",
          startingFromPrice: json.startingFromPrice?.toString() || "",
          serviceRadiusKm: json.serviceRadiusKm?.toString() || "",
          experienceYears: json.experienceYears?.toString() || "",
          durationMinutes: json.durationMinutes?.toString() || "30",
          availableTime: availableTimeMap,
        });
      } catch (error) {
        console.error("Failed to fetch service:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.google && locationRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(locationRef.current);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place?.formatted_address) {
          setForm((prev: unknown) => ({ 
            ...prev, 
            location: place.formatted_address,
            lat: place.geometry?.location?.lat(),
            lng: place.geometry?.location?.lng()
          }));
        }
      });
    }
  }, [form?.location]);

  const handleChange = (e: unknown) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: unknown) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDaysChange = (day: string) => {
    setForm((prev: unknown) => {
      const updatedDays = prev.availableDays.includes(day)
        ? prev.availableDays.filter((d: string) => d !== day)
        : [...prev.availableDays, day];
      const updatedTime = { ...prev.availableTime };
      if (!updatedDays.includes(day)) delete updatedTime[day];
      else if (!updatedTime[day]) updatedTime[day] = [{ from: "09:00", to: "17:00" }];
      return { ...prev, availableDays: updatedDays, availableTime: updatedTime };
    });
  };

  const handleTimeSlotChange = (day: string, index: number, field: "from" | "to", value: string) => {
    setForm((prev: unknown) => {
      const newDaySlots = [...(prev.availableTime[day] || [])];
      newDaySlots[index][field] = value;
      return {
        ...prev,
        availableTime: { ...prev.availableTime, [day]: newDaySlots },
      };
    });
  };

  const addTimeSlot = (day: string) => {
    setForm((prev: unknown) => ({
      ...prev,
      availableTime: {
        ...prev.availableTime,
        [day]: [...(prev.availableTime[day] || []), { from: "09:00", to: "17:00" }],
      },
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setForm((prev: unknown) => ({
      ...prev,
      availableTime: {
        ...prev.availableTime,
        [day]: prev.availableTime[day].filter((_: unknown, i: number) => i !== index),
      },
    }));
  };

  const toggleTag = (tag: string) => {
    setForm((prev: unknown) => {
      const tags = prev.tags.includes(tag)
        ? prev.tags.filter((t: string) => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags };
    });
  };

  const hasOverlaps = (slots: { from: string; to: string }[]) => {
    const sorted = [...slots].sort((a, b) => a.from.localeCompare(b.from));
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].to > sorted[i + 1].from) return true;
    }
    return false;
  };

  const validateForm = () => {
    // Validate time slots
    for (const day of form.availableDays) {
      const slots = form.availableTime[day] || [];
      if (hasOverlaps(slots)) {
        alert(`⛔ Overlapping time slots on ${day}`);
        return false;
      }
    }

    // Validate pricing
    if (!form.isCustomPricing && !form.basePrice) {
      alert("Please enter a base price for fixed pricing services");
      return false;
    }

    if (form.isCustomPricing && !form.startingFromPrice) {
      alert("Please enter a starting price for custom pricing services");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: unknown) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmation(false);

    try {
      const flattenedTime: string[] = [];
      for (const day of form.availableDays) {
        const slots = form.availableTime[day] || [];
        for (const slot of slots) {
          if (slot.from && slot.to) {
            flattenedTime.push(`${day}:${slot.from}-${slot.to}`);
          }
        }
      }

      const res = await fetch("/api/provider/update-service", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          basePrice: form.isCustomPricing ? null : parseInt(form.basePrice),
          startingFromPrice: form.isCustomPricing ? parseInt(form.startingFromPrice) : null,
          serviceRadiusKm: form.serviceRadiusKm ? parseInt(form.serviceRadiusKm) : null,
          experienceYears: form.experienceYears ? parseInt(form.experienceYears) : null,
          durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : 30,
          availableTime: flattenedTime,
        }),
      });

      if (res.ok) {
        router.push("/provider/services");
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (error) {
      console.error("Error updating service:", error);
      alert("Failed to update service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
  };

  if (loading || !form) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  const tags = SERVICE_TAGS[form.category] || [];

  return (
    <div className="max-w-5xl mx-auto mt-6 md:mt-12 bg-slate-900 p-4 md:p-8 rounded-2xl shadow-xl border border-slate-700 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-white">✏️ Edit Service</h1>
      
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 md:gap-6 text-sm">
        {/* Title and Category */}
        <div className="space-y-2">
          <Label className="text-cyan-400">Service Title</Label>
          <Input 
            name="title" 
            value={form.title} 
            onChange={handleChange} 
            required 
            placeholder="e.g., Plumbing Repair, Home Cleaning"
            className="bg-slate-800 border-slate-700 focus:border-cyan-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-cyan-400">Category</Label>
          <select 
            name="category" 
            value={form.category} 
            onChange={handleChange} 
            className="w-full bg-slate-800 text-white p-2 rounded-md border border-slate-700 focus:border-cyan-500 focus:ring-cyan-500"
          >
            {Object.keys(SERVICE_TAGS).map((cat) => (
              <option key={cat} value={cat}>
                {formatCategory(cat)}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="md:col-span-2 space-y-2">
          <Label className="text-cyan-400">Description</Label>
          <Textarea 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            className="bg-slate-800 text-white border border-slate-700 focus:border-cyan-500"
            rows={4}
            placeholder="Describe your service in detail..."
          />
        </div>

        {/* Pricing Section */}
        <div className="space-y-4 md:col-span-2 border border-slate-700 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCustomPricing"
              name="isCustomPricing"
              checked={form.isCustomPricing}
              onChange={handleChange}
              className="accent-cyan-500"
            />
            <Label htmlFor="isCustomPricing" className="text-cyan-400">
              Custom Pricing (price will be quoted after discussion)
            </Label>
          </div>

          {form.isCustomPricing ? (
            <div className="space-y-2">
              <Label className="text-cyan-400">Starting From Price (₹)</Label>
              <Input
                name="startingFromPrice"
                value={form.startingFromPrice}
                onChange={handleChange}
                type="number"
                placeholder="e.g., 499"
                required={form.isCustomPricing}
                className="bg-slate-800 border-slate-700 focus:border-cyan-500"
              />
              <p className="text-xs text-gray-400">This is the minimum price you would charge for this service</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-cyan-400">Fixed Price (₹)</Label>
              <Input
                name="basePrice"
                value={form.basePrice}
                onChange={handleChange}
                type="number"
                placeholder="e.g., 999"
                required={!form.isCustomPricing}
                className="bg-slate-800 border-slate-700 focus:border-cyan-500"
              />
              <p className="text-xs text-gray-400">This will be the fixed price for all bookings</p>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="text-cyan-400">Service Location</Label>
          <Input 
            name="location" 
            value={form.location} 
            onChange={handleChange} 
            ref={locationRef} 
            required 
            placeholder="Enter your precise location"
            className="bg-slate-800 border-slate-700 focus:border-cyan-500"
          />
        </div>

        {/* Service Radius */}
        <div className="space-y-2">
          <Label className="text-cyan-400">Service Radius (km)</Label>
          <Input 
            name="serviceRadiusKm" 
            value={form.serviceRadiusKm} 
            onChange={handleChange} 
            type="number" 
            placeholder="e.g., 10"
            className="bg-slate-800 border-slate-700 focus:border-cyan-500"
          />
        </div>

        {/* Experience */}
        <div className="space-y-2">
          <Label className="text-cyan-400">Your Experience (years)</Label>
          <Input 
            name="experienceYears" 
            value={form.experienceYears} 
            onChange={handleChange} 
            type="number" 
            placeholder="e.g., 5"
            className="bg-slate-800 border-slate-700 focus:border-cyan-500"
          />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label className="text-cyan-400">Default Duration (minutes)</Label>
          <Input
            name="durationMinutes"
            value={form.durationMinutes}
            onChange={handleChange}
            type="number"
            placeholder="e.g., 30, 60, 90"
            min="15"
            step="15"
            className="bg-slate-800 border-slate-700 focus:border-cyan-500"
          />
        </div>

        {/* Tools */}
        <div className="flex gap-2 items-center">
          <input 
            type="checkbox" 
            id="includesTools"
            name="includesTools" 
            checked={form.includesTools} 
            onChange={handleChange} 
            className="accent-cyan-500"
          />
          <Label htmlFor="includesTools" className="text-cyan-400">
            I provide all necessary tools
          </Label>
        </div>

        {/* Availability */}
        <div className="space-y-2 md:col-span-2">
          <Label className="text-cyan-400">Availability</Label>
          <div className="flex flex-wrap gap-2 mb-4">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleDaysChange(day)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  form.availableDays.includes(day)
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {form.availableDays.map((day: string) => (
            <div key={day} className="space-y-2 mb-4 p-3 bg-slate-800 rounded-lg">
              <h3 className="text-cyan-300 font-medium">{day} Time Slots</h3>
              {form.availableTime[day]?.map((slot: unknown, idx: number) => (
                <div key={idx} className="flex gap-2 items-center mb-2">
                  <Input
                    type="time"
                    value={slot.from}
                    onChange={(e) => handleTimeSlotChange(day, idx, "from", e.target.value)}
                    className="bg-slate-700 text-white border-slate-600"
                  />
                  <span className="text-gray-300">to</span>
                  <Input
                    type="time"
                    value={slot.to}
                    onChange={(e) => handleTimeSlotChange(day, idx, "to", e.target.value)}
                    className="bg-slate-700 text-white border-slate-600"
                  />
                  {form.availableTime[day].length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeTimeSlot(day, idx)} 
                      className="text-red-400 hover:text-red-300 text-xs ml-2"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => addTimeSlot(day)} 
                className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
              >
                <span>+</span> Add Time Slot
              </button>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="md:col-span-2 space-y-2">
          <Label className="text-cyan-400">Service Tags</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button 
                key={tag} 
                type="button" 
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  form.tags.includes(tag)
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 text-right mt-4">
          <Button 
            type="submit" 
            className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 text-base transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">Confirm Service Changes</DialogTitle>
            <DialogDescription className="text-gray-300">
              Please review your service details before updating
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <h4 className="font-medium text-white">Service Title</h4>
              <p>{form.title || "Not provided"}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-white">Category</h4>
              <p>{formatCategory(form.category)}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-white">Pricing</h4>
              <p>
                {form.isCustomPricing 
                  ? `Starting from ₹${form.startingFromPrice} (custom pricing)`
                  : `Fixed price ₹${form.basePrice}`}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-white">Location</h4>
              <p>{form.location || "Not provided"}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-white">Availability</h4>
              {form.availableDays.length > 0 ? (
                <ul className="list-disc pl-5">
                  {form.availableDays.map((day: string) => (
                    <li key={day}>
                      {day}: {form.availableTime[day]?.map((slot: unknown) => `${slot.from} - ${slot.to}`).join(", ")}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Not specified</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={() => setShowConfirmation(false)} 
              className="bg-slate-700 hover:bg-slate-600"
            >
              Go Back
            </Button>
            <Button 
              onClick={confirmSubmit} 
              className="bg-cyan-600 hover:bg-cyan-700 ml-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Confirm & Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
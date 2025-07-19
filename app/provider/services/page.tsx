'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@lib/supabase";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2, Plus } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  location: string;
  availableDays: string[];
  availableTime?: string;
  serviceRadiusKm?: number;
  experienceYears?: number;
  includesTools?: boolean;
  tags: string[];
}

export default function ProviderServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchServices = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      setServices([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/provider/get-services?user_id=${user.id}`);
      const json = await res.json();
      setServices(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setServices([]);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?\nThis action cannot be undone.")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/provider/delete-service?id=${id}`, { method: "DELETE" });
      if (res.ok) setServices(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting service:", error);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-slate-900/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Services</h1>
            <p className="text-sm text-slate-400 mt-1">
              {loading ? "Loading..." : `${services.length} ${services.length === 1 ? 'service' : 'services'}`}
            </p>
          </div>
          <Button 
            onClick={() => router.push("/provider/add-service")}
            className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Service
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700 p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-5xl mb-4">🛠️</div>
              <h3 className="text-lg font-medium text-white mb-2">No services yet</h3>
              <p className="text-slate-400 mb-6">Get started by creating your first service offering</p>
              <Button 
                onClick={() => router.push("/provider/add-service")}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Create Service
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service) => (
              <div 
                key={service.id}
                className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="text-lg font-semibold text-white line-clamp-2">
                      {service.title}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-900/50 text-cyan-200 shrink-0">
                      {formatCategory(service.category)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
<span className="text-emerald-400 font-medium">
  ₹{service.basePrice ?? service.startingFromPrice ?? 'N/A'}
</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 text-sm truncate">
                      {service.location}
                    </span>
                  </div>

                  {service.description && (
                    <p className="text-sm text-slate-300 mt-3 line-clamp-3">
                      {service.description}
                    </p>
                  )}

                  {service.tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {service.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-700/50 text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-800/50 border-t border-slate-700/50 px-5 py-3 flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-slate-300 hover:text-white border-slate-700 hover:border-slate-600"
                    onClick={() => router.push(`/provider/edit-service/${service.id}`)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={deletingId === service.id}
                    onClick={() => handleDelete(service.id)}
                  >
                    {deletingId === service.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
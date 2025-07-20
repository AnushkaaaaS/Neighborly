'use client';

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Phone, Mail, User, Edit, Save, X } from "lucide-react";
import { supabase } from "@lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderProfilePage() {
  const [user, setUser] = useState<unknown>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    bio: "",
    experience: "",
    serviceTypes: [] as string[]
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user || error) return;
      setUser(user);

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(`avatars/${user.id}/profile`);

      setAvatarUrl(publicUrl || "");

      const res = await fetch(`/api/provider/profile?id=${user.id}`);
      const { data } = await res.json();

      setForm({
        name: data.name || user.email?.split("@")[0] || "",
        phone: data.phone || "",
        location: data.location || "",
        bio: data.bio || "",
        experience: data.experience?.toString() || "",
        serviceTypes: data.serviceTypes || []
      });

      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceTypeChange = (type: string) => {
    setForm(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter(t => t !== type)
        : [...prev.serviceTypes, type]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (avatarUrl.startsWith('blob:')) {
        const file = await fetch(avatarUrl).then(res => res.blob());
        const { error } = await supabase.storage
          .from('avatars')
          .upload(`avatars/${user.id}/profile`, file, { upsert: true });
        
        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(`avatars/${user.id}/profile`);
          setAvatarUrl(publicUrl);
        }
      }

      const response = await fetch("/api/provider/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          ...form,
          avatarUrl,
          experience: parseInt(form.experience) || 0
        })
      });

      if (!response.ok) throw new Error("Failed to save profile");
      
      setEditMode(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="container mx-auto">
        <Card className="max-w-4xl mx-auto bg-slate-800/50 border-slate-700 shadow-lg">
          <CardHeader className="border-b border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-2xl font-semibold flex items-center gap-2 text-white">
                <User className="w-5 h-5 text-cyan-400" />
                My Profile
              </CardTitle>
              {!editMode ? (
                <Button 
                  onClick={() => setEditMode(true)} 
                  variant="outline"
                  className="gap-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setEditMode(false)} 
                    variant="outline" 
                    className="gap-2 border-gray-400 text-gray-400 hover:bg-gray-400/10"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    className="gap-2 bg-cyan-600 hover:bg-cyan-700" 
                    disabled={saving}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="grid md:grid-cols-3 gap-8 py-8">
            {/* Left Column - Avatar and Basic Info */}
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-28 h-28 border-2 border-cyan-400/30">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-cyan-400/10 text-cyan-400">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {editMode && (
                  <div className="text-center">
                    <Label 
                      htmlFor="avatar-upload" 
                      className="cursor-pointer text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
                    >
                      Change Photo
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-cyan-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </h3>
                <p className="text-gray-300">{user?.email}</p>
              </div>
            </div>

            {/* Middle Column - Personal Info */}
            <div className="space-y-6">
              <h3 className="font-semibold text-lg text-white">Personal Information</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Full Name</Label>
                  {editMode ? (
                    <Input 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange} 
                      className="bg-slate-700 border-slate-600 text-white focus:border-cyan-500"
                    />
                  ) : (
                    <p className="text-gray-300">{form.name || "Not provided"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Phone Number</Label>
                  {editMode ? (
                    <Input 
                      name="phone" 
                      value={form.phone} 
                      onChange={handleChange} 
                      className="bg-slate-700 border-slate-600 text-white focus:border-cyan-500"
                    />
                  ) : (
                    <p className="text-gray-300 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {form.phone || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Location</Label>
                  {editMode ? (
                    <Input 
                      name="location" 
                      value={form.location} 
                      onChange={handleChange} 
                      className="bg-slate-700 border-slate-600 text-white focus:border-cyan-500"
                    />
                  ) : (
                    <p className="text-gray-300 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {form.location || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Professional Info */}
            <div className="space-y-6">
              <h3 className="font-semibold text-lg text-white">Professional Information</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Years of Experience</Label>
                  {editMode ? (
                    <Input 
                      name="experience" 
                      type="number" 
                      value={form.experience} 
                      onChange={handleChange} 
                      className="bg-slate-700 border-slate-600 text-white focus:border-cyan-500"
                    />
                  ) : (
                    <p className="text-gray-300">
                      {form.experience || "0"} years
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Service Types</Label>
                  {editMode ? (
                    <div className="flex flex-wrap gap-2">
                      {Object.values(ServiceType).map(type => (
                        <Badge 
                          key={type}
                          variant={form.serviceTypes.includes(type) ? "default" : "outline"}
                          className="cursor-pointer transition-colors bg-cyan-600 hover:bg-cyan-700"
                          onClick={() => handleServiceTypeChange(type)}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {form.serviceTypes.length > 0 ? (
                        form.serviceTypes.map(type => (
                          <Badge key={type} variant="secondary" className="bg-cyan-600/20 text-cyan-400">
                            {type}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-400">Not specified</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">About Me</Label>
                  {editMode ? (
                    <Textarea 
                      name="bio" 
                      rows={4} 
                      value={form.bio} 
                      onChange={handleChange}
                      placeholder="Tell clients about your skills and experience..."
                      className="bg-slate-700 border-slate-600 text-white focus:border-cyan-500"
                    />
                  ) : (
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {form.bio || "No bio provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          {!editMode && (
            <CardFooter className="border-t border-slate-700 py-4 text-sm text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Last updated: {new Date().toLocaleDateString()}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

const ProfileSkeleton = () => (
  <div className="min-h-screen bg-slate-900 py-8 px-4">
    <div className="container mx-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-10 w-64 rounded-lg bg-slate-700" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="w-28 h-28 rounded-full bg-slate-700" />
              <Skeleton className="h-4 w-24 rounded bg-slate-700" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 rounded bg-slate-700" />
              <Skeleton className="h-4 w-48 rounded bg-slate-700" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-6 w-48 rounded bg-slate-700" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded bg-slate-700" />
                <Skeleton className="h-10 w-full rounded bg-slate-700" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded bg-slate-700" />
                <Skeleton className="h-10 w-full rounded bg-slate-700" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-6 w-48 rounded bg-slate-700" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded bg-slate-700" />
                <Skeleton className="h-10 w-full rounded bg-slate-700" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded bg-slate-700" />
                <Skeleton className="h-24 w-full rounded bg-slate-700" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

enum ServiceType {
  COOKING_HELP = "Cooking Help",
  TUTORING = "Tutoring",
  RIDES_AND_ERRANDS = "Rides & Errands",
  CREATIVE_HELP = "Creative Help",
  HOME_REPAIRS = "Home Repairs",
  CLEANING = "Cleaning",
  PET_CARE = "Pet Care",
  MOVING_HELP = "Moving Help",
  OTHER = "Other Services"
}
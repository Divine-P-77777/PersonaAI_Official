"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/services/api";
import { useToast } from "@/hooks/useToast";
import { User, Mail, Calendar, Upload, Shield, Loader2, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [imgError, setImgError] = useState(false);

  const [name, setName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    setImgError(false);
  }, [user?.user_metadata?.avatar_url]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "");
      }
    } catch (err) {
      console.error(err);
      showError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    const currentName = user?.user_metadata?.full_name || user?.user_metadata?.name;
    if (!name.trim() || name === currentName) return;

    try {
      setSavingName(true);

      // Update in Supabase Auth
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: name.trim(), name: name.trim() }
      });

      if (error) throw error;

      // Update in our backend database
      await api.updateMyProfile({ name: name.trim() });

      setUser(data.user);
      showSuccess("Name updated successfully!");
    } catch (err: any) {
      showError(err.message || "Failed to update name.");
    } finally {
      setSavingName(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("Image must be smaller than 5MB");
      return;
    }

    try {
      setUploadingAvatar(true);

      // Upload via our backend
      const result = await api.uploadMyAvatar(file);

      // Update in Supabase Auth
      const { data, error } = await supabase.auth.updateUser({
        data: { avatar_url: result.avatar_url }
      });

      if (error) throw error;

      setUser(data.user);
      showSuccess("Profile picture updated!");
    } catch (err: any) {
      showError(err.message || "Failed to upload image.");
    } finally {
      setUploadingAvatar(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Please sign in to view your profile.</p>
      </div>
    );
  }

  const role = user.user_metadata?.role === "user" ? "Student" : "Mentor";
  const joinedDate = new Date(user.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-orange-400 to-pink-500 relative" />

          <div className="px-8 pb-10">
            {/* Avatar Section */}
            <div className="relative -mt-16 mb-8 flex justify-between items-end">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center bg-gradient-to-tr from-orange-100 to-pink-100">
                  {avatarUrl && !imgError ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <User className="w-16 h-16 text-orange-400" />
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm">
                      <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    </div>
                  )}
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 p-2.5 bg-gray-900 text-white rounded-full hover:bg-orange-500 transition-colors shadow-lg disabled:opacity-50"
                  title="Update Profile Picture"
                >
                  <Upload size={16} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                />
              </div>

              <div className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full font-bold text-sm shadow-sm border border-orange-200">
                {role} Profile
              </div>
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">
              My Profile
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Editable Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Display Name
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 h-12 px-4 text-black rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all font-medium"
                      placeholder="Your Name"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={savingName || !name.trim() || name === (user.user_metadata?.full_name || user.user_metadata?.name)}
                      className="h-12 px-6 bg-gray-900 text-white rounded-xl font-bold hover:bg-orange-500 transition-all shadow-md disabled:opacity-50 disabled:hover:bg-gray-900 flex items-center gap-2"
                    >
                      {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Read-Only Stats */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Account Details
                  </label>
                  <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email Address</p>
                        <p className="font-medium text-gray-900 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Joined Since</p>
                        <p className="font-medium text-gray-900">{joinedDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Account Type</p>
                        <p className="font-medium text-gray-900">{role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

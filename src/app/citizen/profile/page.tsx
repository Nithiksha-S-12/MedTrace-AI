"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UserCircle, Save, CheckCircle } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setProfile(data.user);
          setPhone(data.user.phone || "");
          setEmail(data.user.email || "");
        }
      });
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, email }),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  };

  if (!profile) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-gov-navy border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const fields = [
    { label: "Full Name", value: profile.name, editable: false },
    { label: "Government ID", value: profile.govId || "-", editable: false },
    { label: "Your Government Health ID", value: profile.healthId || "-", editable: false },
    { label: "Date of Birth", value: profile.dob ? new Date(profile.dob).toLocaleDateString("en-IN") : "-", editable: false },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gov-navy flex items-center gap-2">
          <UserCircle className="w-6 h-6" /> My Profile
        </h1>
        <p className="text-sm text-gray-500 mt-1">View and update your personal information</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> Profile updated successfully!
        </div>
      )}

      {/* Identity Card */}
      <div className="bg-gradient-to-r from-gov-navy to-[#29528f] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
            {profile.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-blue-200 font-mono text-sm">{profile.healthId}</p>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize mt-1 inline-block">{profile.role}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b bg-gray-50/50">
          <h2 className="font-bold text-gov-navy">Personal Information</h2>
        </div>
        <div className="p-6 space-y-4">
          {fields.map((f) => (
            <div key={f.label} className="grid grid-cols-3 items-center">
              <label className="text-sm font-medium text-gray-500">{f.label}</label>
              <div className="col-span-2">
                <p className="text-sm font-semibold text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">{f.value}</p>
              </div>
            </div>
          ))}

          {/* Editable fields */}
          <div className="grid grid-cols-3 items-center">
            <label className="text-sm font-medium text-gray-500">Phone Number</label>
            <div className="col-span-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full text-sm border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gov-navy outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 items-center">
            <label className="text-sm font-medium text-gray-500">Email Address</label>
            <div className="col-span-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-sm border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gov-navy outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 bg-gov-navy text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#122b50] transition-colors disabled:opacity-60"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

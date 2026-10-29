/**
 * صالون المقص الذهبي - بن فريحة، وهران
 * ربط مباشر وحقيقي مع قاعدة بيانات Supabase
 * Project Ref: vmhhriytxjeikorzoqcs
 */

import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://vmhhriytxjeikorzoqcs.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaGhyaXl0eGplaWtvcnpvcWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MTYzMzUsImV4cCI6MjEwNTk5MjMzNX0.HxSSo5S89bpTM7cbRSCcqnTxXR1c73xVyGZtAFHJBCU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export const SQL_SETUP_SCRIPT = `-- كود إنشاء جداول صالون المقص الذهبي في Supabase SQL Editor
create table if not exists public.barbers (
  id text primary key,
  name text not null,
  role text,
  experience text,
  phone text,
  username text,
  password text,
  image text,
  available boolean default true,
  working_hours text,
  created_at timestamp with time zone default now()
);

create table if not exists public.appointments (
  id text primary key,
  barber_id text,
  barber_name text,
  service_id text,
  service_name text,
  service_price numeric,
  date text,
  time text,
  client_name text,
  client_phone text,
  notes text,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb,
  updated_at timestamp with time zone default now()
);

-- سياسات الأمان للقراءة والكتابة
alter table public.barbers enable row level security;
alter table public.appointments enable row level security;
alter table public.site_settings enable row level security;

create policy "Allow all on barbers" on public.barbers for all using (true) with check (true);
create policy "Allow all on appointments" on public.appointments for all using (true) with check (true);
create policy "Allow all on site_settings" on public.site_settings for all using (true) with check (true);

-- تفعيل Realtime للبث المباشر
alter publication supabase_realtime add table public.appointments;
alter publication supabase_realtime add table public.barbers;
alter publication supabase_realtime add table public.site_settings;
`;

// ==========================================
// 1. Appointments Supabase CRUD & Realtime
// ==========================================

export async function fetchAppointmentsSupabase() {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch appointments:", error.message);
      return null;
    }

    return (data || []).map(row => ({
      id: row.id,
      barberId: row.barber_id,
      barberName: row.barber_name,
      serviceId: row.service_id,
      serviceName: row.service_name,
      servicePrice: Number(row.service_price) || 0,
      date: row.date,
      time: row.time,
      clientName: row.client_name,
      clientPhone: row.client_phone,
      notes: row.notes,
      status: row.status,
      createdAt: row.created_at
    }));
  } catch (err) {
    console.warn("Supabase appointments query failed:", err);
    return null;
  }
}

export async function saveAppointmentSupabase(appt) {
  try {
    const payload = {
      id: appt.id,
      barber_id: appt.barberId,
      barber_name: appt.barberName,
      service_id: appt.serviceId,
      service_name: appt.serviceName,
      service_price: appt.servicePrice,
      date: appt.date,
      time: appt.time,
      client_name: appt.clientName,
      client_phone: appt.clientPhone,
      notes: appt.notes || "",
      status: appt.status || "pending",
      created_at: appt.createdAt || new Date().toISOString()
    };

    const { error } = await supabase.from("appointments").upsert(payload);
    if (error) {
      console.warn("Supabase save appointment error:", error.message);
      return false;
    }
    console.log("Appointment saved to Supabase:", appt.id);
    return true;
  } catch (err) {
    console.warn("Supabase save appointment failed:", err);
    return false;
  }
}

export async function updateAppointmentStatusSupabase(apptId, status) {
  try {
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", apptId);

    if (error) {
      console.warn("Supabase update status error:", error.message);
      return false;
    }
    console.log(`Appointment ${apptId} updated to ${status} in Supabase`);
    return true;
  } catch (err) {
    console.warn("Supabase status update failed:", err);
    return false;
  }
}

export async function deleteAppointmentSupabase(apptId) {
  try {
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", apptId);

    if (error) {
      console.warn("Supabase delete appointment error:", error.message);
      return false;
    }
    console.log("Appointment deleted from Supabase:", apptId);
    return true;
  } catch (err) {
    console.warn("Supabase delete failed:", err);
    return false;
  }
}

export function subscribeAppointmentsSupabase(callback) {
  try {
    // Initial fetch
    fetchAppointmentsSupabase().then(items => {
      if (items !== null) callback(items);
    });

    const channel = supabase
      .channel("public:appointments")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        fetchAppointmentsSupabase().then(items => {
          if (items !== null) callback(items);
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn("Supabase realtime subscription failed:", err);
    return () => {};
  }
}

// ==========================================
// 2. Barbers Supabase CRUD & Realtime
// ==========================================

export async function fetchBarbersSupabase() {
  try {
    const { data, error } = await supabase
      .from("barbers")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Supabase fetch barbers:", error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map(b => ({
      id: b.id,
      name: b.name,
      role: b.role,
      experience: b.experience,
      phone: b.phone,
      username: b.username,
      password: b.password,
      image: b.image,
      available: b.available,
      workingHours: b.working_hours
    }));
  } catch (err) {
    console.warn("Supabase barbers query failed:", err);
    return null;
  }
}

export async function saveBarberSupabase(barber) {
  try {
    const payload = {
      id: barber.id,
      name: barber.name,
      role: barber.role,
      experience: barber.experience,
      phone: barber.phone,
      username: barber.username,
      password: barber.password,
      image: barber.image,
      available: barber.available ?? true,
      working_hours: barber.workingHours || "09:00 ص - 21:00 م"
    };

    const { error } = await supabase.from("barbers").upsert(payload);
    if (error) {
      console.warn("Supabase save barber error:", error.message);
      return false;
    }
    console.log("Barber saved to Supabase:", barber.name);
    return true;
  } catch (err) {
    console.warn("Supabase save barber failed:", err);
    return false;
  }
}

export async function deleteBarberSupabase(barberId) {
  try {
    const { error } = await supabase
      .from("barbers")
      .delete()
      .eq("id", barberId);

    if (error) {
      console.warn("Supabase delete barber error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase delete barber failed:", err);
    return false;
  }
}

export async function seedBarbersSupabaseIfEmpty(defaultBarbers) {
  try {
    const existing = await fetchBarbersSupabase();
    if (!existing || existing.length === 0) {
      console.log("Seeding barbers to Supabase...");
      for (const b of defaultBarbers) {
        await saveBarberSupabase(b);
      }
    }
  } catch (err) {
    console.warn("Supabase barber seeding failed or pending:", err);
  }
}

export function subscribeBarbersSupabase(callback) {
  try {
    fetchBarbersSupabase().then(items => {
      if (items !== null && items.length > 0) callback(items);
    });

    const channel = supabase
      .channel("public:barbers")
      .on("postgres_changes", { event: "*", schema: "public", table: "barbers" }, () => {
        fetchBarbersSupabase().then(items => {
          if (items !== null && items.length > 0) callback(items);
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn("Supabase barbers subscription failed:", err);
    return () => {};
  }
}

// ==========================================
// 3. Settings & Ads Supabase
// ==========================================

export async function fetchSettingsSupabase(key) {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (error || !data) return null;
    return data.value;
  } catch (err) {
    return null;
  }
}

export async function saveSettingsSupabase(key, value) {
  try {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() });

    if (error) return false;
    return true;
  } catch (err) {
    return false;
  }
}

import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://mludiumdvwdvuetivxvj.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdWRpdW1kdndkdnVldGl2eHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzOTU1MzgsImV4cCI6MjEwNzk3MTUzOH0.LsDOxmuyGN6L9bIWCd1Yzr_ErPTbmQNwdTRI-wyI_aA";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "golden-scissors-supabase-auth" }
});
const provisioningSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: "golden-scissors-provisioning" }
});
export const OWNER_EMAIL = "wahablila31000@gmail.com";
export const PUBLIC_APP_URL = "https://usadzoran.github.io/Coiffeur-";
const BARBERS = "salon_barbers";
const APPOINTMENTS = "salon_appointments";

const barberFromRow = (r) => r && ({ id:r.id, name:r.name, role:r.role, phone:r.phone, experience:r.experience, username:r.username, authUid:r.auth_user_id, authEmail:r.auth_email, image:r.image, displayName:r.display_name, displayRole:r.display_role, profileImage:r.profile_image, portfolio:r.portfolio || [], hairstyles:r.hairstyles || [], available:r.available, workingHours:r.working_hours, createdAt:r.created_at, updatedAt:r.updated_at });
const appointmentFromRow = (r) => r && ({ id:r.id, barberId:r.barber_id, barberName:r.barber_name, serviceId:r.service_id, serviceName:r.service_name, servicePrice:Number(r.service_price), date:r.date, time:r.time, clientName:r.client_name, clientPhone:r.client_phone, notes:r.notes, status:r.status, createdAt:r.created_at, updatedAt:r.updated_at });
const errorText = (e, fallback) => e?.code === "42501" ? "Supabase رفض العملية بسبب سياسة RLS." : (e?.message || fallback);

export async function signInOwner(password) { const {data,error} = await supabase.auth.signInWithPassword({email:OWNER_EMAIL,password}); if(error) throw error; return {user:data.user}; }
export async function registerOwner(password) { const {data,error} = await supabase.auth.signUp({email:OWNER_EMAIL,password,options:{data:{role:"owner"}, emailRedirectTo:PUBLIC_APP_URL+"/private-owner-console-7x4m.html"}}); if(error) throw error; if(data.user && data.session) { const r=await supabase.from("salon_owner_roles").upsert({user_id:data.user.id,role:"owner"}); if(r.error) throw r.error; } return {user:data.user,session:data.session}; }
export async function resetOwnerPassword() { const {error}=await supabase.auth.resetPasswordForEmail(OWNER_EMAIL,{redirectTo:PUBLIC_APP_URL+"/private-owner-console-7x4m.html"}); if(error) throw error; }
export function subscribeAuth(callback) { supabase.auth.getUser().then(({data})=>callback(data.user||null)); const {data}=supabase.auth.onAuthStateChange((_e,s)=>callback(s?.user||null)); return ()=>data.subscription.unsubscribe(); }
export function signOutSupabase() { return supabase.auth.signOut(); }
export async function ensureSupabaseSession() { const {data}=await supabase.auth.getSession(); return data.session?.user || null; }
export function barberAuthEmail(username) { const safe=String(username||"").trim().toLowerCase().replace(/[^a-z0-9._-]/g,"-"); return safe+"@accounts.salon.local"; }
export async function createBarberAccount(username,password) { const {data,error}=await supabase.functions.invoke("salon-create-barber",{body:{username,password}}); if(error) throw new Error(error.message || "تعذر الاتصال بخدمة إنشاء حساب الحلاق."); if(!data || data.error) { const code=String(data?.error||""); if(code.includes("already registered") || code.includes("already exists")) throw new Error("اسم الدخول مستخدم من قبل. اختر اسماً آخر."); throw new Error(code || "تعذر إنشاء حساب الحلاق في Supabase."); } return {email:data.email,uid:data.uid}; }
export async function signInBarber(username,password) { const {data,error}=await supabase.auth.signInWithPassword({email:barberAuthEmail(username),password}); if(error) throw error; const q=await supabase.from(BARBERS).select("*").eq("auth_user_id",data.user.id).maybeSingle(); if(q.error) throw q.error; if(!q.data){await supabase.auth.signOut();throw new Error("تم التحقق من الحساب لكن ملف الحلاق غير موجود في Supabase.");} return barberFromRow(q.data); }

export async function saveBarberCloud(b) { const {data:s}=await supabase.auth.getSession(); if(!s.session?.user) throw new Error("جلسة المالك غير صالحة أو انتهت."); const row={id:b.id,name:b.name,role:b.role||"",phone:b.phone||"",experience:b.experience||"حلاق محترف",username:b.username,auth_user_id:b.authUid,auth_email:b.authEmail||"",image:b.image||"",display_name:b.displayName||"",display_role:b.displayRole||"",profile_image:b.profileImage||"",portfolio:b.portfolio||[],hairstyles:b.hairstyles||[],available:b.available!==false,working_hours:b.workingHours||"09:00 ص - 21:00 م"}; const {error}=await supabase.from(BARBERS).upsert(row); if(error) throw new Error(errorText(error,"تعذر حفظ الحلاق في Supabase.")); return true; }
export async function deleteBarberCloud(id) { const {error}=await supabase.from(BARBERS).delete().eq("id",id); if(error) throw error; return true; }
export async function saveBarberProfileCloud(id,p) { const {error}=await supabase.from(BARBERS).update({display_name:p.displayName||"",display_role:p.displayRole||"",profile_image:p.profileImage||"",portfolio:p.portfolio||[],hairstyles:p.hairstyles||[],updated_at:new Date().toISOString()}).eq("id",id); if(error) throw new Error(errorText(error,"تعذر حفظ ملف الحلاق في Supabase.")); }
export async function changeBarberPassword(newPassword) { const {error}=await supabase.auth.updateUser({password:newPassword}); if(error) throw error; }

export function subscribeBarbers(callback) { const load=async()=>{const {data,error}=await supabase.from(BARBERS).select("*").order("created_at",{ascending:true}); if(error) console.warn("Supabase barbers:",error); else callback((data||[]).map(barberFromRow));}; load(); const ch=supabase.channel("salon-barbers-live").on("postgres_changes",{event:"*",schema:"public",table:BARBERS},load).subscribe(); return ()=>supabase.removeChannel(ch); }
export async function saveAppointmentCloud(a) { const row={id:a.id,barber_id:a.barberId,barber_name:a.barberName||"",service_id:a.serviceId||"",service_name:a.serviceName||"",service_price:Number(a.servicePrice||0),date:a.date,time:a.time,client_name:a.clientName,client_phone:a.clientPhone,notes:a.notes||"",status:a.status||"pending"}; const {error}=await supabase.from(APPOINTMENTS).upsert(row); if(error){console.warn("Supabase appointment:",error);return false;} return true; }
export async function updateAppointmentStatusCloud(id,status) { const {error}=await supabase.from(APPOINTMENTS).update({status,updated_at:new Date().toISOString()}).eq("id",id); if(error) throw error; return true; }
export async function deleteAppointmentCloud(id) { const {error}=await supabase.from(APPOINTMENTS).delete().eq("id",id); if(error) throw error; return true; }
export function subscribeAppointments(callback) { const load=async()=>{const {data,error}=await supabase.from(APPOINTMENTS).select("*").order("created_at",{ascending:false}); if(error) console.warn("Supabase appointments:",error); else callback((data||[]).map(appointmentFromRow));}; load(); const ch=supabase.channel("salon-appointments-live").on("postgres_changes",{event:"*",schema:"public",table:APPOINTMENTS},load).subscribe(); return ()=>supabase.removeChannel(ch); }
export function subscribeAds(callback) { const load=async()=>{const {data,error}=await supabase.from("salon_settings").select("value").eq("key","ads").maybeSingle(); if(!error) callback(data?.value||null);}; load(); const ch=supabase.channel("salon-settings-live").on("postgres_changes",{event:"*",schema:"public",table:"salon_settings"},load).subscribe(); return ()=>supabase.removeChannel(ch); }
export async function saveAdsCloud(value) { const {error}=await supabase.from("salon_settings").upsert({key:"ads",value,updated_at:new Date().toISOString()}); if(error) throw error; return true; }
export function subscribeVisitors(callback) { const load=async()=>{const {data}=await supabase.from("salon_visitors").select("count").eq("singleton",true).maybeSingle(); callback(Number(data?.count||0));}; load(); const ch=supabase.channel("salon-visitors-live").on("postgres_changes",{event:"*",schema:"public",table:"salon_visitors"},load).subscribe(); return ()=>supabase.removeChannel(ch); }
export async function updateVisitorsCloud(count) { const {error}=await supabase.from("salon_visitors").upsert({singleton:true,count:Number(count),updated_at:new Date().toISOString()}); if(error) throw error; return true; }
export async function incrementVisitorCounter() { const {data,error}=await supabase.rpc("salon_increment_visitors"); return error?null:Number(data); }
async function uploadMedia(barberId, file, kind) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  if (!file?.type?.startsWith("image/")) throw new Error("اختر ملف صورة صالحاً.");
  if (file.size > 5 * 1024 * 1024) throw new Error("حجم الصورة يجب ألا يتجاوز 5 ميغابايت.");
  const path = `barbers/${barberId}/${kind}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from("salon-media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("salon-media").getPublicUrl(path);
  return { path, url: data.publicUrl, name: file.name };
}
export async function uploadBarberPortfolioImage(barberId, file){ return uploadMedia(barberId, file, "portfolio"); }
export async function uploadBarberProfileImage(barberId, file){ return uploadMedia(barberId, file, "profile"); }
export async function deleteBarberPortfolioImage(path){ if (path) { const { error } = await supabase.storage.from("salon-media").remove([path]); if (error) throw error; } }

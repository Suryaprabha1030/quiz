// ─── SUPABASE CONFIG ────────────────────────────────────────────────────────
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";

// ─── SUPABASE CLIENT (no SDK, raw fetch) ────────────────────────────────────
const sb = {
  headers: {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  },
  authHeaders(token) {
    return { ...this.headers, Authorization: `Bearer ${token}` };
  },
  async signUp(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ email, password }),
    });
    return r.json();
  },
  async signIn(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ email, password }),
    });
    return r.json();
  },
  async signOut(token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: this.authHeaders(token),
    });
  },
  async from(table, token) {
    return {
      select: async (query = "*", filters = "") => {
        const r = await fetch(
          `${SUPABASE_URL}/rest/v1/${table}?select=${query}${filters ? "&" + filters : ""}`,
          {
            headers: token ? this.authHeaders(token) : this.headers,
          },
        );
        return r.json();
      },
      insert: async (data) => {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: "POST",
          headers: {
            ...(token ? this.authHeaders(token) : this.headers),
            Prefer: "return=representation",
          },
          body: JSON.stringify(data),
        });
        return r.json();
      },
      update: async (data, filters = "") => {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filters}`, {
          method: "PATCH",
          headers: {
            ...(token ? this.authHeaders(token) : this.headers),
            Prefer: "return=representation",
          },
          body: JSON.stringify(data),
        });
        return r.json();
      },
      delete: async (filters = "") => {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filters}`, {
          method: "DELETE",
          headers: token ? this.authHeaders(token) : this.headers,
        });
        return r.status;
      },
    };
  },
};

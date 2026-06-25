// // ─── SUPABASE CONFIG ────────────────────────────────────────────────────────
// // Replace these with your actual Supabase project credentials
// const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
// const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";

// // ─── SUPABASE CLIENT (no SDK, raw fetch) ────────────────────────────────────
// export const sb = {
//   headers: {
//     "Content-Type": "application/json",
//     apikey: SUPABASE_ANON_KEY,
//     Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
//   },
//   authHeaders(token) {
//     return { ...this.headers, Authorization: `Bearer ${token}` };
//   },
//   async signUp(email, password) {
//     const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
//       method: "POST",
//       headers: this.headers,
//       body: JSON.stringify({ email, password }),
//     });
//     return r.json();
//   },
//   async signIn(email, password) {
//     const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
//       method: "POST",
//       headers: this.headers,
//       body: JSON.stringify({ email, password }),
//     });
//     return r.json();
//   },
//   async signOut(token) {
//     await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
//       method: "POST",
//       headers: this.authHeaders(token),
//     });
//   },
//   async from(table, token) {
//     return {
//       select: async (query = "*", filters = "") => {
//         const r = await fetch(
//           `${SUPABASE_URL}/rest/v1/${table}?select=${query}${filters ? "&" + filters : ""}`,
//           {
//             headers: token ? this.authHeaders(token) : this.headers,
//           },
//         );
//         return r.json();
//       },
//       insert: async (data) => {
//         const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
//           method: "POST",
//           headers: {
//             ...(token ? this.authHeaders(token) : this.headers),
//             Prefer: "return=representation",
//           },
//           body: JSON.stringify(data),
//         });
//         return r.json();
//       },
//       update: async (data, filters = "") => {
//         const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filters}`, {
//           method: "PATCH",
//           headers: {
//             ...(token ? this.authHeaders(token) : this.headers),
//             Prefer: "return=representation",
//           },
//           body: JSON.stringify(data),
//         });
//         return r.json();
//       },
//       delete: async (filters = "") => {
//         const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filters}`, {
//           method: "DELETE",
//           headers: token ? this.authHeaders(token) : this.headers,
//         });
//         return r.status;
//       },
//     };
//   },
// };

const SUPABASE_URL = "https://skxguvlqaqnzbbmbhcjg.supabase.co";
const SUPABASE_ANON_KEY = process.env.supabase_key;
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNreGd1dmxxYXFuemJibWJoY2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExOTQ5NzksImV4cCI6MjA5Njc3MDk3OX0.wZfHVUWK32PbA-0xaIMfh0CBDZ7HqUNPitYg7UIhEgE";

type HeadersType = Record<string, string>;

export const sb = {
  headers: {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  } as HeadersType,

  authHeaders(token: string): HeadersType {
    return {
      ...this.headers,
      Authorization: `Bearer ${token}`,
    };
  },

  async signUp(email: string, password: string, companyName: string) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        email,
        password,
        data: {
          companyName,
        },
      }),
    });

    return r.json();
  },

  // async signUp(email: string, password: string, companyName: string) {
  //   const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
  //     method: "POST",
  //     headers: this.headers,
  //     body: JSON.stringify({
  //       email,
  //       password,
  //       options: {
  //         data: {
  //           companyName,
  //         },
  //       },
  //     }),
  //   });

  //   return r.json();
  // },

  async signIn(email: string, password: string) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ email, password }),
    });

    return r.json();
  },

  async signOut(token: string) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: this.authHeaders(token),
    });
  },

  async from(table: string, token?: string) {
    return {
      select: async (query = "*", filters = "") => {
        const r = await fetch(
          `${SUPABASE_URL}/rest/v1/${table}?select=${query}${
            filters ? "&" + filters : ""
          }`,
          {
            headers: token ? this.authHeaders(token) : this.headers,
          },
        );

        return r.json();
      },

      insert: async (data: any) => {
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

      update: async (data: any, filters = "") => {
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

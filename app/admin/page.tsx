// // "use client";

// // import { useState } from "react";
// // import { useRouter } from "next/navigation";

// // export default function AdminPage() {
// //   const [email, setEmail] = useState("");
// //   const router = useRouter();

// //   function login() {
// //     if (!email.trim()) return;

// //     localStorage.setItem("admin_email", email);

// //     router.push("/admin/dashboard");
// //   }

// //   return (
// //     <div className="page-center">
// //       <div className="auth-box">
// //         <h1>Creator Admin</h1>

// //         <p>Enter creator email</p>

// //         <input
// //           className="input"
// //           type="email"
// //           placeholder="creator@gmail.com"
// //           value={email}
// //           onChange={(e) => setEmail(e.target.value)}
// //         />

// //         <button
// //           className="btn btn-primary"
// //           style={{ width: "100%", marginTop: "1rem" }}
// //           onClick={login}
// //         >
// //           Login →
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function AdminPage() {
//   const [email, setEmail] = useState("");
//   const router = useRouter();

//   function login() {
//     if (!email.trim()) return;

//     localStorage.setItem("admin_email", email);

//     router.push("/admin/dashboard");
//   }

//   return (
//     <div className="admin-login-page">
//       <div className="admin-login-card">
//         <div className="admin-logo">📊</div>

//         <h1>Creator Dashboard</h1>

//         <p className="admin-subtitle">
//           Monitor quiz attempts, scores and participant activity
//         </p>

//         <div className="admin-stats">
//           <div className="stat">
//             <span>📚</span>
//             <strong>Manage Quizzes</strong>
//           </div>

//           <div className="stat">
//             <span>📈</span>
//             <strong>Track Results</strong>
//           </div>

//           <div className="stat">
//             <span>👥</span>
//             <strong>View Attendees</strong>
//           </div>
//         </div>

//         <div className="form-group">
//           <label>Creator Email</label>

//           <input
//             type="email"
//             className="input"
//             placeholder="creator@gmail.com"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && login()}
//           />
//         </div>

//         <button className="btn btn-primary admin-btn" onClick={login}>
//           Access Dashboard →
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  function login() {
    if (!email.trim()) return;

    localStorage.setItem("admin_email", email);

    router.push("/admin/dashboard");
  }

  return (
    <div className="admin-login-page flex flex-col gap-20">
      <Link href="/home" className="nav-brand ">
        <h1 className="text-3xl ">🧠 QuizForge</h1>
        {/* /const companyName = res.user?.user_metadata?.companyName; */}
      </Link>
      <div className="admin-login-card">
        {/* <div className="admin-logo">📊</div> */}

        <h1>Creator Dashboard</h1>

        <p className="admin-subtitle">
          Monitor quiz attempts, scores and participant activity
        </p>

        <div className="admin-stats">
          {/* <div className="stat">
            <span>📚</span>
            <strong>Manage Quizzes</strong>
          </div> */}

          <div className="stat">
            <span>📈</span>
            <strong>Track Results</strong>
          </div>

          <div className="stat">
            <span>👥</span>
            <strong>View Attendees</strong>
          </div>
        </div>

        <div className="form-group">
          <label>Creator Email</label>

          <input
            type="email"
            className="input"
            placeholder="creator@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
        </div>

        <button className="btn btn-primary admin-btn" onClick={login}>
          Access Dashboard →
        </button>
      </div>
    </div>
  );
}

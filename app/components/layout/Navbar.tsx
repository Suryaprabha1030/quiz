"use client";
import Image from "next/image";

interface NavbarProps {
  session: any;
  logout: () => void;
  setView: (view: string) => void;
  setActiveQuiz: (quiz: any) => void;
}

export default function Navbar({
  session,
  logout,
  setView,
  setActiveQuiz,
}: NavbarProps) {
  return (
    <nav className="nav">
      <div className="nav-actions">
        <button className="nav-brand" onClick={() => setView("home")}>
          <Image
            src="/logo.png"
            alt="QuizForge Logo"
            width={36}
            height={36}
            className="rounded-md"
          />
          QuizForge
          {/* /const companyName = res.user?.user_metadata?.companyName; */}
        </button>
        <span className="text-lg nav-brand">
          {" "}
          / {session?.user?.user_metadata?.companyName}
        </span>
      </div>
      <div className="nav-actions">
        {session ? (
          <>
            <span>{session.user?.email}</span>

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setView("builder");
                setActiveQuiz(null);
              }}
            >
              + Create
            </button>

            <button className="btn btn-danger btn-sm" onClick={logout}>
              Sign out
            </button>
          </>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setView("auth")}
          >
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}

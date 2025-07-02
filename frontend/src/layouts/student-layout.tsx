import { Outlet, Link } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/store/auth-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logout } from "@/lib/api/auth";
import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { AuroraText } from "@/components/magicui/aurora-text";
// import FloatingVideo from "@/components/floating-video";

export default function StudentLayout() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/auth" });
  };

  // console.log('Current user role:', user?.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      {/* <FloatingVideo isVisible={user?.role === 'student'}></FloatingVideo> */}

      {/* Ambient background effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-secondary/[0.02] pointer-events-none" />

      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between px-8 border-b border-border/20 bg-background/80 backdrop-blur-xl">
  {/* Left: EduPoll Branding */}
  <div className="flex items-center gap-3">
    <div className="h-11 w-11 rounded-lg overflow-hidden">
      <img 
        src="https://continuousactivelearning.github.io/vibe/img/logo.png" 
        alt="EDUPOLL Logo" 
        className="h-11 w-11 object-contain"
      />
    </div>
    <span className="text-3xl font-extrabold text-[#7b61ff] tracking-tight">
      EduPoll
    </span>
  </div>

  {/* Right: Navigation and Profile */}
  <div className="flex items-center gap-6">
    <nav className="flex items-center gap-4 text-sm font-medium text-[#7b61ff]">
      <Link
        to="/student"
        className="px-3 py-1 rounded hover:text-[#ff9d3f] transition-colors"
      >
        Dashboard
      </Link>
      <Link
        to="/student/courses"
        className="px-3 py-1 rounded hover:text-[#ff9d3f] transition-colors"
      >
        Courses
      </Link>

      <button
        onClick={handleLogout}
        className="flex items-center gap-1 px-3 py-1 rounded text-[#7b61ff] hover:text-[#ff9d3f] transition-colors"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </button>

      <ThemeToggle />
    </nav>

    {/* Avatar */}
    <Link to="/student/profile">
      <Avatar className="h-9 w-9 border-2 border-[#7b61ff] hover:scale-105 transition-transform">
        <AvatarImage src={user?.avatar} alt={user?.name} />
        <AvatarFallback className="bg-[#7b61ff] text-white font-bold text-sm">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
    </Link>
  </div>
</header>




      <main className="relative flex flex-1 flex-col p-6">
        {/* Content background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
        <div className="relative z-10 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}


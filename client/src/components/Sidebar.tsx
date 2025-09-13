import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface User {
  firstName?: string;
  lastName?: string;
}

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth() as { user: User };

  const navigation = [
    {
      name: "Active Interview",
      href: "/",
      icon: "fas fa-comments",
      current: location === "/" || location.startsWith("/interview/")
    },
    {
      name: "Interview History",
      href: "/history",
      icon: "fas fa-chart-bar",
      current: location === "/history"
    },
    {
      name: "Templates",
      href: "#",
      icon: "fas fa-download",
      current: false
    },
    {
      name: "Settings",
      href: "#",
      icon: "fas fa-cog",
      current: false
    }
  ];

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-card border-r border-border">
        <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-table-cells text-primary-foreground text-sm"></i>
            </div>
            <span className="text-lg font-semibold">ExcelAI</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                item.current
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <i className={`${item.icon} mr-3 text-sm`}></i>
              {item.name}
            </a>
          ))}
        </nav>
        
        <div className="flex-shrink-0 p-4 border-t border-border">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Candidate
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors text-left"
            data-testid="button-logout"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

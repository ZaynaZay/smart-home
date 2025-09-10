import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  BrainCircuit,
  LayoutDashboard,
  Settings,
  User,
  LogOut,
  TerminalSquare,
  Bell, // NEW: Import Bell icons for snooze
  BellOff,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
// NEW: Import components for the snooze menu
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  // NEW: State to track if the user is currently snoozed
  const [isSnoozed, setIsSnoozed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      if (user) {
        // UPDATED: Fetch snooze_until along with other profile data
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, snooze_until")
          .eq("id", user.id)
          .single();

        if (isMounted) {
          if (error) console.error("Error fetching navbar profile:", error);
          else if (data) {
            setFullName(data.full_name);
            setAvatarUrl(data.avatar_url);
            // Check if the snooze period is still active
            const snoozeUntil = data.snooze_until
              ? new Date(data.snooze_until)
              : null;
            if (snoozeUntil && snoozeUntil > new Date()) {
              setIsSnoozed(true);
            } else {
              setIsSnoozed(false);
            }
          }
        }
      }
    };
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    setFullName(null);
    setAvatarUrl(null);
    setIsSnoozed(false); // Reset state on logout
    navigate("/");
  };

  // NEW: Handler for the snooze functionality
  const handleSnooze = async (durationMinutes: number) => {
    if (!user) return;
    let snoozeUntil = null;
    if (durationMinutes > 0) {
      snoozeUntil = new Date(
        Date.now() + durationMinutes * 60 * 1000
      ).toISOString();
    }
    const { error } = await supabase
      .from("profiles")
      .update({ snooze_until: snoozeUntil })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update snooze status.");
    } else {
      const newSnoozeState = durationMinutes > 0;
      setIsSnoozed(newSnoozeState);
      toast.success(
        newSnoozeState
          ? `Actions snoozed for ${durationMinutes} minutes.`
          : "Snooze canceled."
      );
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return user?.email?.[0].toUpperCase() ?? "?";
    const names = name.split(" ").filter((n) => n);
    return (
      names.length > 1
        ? names[0][0] + names[names.length - 1][0]
        : name.substring(0, 2)
    ).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">EmotiHome</span>
        </Link>
        <nav className="flex items-center space-x-2">
          {user ? (
            <>
              {/* --- NEW SNOOZE DROPDOWN --- */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Snooze Notifications"
                  >
                    {isSnoozed ? (
                      <BellOff className="h-5 w-5 text-red-500" />
                    ) : (
                      <Bell className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Snooze Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    {/* The onValueChange is a bit tricky, so we wrap it */}
                    <RadioGroup
                      onValueChange={(val) => handleSnooze(parseInt(val))}
                    >
                      <div className="flex items-center space-x-2 py-1">
                        <RadioGroupItem value="15" id="r1" />
                        <Label htmlFor="r1">15 minutes</Label>
                      </div>
                      <div className="flex items-center space-x-2 py-1">
                        <RadioGroupItem value="60" id="r2" />
                        <Label htmlFor="r2">1 hour</Label>
                      </div>
                      <div className="flex items-center space-x-2 py-1">
                        <RadioGroupItem value="240" id="r3" />
                        <Label htmlFor="r3">4 hours</Label>
                      </div>
                      <DropdownMenuSeparator className="my-2" />
                      <div className="flex items-center space-x-2 py-1">
                        <RadioGroupItem value="0" id="r4" />
                        <Label htmlFor="r4">Cancel Snooze</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* --- USER AVATAR DROPDOWN (Unchanged functionality) --- */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={avatarUrl ?? undefined}
                        alt="User Avatar"
                      />
                      <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {fullName || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/local-agent">
                      <TerminalSquare className="mr-2 h-4 w-4" />
                      <span>Local Agent</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account">
                      <User className="mr-2 h-4 w-4" />
                      <span>Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

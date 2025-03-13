
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, Award, Home, Trophy, User, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNavBar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  const navItems = [
    {
      label: "Home",
      icon: Home,
      path: "/",
    },
    {
      label: "Challenges",
      icon: Trophy,
      path: "/challenges",
    },
    {
      label: "Leaderboard",
      icon: Award,
      path: "/leaderboard",
    },
    {
      label: "Wallet",
      icon: Wallet,
      path: "/wallet",
    },
    {
      label: "Profile",
      icon: User,
      path: "/profile",
    },
  ];

  return (
    <div className="bottom-nav">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "bottom-nav-item",
              pathname === item.path
                ? "bottom-nav-item-active"
                : "bottom-nav-item-inactive"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNavBar;

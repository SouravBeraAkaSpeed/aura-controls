"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Settings, LogOut, Loader2, LayoutDashboard } from "lucide-react";

export const ProfileButton = () => {
    const { session, isLoading } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("sessionToken");
        window.location.href = "/";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-10 h-10">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
        );
    }

    // If the user is not signed in, this component will render nothing.
    if (!session) {
        return (
            <Button className="cursor-pointer" onClick={() => {
                router.push("/sign-in")
            }}>
                SignIn
            </Button>
        )
    }

    const getInitials = (name?: string | null) => {
        if (!name) return <User className="h-5 w-5" />;
        const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        return initials;
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${session.user.name}`} alt={session.user.name || "User"} />
                        <AvatarFallback className="bg-gray-700 text-gray-300">
                            {getInitials(session.user.name)}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-76 bg-[#08090E] border-gray-700 text-white mr-4 z-[120]">
                <div className="p-4">
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${session.user.name}`} alt={session.user.name || "User"} />
                            <AvatarFallback className="bg-gray-700 text-gray-300">
                                {getInitials(session.user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                            <p className="font-semibold truncate">{session.user.name || "User"}</p>
                            <p className="text-sm text-gray-400 truncate">{session.user.email}</p>
                        </div>
                    </div>
                </div>
                <Separator className="bg-gray-700" />
                <div className="p-2">
                    <Button variant="ghost" onClick={() => {
                        router.push("/dashboard")
                    }} className="w-full justify-start gap-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" /> App Dashboard
                    </Button>
                    <Button variant="ghost" onClick={handleLogout} className="w-full cursor-pointer justify-start gap-2 text-red-400 hover:text-red-400 hover:bg-red-900/50">
                        <LogOut className="h-4 w-4" /> Log Out
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
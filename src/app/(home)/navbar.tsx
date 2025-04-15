'use client'
import { Poppins } from "next/font/google";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { NavbarSidebar } from "./navbar-sidebar";
import { useState } from "react";
import { MenuIcon } from "lucide-react";


const poppins = Poppins({
    subsets: ["latin"],
    weight: ["700"],
});

interface NavbarItemProps {
    href: string;
    children: React.ReactNode;
    isActive?: boolean;
}

const NavbarItem = ({href, children, isActive}: NavbarItemProps) => {
    return (
        <Button asChild variant="outline" className={cn('bg-transparent rounded-full hover:bg-transparent hover:border-primary border-transparent px-3.5 text-lg', isActive && "bg-black text-white hover:bg-black hover:text-white")}><Link href={href}>{children}</Link></Button> 
    );
}
const navbarItems = [
    {
        href: "/",
        children: "Home",
    },
    {
        href: "/about",
        children: "About",
    },
    {
        href: "/features",
        children: "Features",
    },
    {
        href: "/pricing",
        children: "Pricing",
    },
    {
        href: "/contact",
        children: "Contact",
    }
];

export const Navbar = () => {

    const pathname = usePathname();
    const [isOpen, setIsOpen] =useState(false);
    return (
        <nav className="h-20 flex justify-between border-b font-medium bg-white">
            <Link href="/" className="pl-6 flex items-center">
                <span className={cn('text-5xl font-semibold',poppins.className)}>Encontralo</span>
            </Link>
            <NavbarSidebar open={isOpen} onOpenChange={setIsOpen} items={navbarItems} />
            <div className="items-center gap-4 hidden lg:flex">
                {navbarItems.map((item) => (
                    <NavbarItem key={item.href} href={item.href} isActive={pathname === item.href}>{item.children}</NavbarItem>
                ))}
            </div>
            <div className="hidden lg:flex">
                <Button asChild variant="secondary" className="border-0 border-l px-12 h-full rounded-none bg-white hover:bg-pink-400 transition-colors text-lg"><Link href='sign-in'>Log in</Link></Button>
                <Button asChild variant="secondary" className="border-0 border-l px-12 h-full rounded-none bg-black text-white hover:bg-pink-400 hover:text-black transition-colors text-lg"><Link href='sign-up'>Start selling</Link></Button>

            </div>
            <div className="items-center justify-center gap-4 flex lg:hidden"><Button variant="ghost" className="size-12 border-transparent bg-white " onClick={()=> setIsOpen(true)}><MenuIcon/></Button></div> 
        </nav>
    );
}
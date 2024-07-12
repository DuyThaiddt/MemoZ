"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { OrganizationSwitcher, useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Banknote, LayoutDashboard, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";


const font = Poppins({
    subsets: ["latin"],
    weight: ["600"],
});

export const OrgSidebar = () => {

    const searchParams = useSearchParams();
    const favorites = searchParams.get("favorites");

    const { organization } = useOrganization();
    const isSubscribed = useQuery(api.subscriptions.getIsSubscribed, {
        orgId: organization?.id,
    })

    const portal = useAction(api.stripe.portal)
    const pay = useAction(api.stripe.pay)
    const [pending, setPending] = React.useState(false);
    const onClick = async () => {
        if (!organization?.id) return
        setPending(true)
        try {
            const action = isSubscribed ? portal : pay
            const redirectUrl = await action({
                orgId: organization.id,
            })
            window.location.href = redirectUrl
        } catch {
            toast.error("Something went wrong")
        } finally {
            setPending(false)
        }
    }

    return (
        <div className=" hidden lg:flex flex-col space-y-6 w-[206px] pl-5 pt-5">
            <Link href="/">
                <div className="flex items-center gap-x-2">
                    <Image src="/logo.svg" alt="logo" height={60} width={60} />
                    <span className={cn(
                        "font-semibold text-2xl",
                        font.className,
                    )}>MemoZ</span>
                    <Badge variant="secondary">
                        {isSubscribed ? "Pro" : "Free"}
                    </Badge>
                </div>
            </Link>
            <OrganizationSwitcher hidePersonal appearance={{
                elements: {
                    rootBox: {
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        maxWidth: "376px"
                    },
                    organizationSwitcherTrigger: {
                        padding: "6px",
                        width: "100%",
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB",
                        justifyContent: "space-between",
                        backgroundColor: "white",
                    }
                }
            }} />
            <div className="space-y-1 w-full">
                <Button variant={favorites ? "ghost" : "secondary"} asChild size="lg" className="font-normal justify-start px-2 w-full">
                    <Link href="/">
                        <LayoutDashboard className="h-4 w-4 mr-2" /> Team boards
                    </Link>
                </Button>
                <Button variant={favorites ? "secondary" : "ghost"} asChild size="lg" className="font-normal justify-start px-2 w-full">
                    <Link href={{
                        pathname: "/",
                        query: { favorites: true }
                    }}>
                        <Star className="h-4 w-4 mr-2" /> Favourite boards
                    </Link>
                </Button>
                <Button onClick={onClick} disabled={pending} variant="ghost" size="lg" className="font-normal justify-start px-2 w-full">
                    <Banknote className="h-4 w-4 mr-2" />
                    {isSubscribed ? "Payment Settings" : "Upgrade to Pro"}
                </Button>
            </div>
        </div>
    )
}


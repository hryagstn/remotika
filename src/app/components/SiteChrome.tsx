"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Send } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const TELEGRAM_CHANNEL_URL = "https://t.me/remotika_updates";

const navigation = [
  { href: "/", label: "Direktori" },
  { href: "/cara-kerja", label: "Sumber data" },
  { href: "/readiness-check", label: "Cek kesiapan" },
  { href: "/berkontribusi", label: "Kontribusi" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-chrome">
      <div className="site-chrome__inner">
        <Link href="/" className="site-brand" aria-label="Remotika — halaman utama">
          <Image src="/logo.png" width={32} height={32} alt="" priority />
          <span>Remotika</span>
        </Link>

        <nav className="site-nav" aria-label="Navigasi utama">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/suggest-yourself"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "site-cta"
          )}
        >
          Tambahkan bukti
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="site-menu"
                aria-label={open ? "Tutup menu" : "Buka menu"}
              />
            }
          >
            <Menu className="size-5" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[340px] flex flex-col justify-between p-6">
            <div>
              <SheetHeader className="p-0 pb-4 text-left">
                <div className="flex items-center gap-2">
                  <Image src="/logo.png" width={28} height={28} alt="" />
                  <SheetTitle className="text-base font-semibold">Remotika</SheetTitle>
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">v1.4</Badge>
                </div>
                <SheetDescription className="text-xs text-muted-foreground mt-1">
                  Direktori perusahaan & talenta remote Indonesia
                </SheetDescription>
              </SheetHeader>
              <Separator className="my-3" />
              <nav className="flex flex-col gap-1 py-2" aria-label="Navigasi seluler">
                {navigation.map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <SheetClose
                      key={item.href}
                      render={
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center min-h-[44px] px-3 rounded-lg text-sm transition-colors",
                            active
                              ? "bg-accent text-accent-foreground font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        />
                      }
                    >
                      {item.label}
                    </SheetClose>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t flex flex-col gap-3">
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-accent/60 hover:bg-accent border border-border/70 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
                    <Send className="size-3.5 -translate-x-0.5 translate-y-0.5" aria-hidden="true" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-foreground">Telegram Channel</p>
                    <p className="text-[11px] text-muted-foreground">Update lowongan harian</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground group-hover:text-foreground">
                  Gabung ↗
                </Badge>
              </a>

              <SheetClose
                render={
                  <Link
                    href="/suggest-yourself"
                    className={cn(
                      buttonVariants({ variant: "default", size: "default" }),
                      "w-full rounded-xl bg-[#1d1d1f] text-white hover:bg-black font-semibold text-sm"
                    )}
                  />
                }
              >
                Tambahkan bukti
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="site-footer__brand !mb-0">Remotika</p>
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal text-muted-foreground">
              v1.4
            </Badge>
          </div>
          <p>Perusahaan, lowongan, dan jejak publik talenta Indonesia.</p>
        </div>
        <nav aria-label="Navigasi footer" className="items-center flex-wrap gap-4">
          <Link href="/cara-kerja">Sumber data</Link>
          <Link href="/berkontribusi">Kontribusi</Link>
          <Tooltip>
            <TooltipTrigger
              render={
                <a
                  href={TELEGRAM_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                />
              }
            >
              <Send className="size-3 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>Telegram</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground">
                Update harian
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              Dapatkan rangkuman lowongan & verifikasi harian di Telegram
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <a
                  href={process.env.NEXT_PUBLIC_GITHUB_REPO || "https://github.com/hryagstn/remotika"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                />
              }
            >
              GitHub
            </TooltipTrigger>
            <TooltipContent side="top">
              Buka repositori GitHub Remotika
            </TooltipContent>
          </Tooltip>
        </nav>
      </div>
    </footer>
  );
}

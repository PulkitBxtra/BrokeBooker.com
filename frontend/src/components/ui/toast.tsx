import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

type Ctx = {
  push: (t: Omit<ToastItem, "id">) => void;
};

const ToastCtx = React.createContext<Ctx | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error("ToastProvider missing");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const push = React.useCallback((t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setItems((prev) => [...prev, { id, ...t }]);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {items.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            onOpenChange={(open) => {
              if (!open) setItems((prev) => prev.filter((x) => x.id !== t.id));
            }}
            className={cn(
              "group pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg border p-4 pr-6 shadow-lg",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
              t.variant === "destructive" &&
                "border-red-200 bg-red-50 text-red-900",
              t.variant === "success" &&
                "border-emerald-200 bg-emerald-50 text-emerald-900",
              !t.variant && "border-slate-200 bg-white text-slate-900"
            )}
          >
            <div className="flex flex-col gap-1">
              <ToastPrimitive.Title className="text-sm font-semibold">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="text-sm opacity-90">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-auto sm:top-4 sm:right-4 sm:flex-col md:max-w-[420px]" />
      </ToastPrimitive.Provider>
    </ToastCtx.Provider>
  );
}

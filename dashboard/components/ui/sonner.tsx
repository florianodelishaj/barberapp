"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#242424] group-[.toaster]:text-[#F0F0F0] group-[.toaster]:border-[#333] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-[#C6C6C6]",
          actionButton: "group-[.toast]:bg-[#FA3D3B] group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-[#333] group-[.toast]:text-[#C6C6C6]",
        },
      }}
      {...props}
    />
  );
}

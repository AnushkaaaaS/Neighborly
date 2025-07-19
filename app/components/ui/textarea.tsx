// components/ui/textarea.tsx
import * as React from "react";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`w-full p-2 bg-slate-700 text-white rounded ${className}`}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";
import { Input } from "@/components/pc/primitives";

export const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative block">
      <Input ref={ref} {...props} type={show ? "text" : "password"} className="pr-12" />
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); setShow((v) => !v); }}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </span>
  );
});
PasswordInput.displayName = "PasswordInput";

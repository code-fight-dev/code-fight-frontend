import { cn } from "@/shared/lib/cn";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export function Container({ className, children }: Props) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-420 px-4 sm:px-6 md:px-8 xl:px-10 2xl:max-w-470 2xl:px-12",
        className,
      )}
    >
      {children}
    </div>
  );
}

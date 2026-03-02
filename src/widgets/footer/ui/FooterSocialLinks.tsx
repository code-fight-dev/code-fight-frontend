import { IconButton } from "@/shared/ui/IconButton";
import { FOOTER_SOCIAL_LINKS } from "../model/socialLinks";
import type { FooterSocialLink } from "../model/types";

function FooterSocialIcon({ icon }: Pick<FooterSocialLink, "icon">) {
  if (icon === "x") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.25l-4.9-6.4L6.45 22H3.34l7.24-8.28L.8 2h6.4l4.43 5.9L18.9 2Zm-1.1 18h1.73L6.27 3.9H4.42L17.8 20Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M12 .5C5.65.5.5 5.68.5 12.07c0 5.1 3.3 9.42 7.88 10.95.58.1.8-.26.8-.57 0-.28-.02-1.22-.02-2.2-3.2.7-3.87-1.38-3.87-1.38-.52-1.35-1.28-1.7-1.28-1.7-1.04-.73.08-.71.08-.71 1.15.08 1.76 1.2 1.76 1.2 1.02 1.78 2.67 1.26 3.32.96.1-.75.4-1.26.72-1.55-2.56-.3-5.26-1.3-5.26-5.8 0-1.28.46-2.32 1.2-3.14-.12-.3-.52-1.5.12-3.12 0 0 .98-.32 3.2 1.2a10.93 10.93 0 0 1 5.82 0c2.2-1.52 3.18-1.2 3.18-1.2.66 1.62.26 2.82.14 3.12.76.82 1.2 1.86 1.2 3.14 0 4.5-2.72 5.48-5.32 5.78.42.36.78 1.04.78 2.12 0 1.52-.02 2.74-.02 3.12 0 .32.2.7.8.58A11.6 11.6 0 0 0 23.5 12.07C23.5 5.68 18.35.5 12 .5Z" />
    </svg>
  );
}

export function FooterSocialLinks() {
  return (
    <div className="flex items-center gap-4 sm:gap-5">
      {FOOTER_SOCIAL_LINKS.map((link) => (
        <IconButton
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={link.label}
          className="h-auto w-auto rounded-full p-2 text-(--app-text-soft)"
        >
          <FooterSocialIcon icon={link.icon} />
        </IconButton>
      ))}
    </div>
  );
}

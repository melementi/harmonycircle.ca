import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

/**
 * ISLAND JUSTIFICATION
 *
 * What needs it: opening and closing a modal menu. `<details>` — the Astro-only
 * answer used for the Accordion — gives a disclosure, not a modal: it does not
 * trap focus, does not close on Escape, does not make the page behind it inert,
 * and does not restore focus to the trigger. A menu that leaks focus to the
 * page behind it is a keyboard trap in reverse; a screen-reader user tabs out
 * of the open menu into content they cannot see.
 *
 * Why so little code: the element does the work. `<dialog>` opened with
 * `showModal()` puts the panel in the top layer and gets focus containment,
 * Escape-to-close, an inert background and focus restoration to the invoker
 * from the browser. Hand-rolling those is how they end up subtly wrong.
 *
 * The top layer also sidesteps a trap this component hit while being built.
 * The header carries `backdrop-blur-sm`, and `backdrop-filter` establishes a
 * containing block for `position: fixed` descendants — so a `fixed inset-0`
 * panel rendered inside the header resolved to the header's own 390x76 box
 * instead of the viewport. A `<dialog>` in the top layer is not laid out
 * against any ancestor at all.
 *
 * Loaded `client:idle`: the trigger is above the fold, so `client:visible`
 * would leave a navigation control inert exactly when it is on screen. Every
 * link inside is a real anchor and works regardless.
 */

export interface NavLink {
  href: string;
  label: string;
}

interface Props {
  links: NavLink[];
  currentPath: string;
  openLabel: string;
  closeLabel: string;
  donateLabel: string;
}

export default function MobileNav({
  links,
  currentPath,
  openLabel,
  closeLabel,
  donateLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      // showModal does not stop the page behind from scrolling.
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }

    if (!open) document.body.style.overflow = "";
  }, [open]);

  useEffect(() => () => void (document.body.style.overflow = ""), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="mobile-nav"
        className="grid size-11 place-items-center text-ink lg:hidden"
      >
        <Menu size={20} aria-hidden="true" />
        <span className="sr-only">{openLabel}</span>
      </button>

      <dialog
        id="mobile-nav"
        ref={dialogRef}
        aria-label={openLabel}
        onClose={() => setOpen(false)}
        className="on-ink m-0 h-full max-h-none w-full max-w-none bg-ink p-0 text-paper backdrop:bg-ink/60 lg:hidden"
      >
        <div className="flex h-full flex-col px-6 py-5">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-11 place-items-center text-paper"
            >
              <X size={20} aria-hidden="true" />
              <span className="sr-only">{closeLabel}</span>
            </button>
          </div>

          <nav aria-label={openLabel} className="mt-8 flex flex-col gap-1">
            {links.map((link) => {
              const current = currentPath === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={current ? "page" : undefined}
                  className={
                    "display-3 flex items-center gap-3 py-2 " +
                    (current ? "text-paper" : "text-paper/70 hover:text-paper")
                  }
                >
                  {/* Accent measures 2.37:1 on ink, so the current page is not
                      marked by colour here. Full-strength paper against
                      paper/70, plus aria-current, plus a bullet. */}
                  <span
                    aria-hidden="true"
                    className={
                      "size-2 shrink-0 rounded-full bg-paper " + (current ? "" : "invisible")
                    }
                  />
                  {link.label}
                </a>
              );
            })}
          </nav>

          <a
            href="/donate"
            className="label mt-auto inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-7 text-white"
          >
            {donateLabel}
          </a>
        </div>
      </dialog>
    </>
  );
}

// Phone-size header menu: the ☰ button opens and closes the About us / Sign out panel.
// On wider screens the button is hidden by CSS and the panel shows inline.

const btn = document.getElementById("menuBtn");
const menu = document.getElementById("topMenu");

if (btn && menu) {
  const setOpen = (open) => {
    menu.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(!menu.classList.contains("open"));
  });

  // Close when tapping outside, pressing Escape, picking an item, or growing back to desktop size.
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) { setOpen(false); btn.focus(); }
  });
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a, button")) setOpen(false);
  });
  window.matchMedia("(min-width: 641px)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });
}

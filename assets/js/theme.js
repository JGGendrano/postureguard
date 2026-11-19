// PostureGuard theme controller.
// Default is "light". Signed-in users save their preference per account
// (localStorage + Firebase RTDB when configured). Demo mode stays default light on load.

const SDK = "https://www.gstatic.com/firebasejs/13.3.0/";
const VALID = new Set(["light", "dark"]);
const normalize = (v) => (VALID.has(v) ? v : "light");

function applyTheme(theme) {
  const mode = normalize(theme);
  document.documentElement.dataset.theme = mode;

  const dropdown = document.getElementById("themeDropdown");
  if (dropdown) {
    dropdown.querySelectorAll(".theme-option").forEach((opt) => {
      const active = opt.dataset.themeValue === mode;
      opt.classList.toggle("is-active", active);
      opt.setAttribute("aria-checked", String(active));
    });
  }
  return mode;
}

function themeStore(session, isDemo) {
  // Demo mode / no account: always default to light, never persist across visits.
  if (isDemo || !session || !session.user) {
    return {
      async load() { return "light"; },
      async save() {}
    };
  }

  const uid = session.user.uid;
  const key = "pg_theme_" + uid;
  const rtdb = session.fb && session.fb.db ? session.fb.db : null;

  return {
    async load() {
      let local = null;
      try { local = localStorage.getItem(key); } catch {}
      if (VALID.has(local)) return local;

      if (rtdb) {
        try {
          const db = await import(SDK + "firebase-database.js");
          const snap = await db.get(db.ref(rtdb, `users/${uid}/theme`));
          if (snap.exists() && VALID.has(snap.val())) {
            try { localStorage.setItem(key, snap.val()); } catch {}
            return snap.val();
          }
        } catch (err) {
          console.warn("Couldn't read saved theme", err);
        }
      }
      return "light";
    },

    async save(mode) {
      const clean = normalize(mode);
      try { localStorage.setItem(key, clean); } catch {}
      if (rtdb) {
        try {
          const db = await import(SDK + "firebase-database.js");
          await db.set(db.ref(rtdb, `users/${uid}/theme`), clean);
        } catch (err) {
          console.warn("Couldn't save theme", err);
        }
      }
    }
  };
}

export async function initTheme({ session = null, isDemo = false, onChange } = {}) {
  const store = themeStore(session, isDemo);
  const initial = applyTheme(await store.load());
  if (onChange) onChange(initial);

  const menu = document.getElementById("themeMenu");
  const btn = document.getElementById("themeBtn");
  const dropdown = document.getElementById("themeDropdown");
  if (!menu || !btn || !dropdown) return;

  const setOpen = (open) => {
    dropdown.hidden = !open;
    menu.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(dropdown.hidden);
  });

  dropdown.addEventListener("click", async (e) => {
    const opt = e.target.closest(".theme-option");
    if (!opt) return;
    const next = applyTheme(opt.dataset.themeValue);
    setOpen(false);
    if (onChange) onChange(next);
    await store.save(next);
  });

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target)) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !dropdown.hidden) {
      setOpen(false);
      btn.focus();
    }
  });
}
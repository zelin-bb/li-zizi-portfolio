const root = document.documentElement;
const body = document.body;

requestAnimationFrame(() => body.classList.add("is-loaded"));

const progress = () => {
  const scrollable = root.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  root.style.setProperty("--scroll", Math.min(1, Math.max(0, ratio)).toFixed(4));
};

progress();
window.addEventListener("scroll", progress, { passive: true });
window.addEventListener("resize", progress);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.06 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const filterButtons = document.querySelectorAll(".filter-button");
const videoCards = document.querySelectorAll(".video-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    videoCards.forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

const modal = document.querySelector(".video-modal");
const modalVideo = document.querySelector(".modal-video");
const modalTitle = document.querySelector("#video-modal-title");
let lastVideoTrigger = null;

const closeVideoModal = () => {
  if (!modal || !modalVideo) return;

  modalVideo.pause();
  modalVideo.removeAttribute("src");
  modalVideo.removeAttribute("poster");
  modalVideo.load();
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  body.classList.remove("modal-open");

  if (lastVideoTrigger) {
    lastVideoTrigger.focus();
  }
};

videoCards.forEach((card) => {
  card.addEventListener("click", () => {
    if (!modal || !modalVideo || !modalTitle) return;

    lastVideoTrigger = card;
    modalTitle.textContent = card.dataset.title || "作品预览";
    modalVideo.src = card.dataset.video;
    modalVideo.poster = card.dataset.poster || "";
    modalVideo.muted = false;
    modalVideo.volume = 1;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");
    modal.querySelector(".modal-close").focus({ preventScroll: true });

    const playPromise = modalVideo.play();
    if (playPromise) {
      playPromise.catch(() => {
        modalVideo.controls = true;
      });
    }
  });
});

document.querySelectorAll("[data-close-video]").forEach((element) => {
  element.addEventListener("click", closeVideoModal);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal && !modal.hidden) {
    closeVideoModal();
  }
});

const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (canHover) {
  const cursor = document.querySelector(".cursor-dot");
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let targetX = cursorX;
  let targetY = cursorY;

  const moveCursor = () => {
    cursorX += (targetX - cursorX) * 0.18;
    cursorY += (targetY - cursorY) * 0.18;
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
    requestAnimationFrame(moveCursor);
  };

  moveCursor();

  window.addEventListener(
    "pointermove",
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
    },
    { passive: true }
  );

  document.querySelectorAll("a, button, .tilt-card, .chip-cloud span").forEach((element) => {
    element.addEventListener("pointerenter", () => cursor.classList.add("is-active"));
    element.addEventListener("pointerleave", () => cursor.classList.remove("is-active"));
  });

  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });

  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      element.style.transform = `translate(${x * 0.16}px, ${y * 0.16}px)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "translate(0, 0)";
    });
  });
}

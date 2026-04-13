const revealItems = document.querySelectorAll(".reveal-sequence");
const contactForm = document.querySelector("#contact-form");
const formMessage = document.querySelector("#form-message");
const tcsDuration = document.querySelector("#tcs-duration");
const submitFrame = document.querySelector("#sheet-submit-frame");
const SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbzr_dOcv5xhre6n_pNnJCYQX3WchU-Vs9pxXKsiIH_JcA9o6NE6jb28UZq1VChByRPqfg/exec";

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealItems.forEach((item) => {
  revealObserver.observe(item);
});

if (tcsDuration) {
  const startYear = Number(tcsDuration.dataset.startYear);
  const startMonth = Number(tcsDuration.dataset.startMonth);

  if (startYear && startMonth) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    let totalMonths = (currentYear - startYear) * 12 + (currentMonth - startMonth);

    if (totalMonths < 0) {
      totalMonths = 0;
    }

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    let label = "";

    if (years > 0 && months > 0) {
      label = `${years} Year${years > 1 ? "s" : ""} ${months} Month${months > 1 ? "s" : ""}`;
    } else if (years > 0) {
      label = `${years} Year${years > 1 ? "s" : ""}`;
    } else {
      label = `${months} Month${months !== 1 ? "s" : ""}`;
    }

    tcsDuration.textContent = label;
  }
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const payload = {
      nameOrCompany: String(formData.get("nameOrCompany") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
    };

    if (!payload.nameOrCompany) {
      formMessage.textContent = "Please enter your name or company.";
      formMessage.dataset.state = "error";
      return;
    }

    if (!payload.email && !payload.phone) {
      formMessage.textContent = "Please provide either an email ID or a phone number.";
      formMessage.dataset.state = "error";
      return;
    }

    if (!SHEET_ENDPOINT) {
      formMessage.textContent =
        "Form is ready, but the Google Sheet endpoint still needs to be connected.";
      formMessage.dataset.state = "error";
      return;
    }

    try {
      formMessage.textContent = "Sending your details...";
      formMessage.dataset.state = "loading";

      const params = new URLSearchParams({
        nameOrCompany: payload.nameOrCompany,
        email: payload.email,
        phone: payload.phone,
        submittedAt: new Date().toISOString(),
      });

      if (submitFrame) {
        submitFrame.src = `${SHEET_ENDPOINT}?${params.toString()}`;
      }

      formMessage.textContent =
        "Thank you for choosing me, I will reach you shortly";
      formMessage.dataset.state = "success";
      contactForm.reset();
    } catch (error) {
      formMessage.textContent =
        "Unable to submit right now. Please use phone or email until the sheet connection is live.";
      formMessage.dataset.state = "error";
    }
  });
}

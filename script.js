// === LIST YOUR ART FILES HERE ===
const artFolder = "art/";
const artFiles = [
  "Cas.png",
  "Halfinvis1.png",
  "Cube.png",
  "pepper.png",
  "Pomegranate.png",
];

// Shuffle array (Fisher–Yates)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

shuffle(artFiles);

// Assign first 3 randomly
document.getElementById("art1").src = artFolder + artFiles[0];
document.getElementById("art2").src = artFolder + artFiles[1];
document.getElementById("art3").src = artFolder + artFiles[2];

// Ripple interaction
document.querySelectorAll(".art-media").forEach(media => {
  const ripple = media.querySelector(".ripple");

  media.addEventListener("mousemove", e => {
    const rect = media.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left - 10}px`;
    ripple.style.top = `${e.clientY - rect.top - 10}px`;
    media.classList.add("active");
  });

  media.addEventListener("mouseleave", () => {
    media.classList.remove("active");
  });
});

// === SIDE PANEL SYSTEM ===
const panel = document.getElementById("sidePanel");
const overlay = document.getElementById("sideOverlay");
const content = document.getElementById("sideContent");

const panels = {
  copyright: `
    <h2>Copyright</h2>
    <ul>
      <li>© 2025 Jay. Website design, layout, code, and original content are my property.</li>
      <li>Original works include my writing, designs, and artwork.</li>
      <li>Some pieces may be practice art or fan art; only my originals are fully owned by me.</li>
      <li>Original works may <strong>not</strong> be reused, redistributed, modified, or used for training without permission.</li>
      <li>Fan art and practice pieces remain the property of their creators and are shown for portfolio, educational, or non-commercial purposes only.</li>
      <li>The portfolio is updated regularly with new projects.</li>
    </ul>
  `,

  contact: `
    <h2>Contact</h2>
    <p>For commissions, collaborations, partnerships, or general inquiries:</p>
    <p>
      <a href="mailto:jaykayot0byz@gmail.com" style="color: var(--accent); text-decoration: none;">
        jaykayot0byz@gmail.com
      </a>
    </p>
  `,
};



document.querySelectorAll(".info-bar button").forEach(btn => {
  btn.addEventListener("click", () => {
    content.innerHTML = panels[btn.dataset.panel];
    panel.classList.add("active");
    overlay.classList.add("active");
  });
});

function closePanel() {
  panel.classList.remove("active");
  overlay.classList.remove("active");
}

overlay.addEventListener("click", closePanel);
document.addEventListener("keydown", closePanel);

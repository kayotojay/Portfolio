// === LIST YOUR ART FILES HERE ===
const artFolder = "art/";
const artFiles = [,
  "Cas.png",
  "Halfinvis1.png",
  "Cube.png",,
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

document.querySelectorAll(".art-media").forEach(media => {
  const ripple = media.querySelector(".ripple");

  media.addEventListener("mousemove", e => {
    const rect = media.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ripple.style.left = `${x - 10}px`;
    ripple.style.top = `${y - 10}px`;

    media.classList.add("active");
  });

  media.addEventListener("mouseleave", () => {
    media.classList.remove("active");
  });
});

const banner = document.getElementById("copyrightBanner");
const details = document.getElementById("copyrightDetails");

banner.addEventListener("click", () => {
  details.style.display = (details.style.display === "block") ? "none" : "block";
});



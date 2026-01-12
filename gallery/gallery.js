const artFolder = "../art/";

let artFiles = [];

async function loadArtData() {
    const res = await fetch("art.json");

    artFiles = await res.json();
    loadGallery(artFiles);
}

loadArtData();

// Elements
const gallery = document.getElementById("fullGallery");
const searchInput = document.getElementById("searchInput");

// ===== CREATE LAZY LOAD + FADE-IN OBSERVER =====
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add("fade-in");
            observer.unobserve(img);
        }
    });
}, { rootMargin: "100px" }); // preload just before visible

// ===== LOAD GALLERY =====
function loadGallery(list) {
    gallery.innerHTML = "";
    list.forEach(a => {
        const card = document.createElement("div");
        card.classList.add("art-card");

        // Image container
        const media = document.createElement("div");
        media.classList.add("art-media");

        const img = document.createElement("img");
        img.classList.add("art-thumb");
        img.dataset.date = a.date;
        img.dataset.title = a.title;
        img.dataset.tags = a.tags.join(" ");

        img.dataset.src = artFolder + a.file; // lazy load
        img.src = ""; // start empty

        const ripple = document.createElement("span");
        ripple.classList.add("ripple");

        media.appendChild(img);
        media.appendChild(ripple);
        card.appendChild(media);

        // Info container
        const info = document.createElement("div");
        info.classList.add("info");
        const dateEl = document.createElement("div");
        dateEl.classList.add("art-date");
        dateEl.textContent = a.date;
        
        const titleEl = document.createElement("div");
        titleEl.classList.add("art-title");
        titleEl.textContent = a.title;

        const tagsEl = document.createElement("div");
        tagsEl.classList.add("art-tags");

        a.tags.forEach(tag => {
            const span = document.createElement("span");
            span.classList.add("art-tag");
            span.textContent = `#${tag}`;

            span.addEventListener("click", e => {
                e.stopPropagation();
                searchInput.value = tag;
                searchInput.dispatchEvent(new Event("input"));
            });

            tagsEl.appendChild(span);
        });

        info.appendChild(dateEl);
        info.appendChild(titleEl);
        info.appendChild(tagsEl);

        card.appendChild(info);

        gallery.appendChild(card);

        // Ripple hover effect
        media.addEventListener("mousemove", e => {
            const rect = media.getBoundingClientRect();
            ripple.style.left = `${e.clientX - rect.left - 10}px`;
            ripple.style.top = `${e.clientY - rect.top - 10}px`;
            media.classList.add("active");
        });
        media.addEventListener("mouseleave", () => media.classList.remove("active"));

        // Open modal
        img.addEventListener("click", () => openModal(img.dataset.src));

        // Observe for lazy fade-in
        observer.observe(img);
    });
}

// ===== MODAL =====
const modal = document.getElementById("artModal");
const modalImg = modal.querySelector(".modal-img");
function openModal(src) {
    modalImg.src = src;
    modal.classList.add("show");
}
modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("show"); });
document.addEventListener("keydown", e => { if (e.key === "Escape") modal.classList.remove("show"); });

// ===== FILTER BUTTONS =====
document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        let sorted;
        const filter = btn.dataset.filter;
        if (filter === "all") sorted = [...artFiles];
        else if (filter === "newest") sorted = [...artFiles].sort((a,b) => new Date(b.date) - new Date(a.date));
        else if (filter === "oldest") sorted = [...artFiles].sort((a,b) => new Date(a.date) - new Date(b.date));

        // Apply search

        const query = searchInput.value.toLowerCase();

        let filtered = artFiles.filter(a =>
            a.title.toLowerCase().includes(query) ||
            a.tags.some(t => t.toLowerCase().includes(query))
        );
        loadGallery(sorted);
    });
});

// ===== SEARCH =====
searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();

    let filtered = artFiles.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.tags.some(t => t.toLowerCase().includes(query))
    );


    const activeFilter = document.querySelector(".filter-btn.active");
    if (activeFilter) {
        const filter = activeFilter.dataset.filter;
        if (filter === "newest") filtered.sort((a,b) => new Date(b.date) - new Date(a.date));
        else if (filter === "oldest") filtered.sort((a,b) => new Date(a.date) - new Date(b.date));
    }

    loadGallery(filtered);
});

// ===== INITIAL LOAD =====
loadGallery(artFiles);


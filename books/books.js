const booksFolder = "books-data/";
const booksListEl = document.getElementById("booksList");
const modal = document.getElementById("bookModal");
const bookPage = document.getElementById("bookPage");
const closeBookBtn = document.getElementById("closeBook");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");

let books = [];
let pages = [];
let currentPage = 0;

// Load books.json
fetch("books.json")
  .then(res => res.json())
  .then(data => {
    books = data;
    renderBooks();
  })
  .catch(err => console.error(err));

// Grab all filter buttons
const filterButtons = document.querySelectorAll(".gallery-filters .filter-btn");

// Add click event to each
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter; // "all", "newest", "oldest"

    // Remove "active" class from all, add to current
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (filter === "newest") {
      sortBooks("newest");
    } else if (filter === "oldest") {
      sortBooks("oldest");
    } else {
      renderBooks(); // "all" just renders without sorting
    }
  });
});

// Sort function
function sortBooks(order = "newest") {
  books.sort((a, b) => {
    const dateA = a.dateCompleted || a.dateStarted || "0000-00-00";
    const dateB = b.dateCompleted || b.dateStarted || "0000-00-00";
    return order === "newest"
      ? new Date(dateB) - new Date(dateA)
      : new Date(dateA) - new Date(dateB);
  });
  renderBooks();
}

// Render book shelf
function renderBooks() {
  booksListEl.innerHTML = "";
  books.forEach((b, i) => {
    const coverSrc = b.cover ? b.cover : "placeholder.png"; // use cover or fallback
    const div = document.createElement("div");
    div.className = "book-item";

    // Build date info
    let dateInfo = `Started: ${b.dateStarted || "N/A"}`;
    if (b.dateCompleted) {
      dateInfo += ` | Completed: ${b.dateCompleted}`;
    }


    div.innerHTML = `
    <img src="${booksFolder + coverSrc}" alt="${b.title} Cover">
    <div class="book-title">${b.title}</div>
    <div class="book-tags">${b.tags}</div>
    <div class="book-dates" style="font-size:0.8rem; color: #aaa; margin-top: 4px;">
      ${dateInfo}
    </div>
    <button class="download-btn" style="
      margin-top:5px;
      background-color:#242450;
      color:#fff;
      border:none;
      padding:6px 12px;
      border-radius:4px;
      cursor:pointer;
      transition:0.2s;
    ">Download</button>
  `;

    div.querySelector(".download-btn").onmouseover = function () {
      this.style.backgroundColor = "#151529";
    };
    div.querySelector(".download-btn").onmouseout = function () {
      this.style.backgroundColor = "#242450";
    };


    div.querySelector(".download-btn").onclick = (e) => {
      e.stopPropagation(); // prevent opening the book
      downloadBook(b.file, b.title + ".docx");
    };

    div.onclick = () => openBook(i);
    booksListEl.appendChild(div);
  });
}


function downloadBook(file, filename) {
  const link = document.createElement("a");
  link.href = booksFolder + file;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}



// === Paginate by Word page breaks ===
function paginateByPageBreaks(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const pages = [];
  let currentPageHTML = "";

  temp.childNodes.forEach(node => {
    const nodeHTML = node.outerHTML || node.textContent || "";
    if (node.classList && node.classList.contains("page-break")) {
      if (currentPageHTML.trim()) pages.push(currentPageHTML);
      currentPageHTML = "";
    } else {
      currentPageHTML += nodeHTML;
      // fallback: if page gets too big, force split
      if (currentPageHTML.length > 2000) {
        pages.push(currentPageHTML);
        currentPageHTML = "";
      }
    }
  });

  if (currentPageHTML.trim()) pages.push(currentPageHTML);
  return pages;
}


// Split large blocks into multiple pages
function splitBlock(block, maxChars, pagesArray) {
  let start = 0;
  while (start < block.length) {
    pagesArray.push(block.slice(start, start + maxChars));
    start += maxChars;
  }
}


function splitBlock(block, maxChars, pages) {
  let start = 0;
  while (start < block.length) {
    pages.push(block.slice(start, start + maxChars));
    start += maxChars;
  }
}


// Open book
async function openBook(index) {
  const b = books[index];
  currentPage = 0;

  try {
    const res = await fetch(booksFolder + b.file);
    const buffer = await res.arrayBuffer();

    // Convert DOCX to HTML and preserve page breaks
    const result = await mammoth.convertToHtml({
      arrayBuffer: buffer,
      styleMap: ["page-break => .page-break"]
    });

    pages = paginateByPageBreaks(result.value); // <-- mandatory split here
    renderPage();
    modal.classList.add("show");
  } catch (err) {
    console.error("Failed to load book:", err);
    bookPage.innerHTML = "Failed to load book.";
    modal.classList.add("show");
  }
}


// Render page with number at the top
function renderPage() {
  if (!pages.length) {
    bookPage.innerHTML = "No content.";
    return;
  }

  bookPage.innerHTML = `
    <p style="text-align:right; font-size:0.9rem; opacity:0.6; margin-bottom: 8px;">
      Page ${currentPage + 1} of ${pages.length}
    </p>
    <div style="white-space: pre-wrap; text-align:left; line-height:1.6; color:white;">
      ${pages[currentPage]}
    </div>
  `;
}



// Navigation
prevPageBtn.onclick = () => {
  if (currentPage > 0) {
    currentPage--;
    renderPage();
  }
};

nextPageBtn.onclick = () => {
  if (currentPage < pages.length - 1) {
    currentPage++;
    renderPage();
  }
};

// Click left/right halves
modal.addEventListener("click", (e) => {
  if (e.target.closest("button")) return;

  const width = modal.clientWidth;
  const x = e.clientX;

  if (x < width / 2) {
    if (currentPage > 0) currentPage--;
  } else {
    if (currentPage < pages.length - 1) currentPage++;
  }
  renderPage();
});

// Close book
closeBookBtn.onclick = () => modal.classList.remove("show");
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeBookBtn.click();
});

// Sort books from newest to oldest by dateCompleted (fallback to dateStarted)
function sortBooksByDate() {
  books.sort((a, b) => {
    const dateA = a.dateCompleted || a.dateStarted || "0000-00-00";
    const dateB = b.dateCompleted || b.dateStarted || "0000-00-00";
    return new Date(dateB) - new Date(dateA); // newest first
  });
}
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    renderBooks(); // show all if empty
    return;
  }

  const filteredBooks = books.filter(b => {
    const titleMatch = b.title.toLowerCase().includes(query);
    const tagsMatch = b.tags && b.tags.toLowerCase().includes(query);
    return titleMatch || tagsMatch;
  });

  renderBooks(filteredBooks);
});

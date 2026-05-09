// ================= THEME =================
const toggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
}

if (toggle) {
    toggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");

        if (current === "dark") {
            document.documentElement.setAttribute("data-theme", "light");
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        }
    });
}

// ================= PRIVACY POPUP =================
document.addEventListener("DOMContentLoaded", () => {
    document.body.insertAdjacentHTML("beforeend", `
        <div id="privacyPopup" class="privacy-popup hidden">
            <p>
                We use basic data to run this site. Please review our 
                <a href="privacy.html">Privacy Policy</a>.
            </p>
            <button id="acceptPrivacy">Got it</button>
        </div>
    `);

    const popup = document.getElementById("privacyPopup");
    const acceptBtn = document.getElementById("acceptPrivacy");

    const hasSeen = localStorage.getItem("privacySeen");

    if (hasSeen || window.location.pathname.includes("privacy.html")) {
        popup.classList.add("hidden");
        return;
    }

    popup.classList.remove("hidden");

    acceptBtn.addEventListener("click", () => {
        localStorage.setItem("privacySeen", "true");
        popup.classList.add("hidden");
    });

    popup.querySelector("a").addEventListener("click", () => {
        localStorage.setItem("privacySeen", "true");
    });
});

// ================= CHAOS MODE =================
document.addEventListener("DOMContentLoaded", () => {
    const chaosBtn = document.getElementById("chaosBtn");
    const errorContent = document.getElementById("errorContent");
    const chaosMode = document.getElementById("chaosMode");

    const catGrid = document.getElementById("catGrid");
    const furryGrid = document.getElementById("furryGrid");

    if (!chaosBtn) return;

    chaosBtn.addEventListener("click", () => {
        errorContent.classList.add("hidden");
        chaosMode.classList.remove("hidden");

        loadCats(catGrid);
        loadFurryAvatars(furryGrid);
    });
});

// ================= CAT API =================
async function loadCats(catGrid) {
    if (!catGrid) return;

    try {
        const res = await fetch("https://api.thecatapi.com/v1/images/search?limit=10");
        const data = await res.json();

        catGrid.innerHTML = "";

        data.forEach(cat => {
            const div = document.createElement("div");
            div.className = "cat-card";
            div.innerHTML = `<img src="${cat.url}">`;
            catGrid.appendChild(div);
        });

    } catch {
        catGrid.innerHTML = "<p>cats failed 😔</p>";
    }
}

// ================= DISCORD AVATARS (404 PAGE) =================
async function loadFurryAvatars(furryGrid) {
    if (!furryGrid) return;

    const members = [
        { id: "258706134850863106" },
        { id: "690720906590552094" },
        { id: "1092162323021566103" },
        { id: "652250448631431170" },
        { id: "815652645443993650" },
        { id: "1092896609295138837" }
    ];

    furryGrid.innerHTML = "";

    for (const member of members) {
        try {
            const res = await fetch(`/api/discord?user=${member.id}`);
            const data = await res.json();

            const div = document.createElement("div");
            div.className = "cat-card";

            div.innerHTML = `
                <img src="${data.avatar}">
                <span>${data.username}</span>
            `;

            furryGrid.appendChild(div);

        } catch {
            console.log("avatar failed");
        }
    }
}

// ================= TEAM PAGE AVATARS =================
document.addEventListener("DOMContentLoaded", async () => {

    const cards = document.querySelectorAll(".team-card");

    for (const card of cards) {
        const discordId = card.dataset.discord;
        if (!discordId) continue;

        const img = card.querySelector(".profile-img");

        try {
            const res = await fetch(`/api/discord?user=${discordId}`);
            const data = await res.json();

            if (data.avatar) {
              img.src = data.avatar;

img.onload = () => {
  img.classList.remove("avatar-loading");
};
                img.style.opacity = "0";
                img.style.transition = "opacity 0.3s ease";

                setTimeout(() => {
                    img.style.opacity = "1";
                }, 50);
            }

        } catch {
            console.log("avatar load failed for", discordId);
        }
    }

});

// ================= TEAM MODAL =================
document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("profileModal");
    const modalImg = document.getElementById("modalImg");
    const modalName = document.getElementById("modalName");
    const modalDesc = document.getElementById("modalDesc");
    const modalRole = document.getElementById("modalRole");
    const modalLinks = document.getElementById("modalLinks");
    const modalPronoun = document.getElementById("modalPronoun");
    const modalClose = document.getElementById("modalClose");

    if (!modal) return;

    document.querySelectorAll(".team-card").forEach(card => {
        card.onclick = function (e) {

            if (e.target.closest("a")) return;

            modalImg.src = this.querySelector(".profile-img")?.src || "";
            modalName.textContent = this.querySelector("h3")?.textContent || "";

            modalDesc.textContent = this.dataset.modalDesc || "";
            modalRole.textContent = this.dataset.modalRole || "";
            modalPronoun.textContent = this.dataset.modalPronouns || "";

            modalLinks.innerHTML = "";
            const links = this.querySelector(".team-links");
            if (links) modalLinks.innerHTML = links.innerHTML;

            modal.classList.add("active");
        };
    });

    modalClose.onclick = () => modal.classList.remove("active");

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove("active");
        }
    };

});

// ================= TEAM FILTERS =================
document.addEventListener("DOMContentLoaded", () => {

    const filterButtons = document.querySelectorAll(".team-filters button");
    const filterCards = document.querySelectorAll(".team-card");

    if (!filterButtons.length) return;

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelector(".team-filters .active").classList.remove("active");
            btn.classList.add("active");

            const filter = btn.dataset.filter;

            filterCards.forEach(card => {
                const categories = card.dataset.category.split(" ");

                if (filter === "all" || categories.includes(filter)) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });

});

// ================= AVATAR LOAD WATCHDOG =================
// avatar fallback checker
document.querySelectorAll(".profile-img").forEach((img) => {
    const card = img.closest(".team-card");
    let replaced = false;

    // detect when avatar changes from default
    const observer = new MutationObserver(() => {
        if (!img.src.includes("/embed/avatars/")) {
            replaced = true;

            // remove warning if avatar loads later
            const existingWarning = card.querySelector(".avatar-warning");
            if (existingWarning) {
                existingWarning.remove();
            }
        }
    });

    observer.observe(img, {
        attributes: true,
        attributeFilter: ["src"]
    });

    // after 5 seconds, if still default -> show warning
    setTimeout(() => {
        if (!replaced && img.src.includes("/embed/avatars/")) {

            // avoid duplicate warning
            if (card.querySelector(".avatar-warning")) return;

            const warning = document.createElement("p");
            warning.className = "avatar-warning";

            warning.textContent =
                "This is not supposed to happen! Please refresh your browser or check your connection. If the problem persists, contact us.";

            card.appendChild(warning);
        }
    }, 10000);
});
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

    chaosBtn.addEventListener("click", async () => {
        // show chaos
        errorContent.classList.add("hidden");
        chaosMode.classList.remove("hidden");

        // load both
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

// ================= DISCORD AVATARS =================
async function loadFurryAvatars(furryGrid) {
    if (!furryGrid) return;

    const members = [
        { id: "258706134850863106" }, // SGII2
        { id: "690720906590552094" }, // cat
        { id: "1092162323021566103" }, // May
        { id: "652250448631431170" }, // Cold
        { id: "815652645443993650" }, // Sonia
        { id: "1092896609295138837" } // Lola
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
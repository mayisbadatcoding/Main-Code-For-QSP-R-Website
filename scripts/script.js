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
                <span>${data.username || "Unknown User"}</span>
            `;

            furryGrid.appendChild(div);

        } catch {
            console.log("avatar failed");
        }
    }
}

// ================= TEAM PAGE AVATARS =================
document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".team-card");

    cards.forEach(async card => {
        const discordId = card.dataset.discord;
        if (!discordId) return;

        const img = card.querySelector(".profile-img");
        if (!img) return;

        let loaded = false;

        img.classList.add("avatar-loading");
        img.removeAttribute("src");

        const warning = document.createElement("p");
        warning.className = "avatar-warning";
        warning.textContent =
            "You are not meant to see this! Please try refreshing the page or check your connection. If this keeps happening, contact support.";

        const showWarning = () => {
            if (loaded) return;

            img.style.display = "none";

            if (!card.querySelector(".avatar-warning")) {
                card.appendChild(warning);
            }
        };

       const timeout = setTimeout(showWarning, 10000);

        try {
            const res = await fetch(`/api/discord?user=${discordId}`);

            if (!res.ok) {
                throw new Error("Discord API request failed");
            }

            const data = await res.json();

            if (!data.avatar) {
                throw new Error("No avatar returned");
            }

            img.onload = () => {
                loaded = true;
                clearTimeout(timeout);

                img.classList.remove("avatar-loading");
                img.style.display = "";
                img.style.opacity = "1";

                const existingWarning = card.querySelector(".avatar-warning");
                if (existingWarning) existingWarning.remove();
            };

            img.onerror = () => {
                clearTimeout(timeout);
                showWarning();
            };

            img.src = data.avatar;

        } catch (err) {
            clearTimeout(timeout);
            showWarning();
            console.log("avatar load failed for", discordId, err);
        }
    });
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

// ===== GLOBAL PLAYER =====
    const player = document.getElementById("radio-player");
    const playBtn = document.getElementById("gp-play");
    const globalBar = document.getElementById("global-player");

    let isPlaying = localStorage.getItem("radioPlaying") === "true";

    if (player && playBtn && globalBar) {

        // Restore previous session
        if (isPlaying) {
            if (!player.src) {
                player.src = "https://streaming.live365.com/a59069";
            }

            player.play().catch(() => {});
            globalBar.classList.remove("hidden");
            playBtn.textContent = "⏸";
        }

        playBtn.addEventListener("click", async () => {
            try {
                player.src ??= "https://streaming.live365.com/a59069";

                if (!isPlaying) {
                    await player.play();
                    playBtn.textContent = "⏸";
                    isPlaying = true;
                    localStorage.setItem("radioPlaying", "true");
                    globalBar.classList.remove("hidden");
                } else {
                    player.pause();
                    playBtn.textContent = "▶";
                    isPlaying = false;
                    localStorage.setItem("radioPlaying", "false");
                }

            } catch (err) {
                console.log("Playback blocked:", err);
            }
        });
    }

    // ===== ALBUM ART =====
    async function getArtwork(title, artist) {
        try {
            const res = await fetch(
                `https://itunes.apple.com/search?term=${encodeURIComponent(artist + " " + title)}&limit=1`
            );
            const data = await res.json();

            if (data.results?.length > 0) {
                return data.results[0].artworkUrl100.replace("100x100", "300x300");
            }
        } catch {}

        return "media/image02.jpg";
    }

    // ===== TIME FORMAT =====
    function formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 60) return "just now";
        if (seconds < 3600) return Math.floor(seconds / 60) + " min ago";
        if (seconds < 86400) return Math.floor(seconds / 3600) + " hr ago";

        return Math.floor(seconds / 86400) + " day ago";
    }


    // ===== NOW PLAYING + RECENT =====
    async function updateNowPlaying() {
        try {
            const res = await fetch("/api/nowplaying");
            const data = await res.json();

            if (!data.current) return;

            const { title, artist } = data.current;

            const titleEl = document.getElementById("np-title");
            const artistEl = document.getElementById("np-artist");
            const artEl = document.getElementById("np-art");

            const gpTitle = document.getElementById("gp-title");
            const gpArtist = document.getElementById("gp-artist");
            const gpArt = document.getElementById("gp-art");

            const recentContainer = document.getElementById("recent-list");

            if (titleEl) titleEl.textContent = title;
            if (artistEl) artistEl.textContent = artist;

            if (gpTitle) gpTitle.textContent = title;
            if (gpArtist) gpArtist.textContent = artist;

            const art = await getArtwork(title, artist);

            if (artEl) artEl.src = art;
            if (gpArt) gpArt.src = art;

            // RECENT TRACKS
            if (recentContainer && data.history) {
                recentContainer.innerHTML = "";

                let timeMap = JSON.parse(localStorage.getItem("songTimes")) || {};

                for (let i = 1; i < data.history.length; i++) {
                    const song = data.history[i];
                    const key = song.title + "|" + song.artist;

                    if (!timeMap[key]) {
                        timeMap[key] = Date.now();
                    }

                    const artwork = await getArtwork(song.title, song.artist);

                    const item = document.createElement("div");
                    item.className = "recent-item";

                    item.innerHTML = `
                        <img src="${artwork}">
                        <div>
                            <p class="song-title">${song.title}</p>
                            <p class="song-artist">${song.artist}</p>
                            <p class="song-time">${formatTimeAgo(timeMap[key])}</p>
                        </div>
                    `;

                    recentContainer.appendChild(item);
                }

                localStorage.setItem("songTimes", JSON.stringify(timeMap));
            }

        } catch (err) {
            console.log("Now playing failed", err);
        }
    }

    
    setInterval(updateNowPlaying, 30000);
    updateNowPlaying();



async function loadDiscordAvatar(id, elementId) {
    try {
        const res = await fetch(`/api/discord?id=${id}`);
        const data = await res.json();

        document.getElementById(elementId).src = data.avatar;
    } catch (err) {
        console.log("Avatar failed");
    }
}
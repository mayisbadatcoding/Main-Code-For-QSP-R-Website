// ================= PRIVACY POPUP =================
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("privacySeen") || window.location.pathname.includes("privacy.html")) return;

    document.body.insertAdjacentHTML("beforeend", `
        <div id="privacyPopup" class="privacy-popup">
            <p>
                We use basic data to run this site. Please review our 
                <a href="privacy.html">Privacy Policy</a>.
            </p>
            <button id="acceptPrivacy">Got it</button>
        </div>
    `);

    document.getElementById("acceptPrivacy").addEventListener("click", () => {
        localStorage.setItem("privacySeen", "true");
        document.getElementById("privacyPopup").remove();
    });
});

// ================= GLOBAL PLAYER =================
const player = document.getElementById("radio-player");
const heroPlayBtn = document.getElementById("play-btn");
const playBtn = document.getElementById("gp-play");
const globalBar = document.getElementById("global-player");
const volume = document.getElementById("volume");

let isPlaying = false;

function updatePlayButtons() {
    if (heroPlayBtn) heroPlayBtn.textContent = isPlaying ? "⏸ Pause" : "▶ Listen Live";
    if (playBtn) playBtn.textContent = isPlaying ? "⏸" : "▶";
    if (globalBar) globalBar.classList.toggle("hidden", !isPlaying);
}

async function toggleRadio() {
    try {
        if (!player) return;

        if (!isPlaying) {
            await player.play();
            isPlaying = true;
        } else {
            player.pause();
            isPlaying = false;
        }

        updatePlayButtons();
    } catch (err) {
        console.log("Playback blocked:", err);
    }
}

if (heroPlayBtn) heroPlayBtn.addEventListener("click", toggleRadio);
if (playBtn) playBtn.addEventListener("click", toggleRadio);

if (volume && player) {
    player.volume = volume.value;

    volume.addEventListener("input", () => {
        player.volume = volume.value;
    });
}

// ================= ALBUM ART =================
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

// ================= TIME FORMAT =================
function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + " min ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + " hr ago";

    return Math.floor(seconds / 86400) + " day ago";
}

// ================= NOW PLAYING =================
async function updateNowPlaying() {
    try {
        const res = await fetch("/api/nowplaying");

        if (!res.ok) throw new Error("Now playing API failed");

        const data = await res.json();

        if (!data.current) return;

        const { title, artist } = data.current;

        const art = await getArtwork(title, artist);

        document.getElementById("np-title").textContent = title;
        document.getElementById("np-artist").textContent = artist;
        document.getElementById("np-art").src = art;

        document.getElementById("gp-title").textContent = title;
        document.getElementById("gp-artist").textContent = artist;
        document.getElementById("gp-art").src = art;

        const recentContainer = document.getElementById("recent-list");
        if (!recentContainer || !data.history) return;

        recentContainer.innerHTML = "";

        let timeMap = JSON.parse(localStorage.getItem("songTimes")) || {};

        for (let i = 1; i < data.history.length; i++) {
            const song = data.history[i];
            const key = song.title + "|" + song.artist;

            if (!timeMap[key]) timeMap[key] = Date.now();

            const artwork = await getArtwork(song.title, song.artist);

            const item = document.createElement("div");
            item.className = "recent-item";

            item.innerHTML = `
                <img src="${artwork}" alt="Album artwork">
                <div>
                    <p class="song-title">${song.title}</p>
                    <p class="song-artist">${song.artist}</p>
                    <p class="song-time">${formatTimeAgo(timeMap[key])}</p>
                </div>
            `;

            recentContainer.appendChild(item);
        }

        localStorage.setItem("songTimes", JSON.stringify(timeMap));
    } catch (err) {
        console.log("Now playing failed:", err);
    }
}

setInterval(updateNowPlaying, 30000);
updateNowPlaying();

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
        card.addEventListener("click", (e) => {
            if (e.target.closest("a")) return;

            const img = card.querySelector(".profile-img");
            const name = card.querySelector("h3");
            const links = card.querySelector(".team-links");

            modalImg.src = img?.src || "https://cdn.discordapp.com/embed/avatars/0.png";
            modalName.textContent = name?.textContent || "Unknown";
            modalDesc.textContent = card.dataset.modalDesc || "No extra information provided.";
            modalRole.textContent = card.dataset.modalRole || "";
            modalPronoun.textContent = card.dataset.modalPronouns || "";

            modalLinks.innerHTML = "";

            if (links) {
                modalLinks.innerHTML = links.innerHTML;
            }

            modal.classList.add("active");
            document.body.classList.add("modal-open");
        });
    });

    modalClose.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.remove("active");
        document.body.classList.remove("modal-open");
    }
});

// ================= TEAM FILTERS =================
document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll(".team-filters button");
    const filterCards = document.querySelectorAll(".team-card");

    if (!filterButtons.length || !filterCards.length) return;

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const filter = button.dataset.filter;

            filterCards.forEach(card => {
                const categories = card.dataset.category?.split(" ") || [];

                if (filter === "all" || categories.includes(filter)) {
                    card.classList.remove("hidden-card");
                } else {
                    card.classList.add("hidden-card");
                }
            });
        });
    });
});
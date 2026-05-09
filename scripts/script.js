// THEME TOGGLE
const toggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
}

if (toggle) {
    toggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
    });
}


document.addEventListener("DOMContentLoaded", () => {

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
                // 🔥 Lazy load stream ONLY when needed
                if (!player.src) {
                    player.src = "https://streaming.live365.com/a59069";
                }

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


    // ===== PRIVACY POPUP =====
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

    if (!hasSeen && !window.location.pathname.includes("privacy.html")) {
        popup.classList.remove("hidden");

        acceptBtn.addEventListener("click", () => {
            localStorage.setItem("privacySeen", "true");
            popup.classList.add("hidden");
        });

        popup.querySelector("a").addEventListener("click", () => {
            localStorage.setItem("privacySeen", "true");
        });
    }


    // ===== TEAM FILTERS =====
    const filterButtons = document.querySelectorAll(".team-filters button");
    const cards = document.querySelectorAll(".team-card");

    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelector(".team-filters .active")?.classList.remove("active");
                btn.classList.add("active");

                const filter = btn.dataset.filter;

                cards.forEach(card => {
                    const categories = card.dataset.category.split(" ");

                    card.style.display =
                        filter === "all" || categories.includes(filter)
                            ? "block"
                            : "none";
                });
            });
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

});

async function loadDiscordAvatar(id, elementId) {
    try {
        const res = await fetch(`/api/discord?id=${id}`);
        const data = await res.json();

        document.getElementById(elementId).src = data.avatar;
    } catch (err) {
        console.log("Avatar failed");
    }
}

// SGII2

loadDiscordAvatar("258706134850863106", "sgii2-avatar");
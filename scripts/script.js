// THEME TOGGLE
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


// EVERYTHING ELSE WAITS FOR PAGE LOAD
document.addEventListener("DOMContentLoaded", () => {

    // PRIVACY POPUP
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
    } else {
        popup.classList.remove("hidden");

        acceptBtn.addEventListener("click", () => {
            localStorage.setItem("privacySeen", "true");
            popup.classList.add("hidden");
        });

        popup.querySelector("a").addEventListener("click", () => {
            localStorage.setItem("privacySeen", "true");
        });
    }


    // TEAM FILTERS (SAFE CHECK)
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

                    if (filter === "all" || categories.includes(filter)) {
                        card.style.display = "block";
                    } else {
                        card.style.display = "none";
                    }
                });
            });
        });
    }


    // 🎧 RADIO PLAYER (FIXED + CLEAN)
    const player = document.getElementById("radio-player");
    const playBtn = document.getElementById("play-btn");
    const volume = document.getElementById("volume");

    if (player && playBtn) {
        let isPlaying = false;

        playBtn.addEventListener("click", async () => {
            try {
                if (!isPlaying) {
                    await player.play();
                    playBtn.textContent = "⏸ Pause";
                    isPlaying = true;
                } else {
                    player.pause();
                    playBtn.textContent = "▶ Play";
                    isPlaying = false;
                }
            } catch (err) {
                console.log("Playback blocked:", err);
            }
        });

        if (volume) {
            volume.addEventListener("input", () => {
                player.volume = volume.value;
            });
        }
    }


    // 🎵 ALBUM ART FETCH
    async function getArtwork(title, artist) {
        try {
            const res = await fetch(
                `https://itunes.apple.com/search?term=${encodeURIComponent(artist + " " + title)}&limit=1`
            );
            const data = await res.json();

            if (data.results && data.results.length > 0) {
                return data.results[0].artworkUrl100.replace("100x100", "300x300");
            }
        } catch {}

        return "media/image02.jpg";
    }


    // 🎶 NOW PLAYING UPDATE
    async function updateNowPlaying() {
        try {
            const res = await fetch("/api/nowplaying");
            const data = await res.json();

            const titleEl = document.getElementById("np-title");
            const artistEl = document.getElementById("np-artist");
            const artEl = document.getElementById("np-art");

            if (!titleEl || !artistEl || !artEl) return;

            titleEl.textContent = data.title;
            artistEl.textContent = data.artist;

            const art = await getArtwork(data.title, data.artist);
            artEl.src = art;

        } catch {
            console.log("Now playing failed");
        }
    }

    setInterval(updateNowPlaying, 10000);
    updateNowPlaying();

});
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
document.addEventListener("DOMContentLoaded", () => {
    // Inject popup into page
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

    // clicking the link also counts
    popup.querySelector("a").addEventListener("click", () => {
        localStorage.setItem("privacySeen", "true");
    });
});

const filterButtons = document.querySelectorAll(".team-filters button");
const cards = document.querySelectorAll(".team-card");

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".team-filters .active").classList.remove("active");
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

const player = document.getElementById("radioPlayer");
const playBtn = document.getElementById("playBtn");
const volume = document.getElementById("volume");

playBtn.onclick = () => {
    if (player.paused) {
        player.play();
        playBtn.textContent = "⏸";
    } else {
        player.pause();
        playBtn.textContent = "▶";
    }
};

volume.oninput = () => {
    player.volume = volume.value;
};
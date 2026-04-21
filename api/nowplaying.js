export default async function handler(req, res) {
    try {
        const response = await fetch("https://streaming.live365.com/a59069/stats?json=1");
        const data = await response.json();

        // THIS is where your issue was — wrong fields
        const titleRaw = data?.current_track || "Live Radio";

        // Split "Artist - Title"
        let artist = "AutoDJ";
        let title = "Live Radio";

        if (titleRaw.includes(" - ")) {
            const parts = titleRaw.split(" - ");
            artist = parts[0];
            title = parts[1];
        } else {
            title = titleRaw;
        }

        res.status(200).json({
            title,
            artist
        });

    } catch (error) {
        res.status(500).json({ error: "Metadata failed" });
    }
}
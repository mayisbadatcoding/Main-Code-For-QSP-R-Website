export default async function handler(req, res) {
    try {
        const response = await fetch("https://live365.com/api/station/a59069");
        const data = await response.json();

        const now = data?.current_track;

        res.status(200).json({
            title: now?.title || "Live Radio",
            artist: now?.artist || "AutoDJ",
            artwork: now?.artwork_url || null
        });

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch metadata" });
    }
}
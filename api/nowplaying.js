export default async function handler(req, res) {
    try {
        const response = await fetch("https://live365.com/station/a59069");
        const html = await response.text();

        // Extract Next.js data blob
        const jsonMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);

        if (!jsonMatch) {
            return res.status(200).json({ title: "Live Radio" });
        }

        const data = JSON.parse(jsonMatch[1]);

        // Navigate structure (this may vary slightly)
        const now = data?.props?.pageProps?.station?.nowPlaying;

        res.status(200).json({
            title: now?.title || "Live Radio",
            artist: now?.artist || "AutoDJ",
            artwork: now?.artworkUrl || null
        });

    } catch (err) {
        res.status(500).json({ error: "Failed to parse metadata" });
    }
}
export default async function handler(req, res) {
    try {
        const response = await fetch("https://live365.com/station/a59069");
        const html = await response.text();

        const match = html.match(/"nowPlaying":({.*?})/);

        if (!match) {
            return res.status(200).json({ title: "Live Radio" });
        }

        const nowPlaying = JSON.parse(match[1]);

        res.status(200).json({
            title: nowPlaying.title,
            artist: nowPlaying.artist,
            artwork: nowPlaying.artworkUrl
        });

    } catch (err) {
        res.status(500).json({ error: "Failed to scrape metadat" });
    }
}
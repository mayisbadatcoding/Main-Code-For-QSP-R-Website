export default async function handler(req, res) {
    try {
        const response = await fetch("https://streaming.live365.com/a59069", {
            headers: {
                "Icy-MetaData": "1"
            }
        });

        const reader = response.body.getReader();
        const { value } = await reader.read();

        const text = new TextDecoder().decode(value);

        const match = text.match(/StreamTitle='([^']*)'/);

        let artist = "AutoDJ";
        let title = "Live Radio";

        if (match && match[1].includes(" - ")) {
            const parts = match[1].split(" - ");
            artist = parts[0];
            title = parts[1];
        }

        res.status(200).json({ title, artist });

    } catch (err) {
        res.status(500).json({ error: "ICY metadata failed" });
    }
}
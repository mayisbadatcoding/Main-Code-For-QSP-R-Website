let history = [];

export default async function handler(req, res) {
    try {
        const response = await fetch("https://streaming.live365.com/a59069", {
            headers: { "Icy-MetaData": "1" }
        });

        const reader = response.body.getReader();
        const { value } = await reader.read();

        const text = new TextDecoder().decode(value);

        const match = text.match(/StreamTitle='(.*?)';/);

        let title = "Unknown";
        let artist = "Unknown";

        if (match && match[1]) {
            const parts = match[1].split(" - ");
            artist = parts[0] || "Unknown";
            title = parts[1] || parts[0] || "Unknown";
        }

        // ADD TO HISTORY (avoid duplicates spam)
        if (!history.length || history[0].title !== title) {
            history.unshift({ title, artist });

            if (history.length > 10) {
                history.pop();
            }
        }

        res.status(200).json({
            current: { title, artist },
            history
        });

    } catch (e) {
        res.status(500).json({ error: "Metadata failed" });
    }
}

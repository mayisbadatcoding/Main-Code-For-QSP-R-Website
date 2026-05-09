export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "Missing user ID" });
    }

    try {
        const response = await fetch(`https://discord.com/api/v10/users/${id}`, {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_TOKEN}`
            }
        });

        if (!response.ok) {
            return res.status(500).json({ error: "Failed to fetch user" });
        }

        const data = await response.json();

const isAnimated = data.avatar && data.avatar.startsWith("a_");

const avatarUrl = data.avatar
    ? `https://cdn.discordapp.com/avatars/${id}/${data.avatar}.${isAnimated ? "gif" : "png"}?size=256`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(data.discriminator || 0) % 5}.png`;

        res.status(200).json({
            username: data.username,
            avatar: avatarUrl
        });

    } catch (err) {
        res.status(500).json({ error: "Discord fetch failed" });
    }
}
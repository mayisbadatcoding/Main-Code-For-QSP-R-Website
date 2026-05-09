export default async function handler(req, res) {
    const userId = req.query.user;

    if (!userId) {
        return res.status(400).json({
            error: "Missing user ID"
        });
    }

    try {
        // Fetch user from Discord API
        const response = await fetch(
            `https://discord.com/api/v10/users/${userId}`,
            {
                headers: {
                    Authorization: `Bot ${process.env.DISCORD_TOKEN}`
                }
            }
        );

        if (!response.ok) {
            return res.status(500).json({
                error: "Failed to fetch user"
            });
        }

        const user = await response.json();

        // Default avatar if user has no custom avatar
        res.setHeader(
  "Cache-Control",
  "s-maxage=3600, stale-while-revalidate=86400"
);
        if (!user.avatar) {
            return res.status(200).json({
avatar: "https://cdn.discordapp.com/embed/avatars/0.png"
            });
        }

        const isGif = user.avatar.startsWith("a_");

        const avatarUrl =
            `https://cdn.discordapp.com/avatars/${user.id}/` +
            `${user.avatar}.${isGif ? "gif" : "png"}?size=256`;

        res.status(200).json({
            avatar: avatarUrl,
            username: user.username
        });

    } catch (err) {
        res.status(500).json({
            error: "Server error"
        });
    }
}
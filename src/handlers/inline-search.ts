import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";
import { searchTracks } from "../lib/music-api.js";

const composer = new Composer<Ctx>();

composer.callbackQuery("inline_search", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    "To search for music, tap 🔍 Search on the main menu or type /search.",
    { reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]) },
  );
});

composer.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query;
  if (!query || query.length < 2) {
    await ctx.answerInlineQuery([], { cache_time: 0 });
    return;
  }

  const results = await searchTracks(query, 5);
  const articles = results.map((r) => ({
    type: "article" as const,
    id: r.trackId,
    title: r.trackTitle,
    description: `${r.artist} — ${r.album}`,
    ...(r.coverArtUrl
      ? { thumbnail_url: r.coverArtUrl }
      : {}),
    input_message_content: {
      message_text:
        `🎵 ${r.trackTitle}\n` +
        `👤 ${r.artist}\n` +
        `💿 ${r.album}\n\n` +
        `🎧 Preview: ${r.previewUrl}`,
    },
    reply_markup: inlineKeyboard([
      [inlineButton("🔗 Preview", `preview:${r.trackId}`)],
    ]),
  }));

  await ctx.answerInlineQuery(articles, { cache_time: 300 });
});

export default composer;

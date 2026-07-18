import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.callbackQuery(/^preview:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const trackId = ctx.match[1];
  const results = ctx.session.searchResults ?? [];
  const track = results.find((r) => r.trackId === trackId);

  if (!track) {
    await ctx.reply(
      "That preview link has expired — run a new search to find it again.",
      { reply_markup: inlineKeyboard([[inlineButton("🔍 Search again", "search:show")]]) },
    );
    return;
  }

  const text =
    `🎵 ${track.trackTitle}\n` +
    `👤 ${track.artist}\n` +
    `💿 ${track.album}\n\n` +
    `Tap below to listen to the preview:`;

  await ctx.reply(text, {
    reply_markup: inlineKeyboard([
      [inlineButton("🎧 Listen to preview", track.previewUrl)],
      [inlineButton("↗️ Share this track", `share:${trackId}`)],
      [inlineButton("⬅️ Back to menu", "menu:main")],
    ]),
  });
});

export default composer;

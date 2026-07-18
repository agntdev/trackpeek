import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { confirmKeyboard, inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.callbackQuery(/^share:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const trackId = ctx.match[1];
  const results = ctx.session.searchResults ?? [];
  const track = results.find((r) => r.trackId === trackId);

  if (!track) {
    await ctx.reply(
      "That track isn't available anymore — run a new search to find it again.",
      { reply_markup: inlineKeyboard([[inlineButton("🔍 Search again", "search:show")]]) },
    );
    return;
  }

  const text =
    `Share this track?\n\n` +
    `🎵 ${track.trackTitle} — ${track.artist}`;

  ctx.session.pendingShare = {
    trackId: track.trackId,
    trackTitle: track.trackTitle,
    artist: track.artist,
    previewUrl: track.previewUrl,
  };

  await ctx.reply(text, {
    reply_markup: confirmKeyboard("share_confirm"),
  });
});

composer.callbackQuery("share_confirm:yes", async (ctx) => {
  await ctx.answerCallbackQuery();
  const pending = ctx.session.pendingShare;
  if (!pending) {
    await ctx.reply("Nothing to share — start a new search.");
    return;
  }

  ctx.session.pendingShare = undefined;
  await ctx.reply(
    `🎵 ${pending.trackTitle} — ${pending.artist}\n\n` +
    `🎧 Preview: ${pending.previewUrl}`,
  );
});

composer.callbackQuery("share_confirm:no", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.pendingShare = undefined;
  await ctx.reply(
    "No worries — back to the menu.",
    { reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]) },
  );
});

export default composer;

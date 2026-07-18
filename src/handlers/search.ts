import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard, registerMainMenuItem } from "../toolkit/index.js";
import { searchTracks } from "../lib/music-api.js";

registerMainMenuItem({ label: "🔍 Search", data: "search:show", order: 10 });

const composer = new Composer<Ctx>();

function formatResult(
  r: { trackTitle: string; artist: string; album: string; trackId: string },
  index: number,
): string {
  return `${index + 1}. ${r.trackTitle} — ${r.artist}\n   Album: ${r.album}`;
}

function resultsKeyboard(
  results: { trackId: string; trackTitle: string; artist: string; previewUrl: string }[],
) {
  const rows = results.map((r, i) => [
    inlineButton(`${i + 1}. ${r.trackTitle}`, `preview:${r.trackId}`),
    inlineButton("🔗 Preview", `preview:${r.trackId}`),
    inlineButton("↗️ Share", `share:${r.trackId}`),
  ]);
  rows.push([inlineButton("⬅️ Back to menu", "menu:main")]);
  return inlineKeyboard(rows);
}

async function promptSearch(ctx: Ctx) {
  await ctx.reply(
    "What song or artist are you looking for?\n\nType your search below.",
    {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: "Type a song or artist…",
      },
    },
  );
  ctx.session.step = "awaiting_search";
}

composer.command("search", async (ctx) => {
  await promptSearch(ctx);
});

composer.callbackQuery("search:show", async (ctx) => {
  await ctx.answerCallbackQuery();
  await promptSearch(ctx);
});

composer.on("message:text", async (ctx, next) => {
  if (ctx.session.step !== "awaiting_search") return next();

  const query = ctx.message.text.trim();
  if (query.length < 2) {
    await ctx.reply("That's too short — try at least 2 characters.");
    return;
  }

  ctx.session.step = "idle";
  const results = await searchTracks(query, 5);

  if (results.length === 0) {
    await ctx.reply(
      `No results for "${query}" — try a different search or check the spelling.`,
      { reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]) },
    );
    return;
  }

  ctx.session.searchResults = results;

  const lines = results.map((r, i) => formatResult(r, i));
  const text = `Here's what I found:\n\n${lines.join("\n\n")}`;
  await ctx.reply(text, { reply_markup: resultsKeyboard(results) });
});

export default composer;

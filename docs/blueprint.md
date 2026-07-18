# Music Preview Bot — Bot specification

**Archetype:** community

**Voice:** friendly and efficient — write every user-facing message, button label, error, and empty state in this voice.

A Telegram bot enabling private music track discovery with external previews. Users search songs via direct messages or inline queries, receive curated metadata, and get private links to external preview pages without public exposure.

> This is the complete contract for the bot. Implement EVERY entry point, flow, feature, integration, and edge case below. The completeness review checks the bot against this document after each build pass.

## Primary audience

- Telegram community members
- music discovery enthusiasts
- private listeners

## Success criteria

- Users receive private preview links without public spam
- Search results surface within 1.5s for 95% queries
- Inline search suggestions appear in active channels

## Entry points

Every feature must be reachable from the bot's command/button surface (button-first; only /start and /help are slash commands).

- **/start** (command, actor: user, command: /start) — Open main menu with search options
- **@BotName [query]** (callback, actor: user, callback: inline_search) — Trigger inline search suggestions in channels
  - inputs: search text
  - outputs: inline results with private preview action
- **View Preview** (button, actor: user, callback: preview:open) — Open external preview page privately
  - inputs: selected track ID
  - outputs: private link message
- **Share to Chat** (button, actor: user, callback: share:confirm) — Request confirmation before public sharing

## Flows

### Inline search flow
_Trigger:_ inline_query

1. Receive inline query in channel
2. Display 5 suggested tracks with thumbnails
3. Send private preview link on selection

_Data touched:_ search query, user session

### Direct search flow
_Trigger:_ /search

1. Receive private chat query
2. Fetch 5 relevant tracks
3. Display grid with preview buttons

_Data touched:_ search history, user preferences

### Sharing flow
_Trigger:_ share:confirm

1. Request sharing confirmation
2. Paste link in current chat on approval

_Data touched:_ user consent logs

## Data entities

Durable data (must survive a restart) uses the toolkit's persistent store, never in-memory maps.

- **User** _(retention: persistent)_ — Telegram account with privacy preferences
  - fields: telegram_id, consent_timestamp, rate_limit_counter
- **Search Query** _(retention: session)_ — User-submitted music search term
  - fields: text, timestamp, context
- **Search Result** _(retention: session)_ — External music metadata match
  - fields: track_title, artist, album, cover_art_url, preview_url
- **Preview Page** _(retention: none)_ — External link to playable preview
  - fields: host_url, metadata_checksum, access_count

## Integrations

- **Telegram** (required) — Bot API messaging
- **Music Metadata API** (required) — Track search and preview URLs
- **Preview Hosting** (required) — External playable preview pages
Call external APIs against their real contract (correct endpoints, ids, params); credentials from env. Do not fake responses.

## Owner controls

- Rate-limiting thresholds
- Data retention duration (max 90 days)
- Inline search result count (default 5)

## Permissions & privacy

- Private chat only for preview links
- User consent required for data retention
- No public sharing by default

## Edge cases

- No results found for obscure queries
- User selects expired preview link
- Abuse prevention during high query volume

## Required tests

- Inline search doesn't post links publicly
- Private preview links expire after 24h
- Rate-limiting blocks 100+ queries/hour

## Assumptions

- External previews handle 10k+ daily active users
- Metadata API returns English results first
- Users prefer 30s audio previews over longer samples

Around Me screen — full replacement of the Scene screen
Rename the third tab in the bottom navigation bar. Change the icon from ti-flame to ti-map-pin. Change the label from "Scene" to "Around Me."

Screen structure
Background #0a0a0a throughout. Same top bar pattern as the other screens: "Around you" in 9px muted uppercase #555 as the supertitle, "Players & places" in 16px white semibold as the main title. DUPR pill (3.41, amber #f5a623, dark background #1a1a1a, 0.5px border #333, border-radius 16px) and avatar circle (24px, amber fill, dark initials "AR") top right, same as other screens.

Sub-tab switcher
Directly below the top bar, full width minus 24px total horizontal margin. Background #141414, border-radius 10px, padding 3px inside. Two equal tabs side by side, each with border-radius 8px, padding 6px 4px, font-size 11px. Active tab: background #1e1e1e, text color amber #f5a623, font-weight 500. Inactive tab: no background, text color #555.
Tab 1 label: ti-flame icon (10px) followed by "Hot Spots"
Tab 2 label: ti-users icon (10px) followed by "My Circle"

Hot Spots sub-tab
Section label row below the sub-tab switcher: "Clubs near you · all time activity" in 9px uppercase #444 with 0.08em letter spacing. Left padding 12px.
Club rows: each row 44px tall, bottom border 0.5px solid #111, horizontal padding 12px. Four columns left to right:
Column 1: rank number, 12px, color #333, fixed width 14px, no padding.
Column 2: club logo tile, 38px square, border-radius 10px, background #1a1a1a, border 0.5px solid #2a2a2a, centered initials in 9px semibold #888. Margin 0 10px. The top-ranked club (Big Balls) gets amber border #2a1800 and amber initials #f5a623 to distinguish it.
Column 3: flex-fill. Club name in 12px font-weight 500 #ddd. Below it on a second line: DUPR range in 10px amber #f5a623, no label, just the numbers (e.g. "3.2 – 3.8").
Column 4: right-aligned. Distance in 12px font-weight 500 #aaa on the first line. Contacts count on the second line in 11px font-weight 500 amber #f5a623 with the word "contacts" or "contact" after it in 8px #444. If 0 contacts, show "0 contacts" in #333 (dimmed, not amber).
Show 5 club rows. Last row no bottom border. Below the last row, centered text "4 more clubs nearby ↓" in 10px color #2a2a2a.
Club data to use:
Row 1: BB · Big Balls Club · 3.2–3.8 · 1.2 km · 8 contacts
Row 2: N11 · Next11 Club · 3.4–4.0 · 1.8 km · 5 contacts
Row 3: SS · Smash Social · 3.0–3.5 · 2.4 km · 3 contacts
Row 4: VC · Vạn Phúc City · 3.5–4.2 · 2.9 km · 1 contact
Row 5: D7 · D7 Courts · 3.8–4.5 · 4.1 km · 0 contacts

My Circle sub-tab
Section label: "What your circle is up to" in 9px uppercase #444. Left padding 12px.
Feed items: each item has a bottom border 0.5px solid #0f0f0f, padding 12px. Three columns:
Column 1 — avatar stack: avatar circle 36px diameter, colored background, white-tinted initials, 1.5px border #0a0a0a. Directly below the avatar, centered, the player's DUPR number in 10px font-weight 500 amber #f5a623. No label text, just the number. This column is fixed width, flex-shrink 0.
Column 2 — feed body: flex-fill. Player name in 12px font-weight 500 #ddd. For players already followed, add "· following" immediately after the name in 9px #333 font-weight 400, no space from the name. Below the name, the action text in 11px #555 with the club name or session name highlighted in 11px #aaa. Below that, if applicable, a mini session card (background #141414, border 0.5px solid #1e1e1e, border-radius 8px, padding 6px 8px). Inside the mini card: left side shows session name in 10px white semibold, then district, time, spots left in 10px #777, all on one line. Right side: "Join too" button, amber fill #f5a623, border-radius 6px, padding 3px 8px, 9px dark semibold. At the bottom of the feed body, timestamp or last seen text in 10px #666.
Column 3 — follow button: fixed position top right of each feed item, margin-top 2px. Button is 10px font-weight 500, border-radius 12px, padding 4px 12px. Two states: Follow state — amber fill #f5a623, dark text #1a0a00. Following state — background #1a1a1a, border 0.5px solid #f5a623, text amber #f5a623. Always show the button on every card. Follow state for players not yet followed, Following state for players already in circle. Never remove the button between states, same position always.
Feed data to use:
Item 1: avatar GG, background #1f1040, text #afa9ec, DUPR 3.22, name "Guigui", following state, action "joining Next11 Club tomorrow at 9:00 AM", mini card showing "Next11 · D2 · 9:00 AM · 3 left" with Join too button, timestamp "12 min ago"
Item 2: avatar JN, background #0a2a1a, text #5dcaa5, DUPR 3.47, name "John N.", follow state (not yet following), action "played at Big Balls Club · 14 times this month", no mini card, last seen "Last seen 2 days ago"
Item 3: avatar SK, background #3a1020, text #ed93b1, DUPR 3.47, name "Sarah K.", following state, action "DUPR updated 3.41 → 3.47 after last night", the numbers 3.41 and 3.47 in #aaa, no mini card, timestamp "Yesterday · Big Balls Club"
Item 4: avatar TM, background #2a1a5a, text #afa9ec, DUPR 3.55, name "Taylor M.", following state, action "saved Saigon Smash Social for tonight", mini card showing "Smash Social · D1 · 7:30 PM · 6 left" with Join too button, timestamp "35 min ago". No bottom border on this last item.

Bottom navigation bar — update only the third tab
Keep the existing nav bar structure and first two tabs unchanged. Third tab: replace flame icon with ti-map-pin icon (Tabler outline, 17px). Replace label "Scene" with "Around Me" in 9px. Active state remains amber #f5a623 for both icon and label, inactive state #444. No other changes to the nav bar.
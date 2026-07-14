# Continuity Ledger

## Goal (incl. success criteria):
- Rebrand the entire portfolio site (lynnandtonic.com) to personal portfolio for Van Huy.
- Deploy to Cloudflare Pages with custom domain vanhuy.r2b.io.vn.
- Maintain premium custom design while supporting Vietnamese content without broken fonts.

## Constraints/Assumptions:
- Build pipeline: Grunt + Pug + Stylus + Browserify.
- svpug parser requires curly apostrophe (’) instead of straight apostrophe (') in Pug attribute strings.
- Font family `$font-new-title` lacks Vietnamese character support, causing broken text in headings (h1, h2, h3).

## Key decisions:
- Cleaned up old blog archive entries, legacy image assets, and unused components.
- Pointed all domain references to vanhuy.r2b.io.vn.
- Set up Cloudflare Pages deployment via Wrangler CLI.
- Scoped `$font-base` override exclusively to thoughts detail page (.thought-detail) to fix Vietnamese characters, while restoring the custom brand font ($font-new-title) globally for all main pages.
- Published three self-reflection articles in Vietnamese about self-awareness and Van Huy's background story.
- Replaced the About page content with the user's detailed personal story, maintaining Netbooking, Metrip, and email mailto links as active clickable elements.
- Renamed the third article's title to "Đôi lời tự sự về chính bản thân." across listing and detail pages.
- Updated tagline to "STARTUP BUILDER & DIGITAL MARKETING" globally across page descriptions and RSS configurations.
- Overwrote headline-home.svg to display "STARTUP BUILDER  &  DIGITAL MARKETING" with explicit xml:space="preserve" double spacing to clear the center walking character perfectly, rendering in the exact original brand sizing, font, and stretched aspect ratio.
- Replaced the Work page content with the user's updated professional experience, featured startup case studies (NetBooking, Sithethao, ConversionMarcom, NhaTrangFood, EasyPrint), agency credentials, and active interests, ensuring all URLs are clickable and styling grid parameters are maintained.
- Scoped h2 font override inside work.styl so Vietnamese section headings render in system-ui while keeping English headings in the custom brand font.
- Removed the stats grids section and the SME partners text entirely from the Work page based on user request.
- Fixed the feed.xml XML parse error by replacing raw ampersands (&) with XML entities (&amp;).

## State:
- Done:
  - Rebranded layout, home, about, work, footer, and favicon.
  - Cleared RSS feed and set up custom OG image.
  - Configured and successfully deployed to Cloudflare Pages.
  - Scoped Vietnamese font overrides strictly to the thoughts detail page.
  - Restored brand font for "About", "Work", "Thoughts" landing, and home page headers.
  - Formatted, linked, and successfully published three articles in the thoughts section.
  - Replaced biography content on the About page with active clickable outbound links.
  - Updated the third article title to "Đôi lời tự sự về chính bản thân."
  - Updated the tagline globally to "STARTUP BUILDER & DIGITAL MARKETING."
  - Modified home page SVG to render double spacing around the ampersand, clearing the character model.
  - Overwrote and deployed the fully updated Work page content.
  - Overrode h2 styling inside work.styl to correct the Vietnamese headings' fallback rendering.
  - Removed the stats grids section and the partner list from the Work page.
  - Verified and deployed the clean Work page layout to production.
  - Encoded ampersands in feed.xml as &amp; to fix XML validation failure.
  - Verified and successfully deployed the feed.xml XML entity fix to production.
  - Added the 16th birthday post ("Sinh nhật năm 16 tuổi của Huy.") dated 19/04/2021 verbatim to the thoughts list and entries.
  - Linked post navigation and successfully verified the local build.
  - Added the 20th birthday post ("Sinh nhật năm 20 tuổi của Huy.") dated 19/04/2025 verbatim to the thoughts list and entries.
  - Linked post navigation chronologically between 16-years-old, 20-years-old, and standard 2026 posts.
  - Added the 18th birthday post ("Sinh nhật năm 18 tuổi của Huy.") dated 19/04/2023 verbatim to the thoughts list and entries.
  - Re-anchored the chronological nav links across 2021, 2023, 2025, and 2026 posts.
  - Added the 17th birthday post ("Sinh nhật năm 17 tuổi của Huy.") dated 19/04/2022 verbatim to the thoughts list and entries.
  - Re-anchored the chronological nav links across 2021, 2022, 2023, 2025, and 2026 posts.
  - Added the 21st birthday post ("Sinh nhật năm 21 tuổi của Huy.") dated 19/04/2026 verbatim with a birthday cake image to the thoughts list and entries.
  - Re-anchored the chronological nav links across 2021, 2022, 2023, 2025, 2026, and later thoughts.
  - Successfully verified local builds for all posts.
  - Deployed the complete rebranded site with all five birthday posts, images, and alignment fixes to Cloudflare Pages.
- Now:
  - Deployment successfully completed. Waiting for final user feedback and review of the live portfolio.
- Next:
  - None.

## Open questions:
- None

## Working set:
- _styl/pages/work.styl


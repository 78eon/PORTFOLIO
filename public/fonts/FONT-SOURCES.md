# Portfolio typography

Self-hosted variable WOFF2 fonts, sourced from the Google Fonts repository on
2026-10-23. All three are licensed under the accompanying SIL Open Font License.
No runtime requests to Google Fonts are needed. Only Montserrat is preloaded;
technical and code fonts load when used. Each face uses font-display: swap.

| Asset | Source | Weight range | Bytes |
| --- | --- | --- | --- |
| montserrat-latin.woff2 | https://github.com/google/fonts/tree/main/ofl/montserrat | 400–800 | 38,560 |
| spacegrotesk-latin.woff2 | https://github.com/google/fonts/tree/main/ofl/spacegrotesk | 500–600 | 18,764 |
| jetbrainsmono-latin.woff2 | https://github.com/google/fonts/tree/main/ofl/jetbrainsmono | 400–600 | 30,616 |

Generated with fontTools from each family's `[wght].ttf`: constrain the variable
weight axis, save/reload the intermediate font, subset, and encode as WOFF2.
Includes Latin and Western European accents, punctuation, common currency and
operator symbols, and basic arrows. JetBrains Mono also includes supported
box-drawing/block characters for aligned terminal examples. Other scripts use
platform fallbacks. Normal styles only; browser synthesis handles italic text.
Original Manrope assets remain for compatibility but are no longer loaded.

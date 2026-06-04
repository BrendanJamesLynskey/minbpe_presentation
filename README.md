# Let's Build the GPT Tokenizer

**An interactive, slide-by-slide walkthrough of Andrej Karpathy's [minbpe](https://github.com/karpathy/minbpe) — minimal, clean Byte-Pair Encoding for the GPT-2 / GPT-4 tokeniser.**

From "LLMs see tokens, not text" to a regex-split, byte-level BPE tokeniser that reproduces GPT-4's `cl100k_base` exactly — the real code, explained.

---

## [Launch Presentation](https://brendanjameslynskey.github.io/minbpe_presentation/)

---

## What's Covered

| Part | Topic |
|------|-------|
| 1 | **Why Tokenisation** — LLMs operate on tokens; the source of spelling, arithmetic, whitespace and multilingual quirks; the SolidGoldMagikarp story |
| 2 | **Unicode & UTF-8 Bytes** — code points vs bytes; why we encode to raw UTF-8 bytes (0–255) as the base vocabulary |
| 3 | **The BPE Algorithm** — `get_stats`, the most-frequent pair, `merge` into new ids; the learned `merges` and `vocab`; a worked example |
| 4 | **BasicTokenizer** — `train` / `encode` / `decode` over raw bytes; lowest-index merge first; `errors='replace'` on decode |
| 5 | **RegexTokenizer & GPT-2/4** — the GPT-2/GPT-4 split patterns; per-chunk BPE; reproducing GPT-4 via tiktoken; the byte-shuffle permutation |
| 6 | **Special Tokens & Comparison** — `<\|endoftext\|>`, FIM and `allowed_special`; sentencepiece (Llama) vs tiktoken (GPT) |

The presentation closes with a summary grid, a note on where minbpe fits in Zero-to-Hero, and key takeaways. It includes a **live in-browser BPE demo** (real `get_stats` + `merge` in JavaScript) and a **UTF-8 byte viewer**.

## Format

Built with [Reveal.js](https://revealjs.com/). Use `→` to advance, `↓` for sub-sections, and `Esc` for the slide overview.

## Part of

This presentation is part of [Karpathy: Neural Networks Zero to Hero](https://github.com/BrendanJamesLynskey/LLM_Hub_Karpathy_Zero_to_Hero), itself part of the [LLMs](https://github.com/BrendanJamesLynskey/LLMs) hub — a set of interactive resources covering transformer internals, agent architectures, CUDA programming, and more.

Credits: Andrej Karpathy's [minbpe](https://github.com/karpathy/minbpe) and the video [Let's build the GPT Tokenizer](https://www.youtube.com/watch?v=zduSFxRajkE).

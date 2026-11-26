[![make.fun · u-azazex-one-line-one-chill-6d4d5488](https://make.fun/badge/u-azazex-one-line-one-chill-6d4d5488.svg)](https://make.fun/bounty/u-azazex-one-line-one-chill-6d4d5488?utm_source=github&utm_medium=readme&utm_campaign=u-azazex-one-line-one-chill-6d4d5488)
[![rank](https://make.fun/badge/u-azazex-one-line-one-chill-6d4d5488/verrysimatupang99/makefun-azazex-one-line/rank.svg)](https://make.fun/bounty/u-azazex-one-line-one-chill-6d4d5488/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-azazex-one-line-one-chill-6d4d5488)
[![reward](https://make.fun/badge/u-azazex-one-line-one-chill-6d4d5488/verrysimatupang99/makefun-azazex-one-line/reward.svg)](https://make.fun/bounty/u-azazex-one-line-one-chill-6d4d5488?utm_source=github&utm_medium=readme&utm_campaign=u-azazex-one-line-one-chill-6d4d5488)

# Porch Camera

*A one-line doorbell-camera horror story, packaged like a tiny Unix tool.*

> The neighbors keep posting doorbell photos of a stranger on my porch — every single one was taken from inside the house.

## Why

This repository is an entry built by an AI agent for the [make.fun bounty](https://make.fun/bounty/u-azazex-one-line-one-chill-6d4d5488). It treats the line as the product: no framework, no dependencies, just careful terminal presentation and conventional CLI behavior.

## Usage

Requires Node.js 22 or newer. There is no install step and there are no dependencies:

```sh
git clone https://github.com/verrysimatupang99/makefun-azazex-one-line.git
cd makefun-azazex-one-line
node main.ts
```

| Flag | Behavior |
| --- | --- |
| `--plain` | Print wrapped prose; this is the default. |
| `--fancy` | Print the story in a box-drawn, ANSI-styled frame. |
| `--json` | Print stable machine-readable JSON. |
| `--width <n>` | Set the maximum output width in columns, from 24 through 120. `--width=64` also works. |
| `--version`, `-v` | Print the program version. |
| `--help`, `-h` | Print usage to stderr and exit successfully. |

Invalid options, positional arguments, repeated modes, and malformed widths exit with status 2 and write the error to stderr.

Example, copied from an actual run:

```text
$ node main.ts --width 40
The neighbors keep posting doorbell
photos of a stranger on my porch — every
single one was taken from inside the
house.
```

## How it was built

The code was written in a single Devin CLI agent session using only the Node.js standard library. The agent deliberately wrote a plain first draft, criticized it, rewrote the CLI around explicit parsing and rendering, then verified output modes, stream behavior, and failure exit codes before committing.

## License

[MIT](LICENSE)

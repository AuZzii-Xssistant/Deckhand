<p align="center"><img src="assets/logo/deckhand-logo.svg" width="128" alt="Deckhand logo"></p>

# Deckhand

**Put your files to work.**

Deckhand is a rule-based file organiser for Windows. Say which files, say what to do, preview exactly what would happen, run it, undo it. One portable exe: no installer, no admin rights, no account and no telemetry. Everything stays on your PC.

> **Beta.** Deckhand is under active development. Try new rules on copies of your folders first, always preview before you run, and please report anything odd as an issue.

## Why "Deckhand"?

On a ship, the deckhand is the crew member who does the actual handling: moving cargo, stowing gear and keeping the deck in order so the vessel runs. Your PC is the ship, your files are the cargo, and Deckhand is the crew member that sorts, moves, names and tidies it, the same way every time, while you steer.

## Download

Get **Deckhand.exe** from the [latest release](../../releases/latest) and run it. There is nothing to install.

- Windows 10 or 11 (64-bit) with the Microsoft WebView2 runtime, which is already present on Windows 11 and on any PC with Edge or Microsoft 365.
- The exe is not code-signed yet, so Windows SmartScreen may show a warning the first time: choose *More info*, then *Run anyway*.
- Rules, history and settings live in a `data` folder next to the exe (or in `%APPDATA%\Deckhand` if that folder is read-only). `--data <folder>` overrides it.

## Screenshots

Sample data, nautical skin on, dark theme (the numbers are made up).

| | |
|---|---|
| ![Home](docs/screenshots/home.png) **Home**: rules, recent runs, lifetime counts | ![Rules](docs/screenshots/rules.png) **Rules**: a sortable table with run numbers, switches and a ... menu |
| ![Presets](docs/screenshots/presets.png) **Presets**: run a saved tidy-up on any folder | ![Schedules](docs/screenshots/schedules.png) **Schedules**: the next seven days and every scheduled run, with Run now |
| ![History](docs/screenshots/history.png) **History**: every run, with undo | |

## Features

#### Safety

- **Preview, run, undo**: Every rule can be previewed first. The preview and the real run use the same code, a run re-checks every file, and moves, renames, copies and extractions can be undone from History.
- **Nothing is lost by accident**: A step that is skipped or fails stops any later delete for that file, duplicates always keep one copy, overwritten files go to the Recycle Bin, and read-only, system, hidden and in-progress files are left alone by default.
- **Optical character recognition is opt-in**: Reading text from pictures and scans is off by default, every result that used it is marked, and a file is never deleted, recycled or overwritten because of recognised text unless you approve that file.

#### Rules

- **Folders and conditions**: Watch one or more folders (optionally with subfolders) and test files with nested all / any / none groups on text, numbers, dates, file types, duplicates, hashes and file contents.
- **Variables**: File name, path and dates, PDF properties, audio tags, image metadata, text from PDF, Word, Excel, PowerPoint, OpenDocument and plain files, plus your own word lists, dictionaries, patterns, regular expressions and dates found in text.
- **Templates with transforms**: Names and folders accept {variables} with fallbacks, upper / lower / title case, replace, slug, padding, substring and date arithmetic.
- **Files without a value**: A rename, move, copy, sort or zip can skip a file that lacks a value, use a fallback or fail; skipped files are reported, not treated as errors.

#### Actions

- **File actions**: Move, copy, rename, change extension, sort into subfolders (by type, extension or date), zip, extract, Recycle Bin, delete, write to a log and show a notification.
- **Archives**: Extract zip, tar, 7z and rar, including multi-part sets, waiting until every part has arrived.
- **Run a command or a saved script**: Command Prompt, Windows PowerShell, PowerShell 7 or another interpreter, with a time limit; scripts can be saved, reused and shared with rules.

#### File types

- **File type catalogue**: About 940 extensions grouped as Category and Subtype, with friendly groups such as Audio, Document and Image. Add, move or hide extensions on the File types page; changes apply everywhere at once.

#### Automation

- **Rules that run by themselves**: Rules watch their folders in the background, remember what they handled, retry files that are in use and show their status; they can also run on a schedule.
- **Presets**: Saved tidy-ups that are not tied to a folder: pick one, choose a folder, preview and run. A plain-language explanation shows what each preset does.
- **Command line**: Run a preset or rule from a script or Task Scheduler with --run-preset or --run-rule; a real run needs --yes, output can be JSON and exit codes are documented.
- **Explorer right-click menu**: Optional menu entries for the current user, no administrator rights needed.

#### Everyday use

- **History and log**: Every run with details and undo, and a searchable log of what happened to each file.
- **Import and export**: Rules, presets, variables and scripts can be exported and imported; rules from other organisers' configuration files can be imported (they arrive switched off) with warnings for anything that could not be converted.
- **Backup and restore**: Back up the whole library and settings and restore them later; the files being replaced are kept.
- **Tray, start with Windows, notifications**: Keeps working from the system tray, can start with Windows for the current user, and uses native notifications.
- **Light and dark themes**: Follows Windows or set by hand; compact layout with keyboard shortcuts and a command palette.

## Safe by design

- Every rule can be previewed first; the preview and the real run use the same code.
- A skipped or failed step stops any later delete for that file; duplicates always keep one copy.
- Files that are still being downloaded or copied are left alone until they stop changing.
- Moves, renames, copies and extractions can be undone from History.

## Feedback

Found a bug or want something added? Open an issue and include what you expected, what happened and, if you can, a screenshot.

## Source code

Deckhand is closed source for now. The source code may be released at a later stage, once the beta has settled; watch this repository for news.

## Licence

Deckhand is free to use for personal and commercial purposes. See [LICENSE](LICENSE) for the exact terms.

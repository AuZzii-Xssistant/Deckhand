# Deckhand authoring reference v1
Deckhand (Windows file organiser) imports a JSON draft you write; the user validates and imports it. Use ONLY the fields below, never invent kinds or fields (full schema: `Deckhand.exe --authoring-schema`). `=x` is the default.

## Workflow
1. Ask for missing full Windows paths before drafting. Ask for each required watch folder, fixed destination, folder exclusion or local program path the user has only named. Accept drive paths such as `C:\Finance\Drop` and UNC paths such as `\\server\share\Invoices`. Never guess a drive or turn a folder name into a path. A preset run-time folder, relative destination or supported Windows folder alias can be used when that is the user's intent. State assumptions and reuse supplied IDs or IDs from the optional `--authoring-catalogue` command.
2. Draft JSON. The user opens **Rules → Import** and selects the file. Deckhand validates it before showing Import. If there are errors, use **Copy issues**, revise the draft, and select it again.
3. Review the draft and import it. Rules arrive disabled. Preview on a real folder before enabling them.
4. Terminal-capable AI tools can optionally use `--validate-draft draft.json [--example "C:\full\file.ext"]` for structured errors and synthetic simulation. The command validates without importing or running anything.

## Envelope
`{"deckhand_export":1,"rules":[],"presets":[],"variables":[],"scripts":[]}` arrays optional, no other keys. Ids unique strings (imports get fresh ids; `run_script.script` ids are remapped inside one export).
- Rule: `id`,`name` req; `enabled`=true (ALWAYS write false) `group` `note` `folders`[WatchFolder] `condition` `actions`[] `schedule` `exclude`[Exclusion] `allow_ocr`=true `skip_destinations`=true (skip files already in this rule's own destinations) `report_missing_values`=false `settle_seconds` (null=app setting 15, 0=no wait)
- Preset: `id`,`name` req; `description` `category` `subfolders`=false `condition` `actions` `variables`[UserVar] `allow_ocr` `exclude`. No folders (user picks one at run time).
- WatchFolder `path` req, `subfolders`=false, `interval_minutes`=0 (0 live, N rescan), `exclude_folders`[] (bare name skipped anywhere, or a path)
- Exclusion `kind` path|name|name_pattern(*,?)|folder|extension, `value`, `note`: checked before conditions. For `folder` exclusions in rules or presets, give the full path (e.g. `C:\Accounts\Incoming\Archive`). To skip a folder by name anywhere under a rule's watch folder, use that watch folder's `exclude_folders` instead. For a filename prefix, use a pattern such as `DRAFT*`.
- Schedule `kind` daily|weekly|monthly|interval; `time` "HH:MM"; `days`[0=Mon..6] (empty=every day); `day` 1-31; `last_day`=false; `every_minutes`; `watch_live`=false (also react to changes; off = only on schedule); `run_missed`=false

## Conditions `{"kind":..}`. Missing/empty `condition` matches nothing; use `all_files`.
- `all`/`any` {items:[Cond]} AND/OR (array `items`); empty never matches. `not` {item:Cond} and `no_ocr` {item:Cond} (ONE object `item`; no_ocr = child without OCR text). Nest freely. `not` of an empty/unfinished child is false.
- `text` {var,op,value,value_var,case_sensitive=false,wildcard=false}; ops is is_not contains not_contains starts_with ends_with regex not_regex empty not_empty. `value_var` = compare with another variable. `value` may hold `{var}` tokens.
- `number` {var,op,value,value2,unit}; ops gt ge lt le eq ne between(value..value2); `unit` bytes|kb|mb|gb for `size` only (1 kb=1024).
- `date` {var,op,amount,unit=days,date}; older_than/newer_than use amount + unit(minutes hours days weeks months years); before/after/on use `date` "YYYY-MM-DD[ HH:MM]".
- `file_type` {types:[..],negate=false}: image video audio archive pdf document spreadsheet presentation program code font script installer diskimage cad3d data database webpage email temp, or "Category\\Subtype".
- `duplicate` {folders=[] (=watched folder), subfolders=false, keep=oldest|newest}: true only for a copy that is NOT kept (same size+SHA-256; one copy always stays; empty files never).
- `folder_age` {op:older_than|newer_than,amount,unit=days,subfolders=false}: age of the newest file in the file's own folder.
- `all_files`; `sleep` {millis<=300000} (waits only in real runs).
Matching: `*` stays within a word, `**` spans anything, `?` one char, space = any whitespace (needs wildcard:true); regex is .NET-like (lookaround, backrefs, named groups; no balancing/conditionals); case-insensitive unless case_sensitive. Negative ops are TRUE when the value is missing; positive ops, number, date are false. Blank `value` (except empty/not_empty) and blank/NaN numbers never match. `ext` has no dot.

## Variables: `var` and `{id}`
Built-in (types in the catalogue): name(stem) ext filename path folder_name folder_path size(bytes) type type.category type.subtype type.group created modified accessed now contents contents.columns hash.md5|sha1|sha256 pdf.title|subject|keywords|author|creator|producer|created|modified audio.artist|album|album_artist|title|genre|track|disc|year|duration image.make|model|camera|width|height|megapixels|taken|latitude|longitude. `contents` = PDF/Word/Excel/PowerPoint/text (+OCR of images and scans when the user enabled OCR; OCR can misread, so delete/recycle/overwrite never run from OCR matches without per-file approval). pdf./audio./image. are empty for other files.
UserVar `{id,title,source,occurrence,def}` (req id,title,def): `source`=any variable id (""=contents; user vars may chain); `occurrence` {number=1,from_top=true}; no source text = no value. `def.type`:
- `wordlist` {words[]} first word found (wildcards ok); `dictionary` {items:[{find,ret}]} `ret` of the first `find` found
- `regex` {pattern,ignore_case=true,group1=false (true=capture 1),opts:{multiline,singleline,ignore_whitespace,line_breaks_as_spaces,pdf_layout:""|lines|columns,group:"2"|"name"}}
- `pattern` {parts:[{kind,text}],before[],after[]} kind digit number number_sep char word text line space literal(text)
- `date` {order:""|dmy|mdy|ymd,format} first date in source; `custom_date` {source:now|created|modified|accessed,format}
Templates (dest, name, base, zip, message, command, args, condition value): `{id}` `{id:fmt}` `{id|fallback}` `{id:fmt|@other:fmt|literal}` `{id>t1>t2:arg}` `{modified+7d:yyyy-MM}`; `{{` `}}` literal braces (in a condition `value` there is no escape: known `{id}` tokens are filled in, any other braces are literal text, e.g. `\d{4}`). Date fmt (.NET): yyyy yy MMMM MMM MM dddd ddd dd HH hh mm ss tt 'text'; math +/-N then m h d w mo y. Fallbacks chain; a literal starting with @ is `\@`. Put the format on every part of a fallback chain. Order inside a token is id, date math, `:fmt`, `|fallbacks`, then `>transforms` (which also apply to the fallback): `{client|UNKNOWN>upper}`. Transforms: upper lower title trim collapse replace:find:with regex:pat:repl($1) substr:start:len left:n right:n pad:w[:ch] padright:w[:ch] slug sanitize digits word:n remove:text prefix:t suffix:t; escape `\:` `\>` `\\`. Unknown `{x}` is an error.

## Actions `{"kind":..}` run in order per file
- `move` {dest,on_conflict=rename,keep_structure=false,remove_empty=false,on_missing=fail}: keeps the file name; dest created; relative dest = relative to the file's folder. `copy` {+follow=false: later actions use the copy}.
- `rename` {name (no extension),on_conflict,on_missing}; `change_ext` {ext}.
- `sort` {base (""=file's folder),by:type|extension|year|month|day,on_conflict,remove_empty,on_missing} -> Category\Subtype | EXT | yyyy | yyyy-MM | yyyy-MM-dd (modified).
- `recycle` {remove_empty}; `delete` {remove_empty} permanent, no undo.
- `extract` {dest (""=new folder beside archive),delete_after=false} zip 7z rar tar tar.gz, never overwrites; `zip` {zip,on_conflict,keep_structure,on_missing} adds the file to a .zip (original stays).
- `run` {command,shell=default|cmd|power_shell|pwsh,elevated=false,timeout_secs=0 (=600)}; `run_script` {script (id),args=""}.
- `log`/`notify` {message}; `remove_empty_folder` {which=source|current,and_parents=false}.
- on_conflict (name taken): rename (_2,_3) | skip | overwrite (old file to Recycle Bin). on_missing (a `{var}` has no value, no fallback): fail (file's chain stops, shown as skipped "no value") | skip (left alone, later actions continue) | fallback.

## Scripts `{id,name,body}` req; `shell`=power_shell|cmd|pwsh|other; `interpreter`+`extension` (other; `args` must contain {script}); `args`=""; `workdir` (""=file's folder); `timeout_secs`=0; `elevated`=false; `stop_on_error`=true (PowerShell: the first error fails the step); `description` `group`
- Body goes to a temporary script file. Deckhand passes that script's path to the shell, followed by the script and action `args`. To pass the matched file to a PowerShell parameter, set the action's `args` to `"{path}"`. The matched file is never added as an implicit argument.
- Values are made safe for where they land; any file name works. `{path} {name} {filename} {folder_path} {folder_name} {ext}` keep every character (`# ` $ % & ' ( ) ; , [ ] { }` emoji, accents) and are escaped for their place: inside `'...'` in PowerShell the quote is doubled, inside `"..."` `$` and the backtick are escaped, inside `"..."` for cmd and in `args` they are passed as they are; a value standing alone without quotes is put in quotes for you. Write `'{path}'` in a PowerShell body or `run`, `"{path}"` in cmd, in `args` and for `{script}` interpreters. Text taken from file contents or user variables is not trusted: quotes, operators and line breaks are removed first. Only these are refused (the step fails and the file is left alone, with the reason): a `{token}` in the middle of a word that needs quotes (write the quotes), a `%` in a name on a cmd command line (cmd would expand `%PATH%`; use PowerShell), a cmd/other-program value starting with `-` (read as an option; use `{path}`), and `{tokens}` in the source of an `other`-language script (pass them in `args`). Scripts only replace known tokens; other braces are literal.
- A PowerShell library script stops at its first error and the step fails (`stop_on_error`; set false to let PowerShell carry on). An inline `run` PowerShell command does not: begin it with `$ErrorActionPreference = 'Stop';` when a later action depends on it.
- `run` uses the same expansion but unknown `{x}` is an error. Exit 0 = done; non-zero, timeout (process tree killed) or missing shell = step failed. Output (stdout+stderr, first ~600 chars) appears in History, never in variables. `elevated:true` fails unless Deckhand runs as administrator (never prompts).

## Execution
- Every enabled rule sees every file in its folders, in library order; no stop-processing. A later rule sees the file where an earlier one left it; each rule handles a file once per modified time. Make rules exclusive with conditions.
- A Failed/Retry step stops that file's later actions. A Skipped step (conflict skip, already there, on_missing skip) does not, but then later `delete`, `recycle`, `extract` with delete_after do NOT run: copy-then-recycle never loses a file.
- Left alone: unfinished downloads (.crdownload .part .tmp ~$*), files changed within settle seconds, hidden/system, read-only, locked (retried), online-only cloud files.
- Undo (History): move copy rename sort zip extract recycle; not delete or run/run_script effects. Preview uses the same code as a real run.

## Capabilities
- Native: AND/OR/NOT nesting; name/path/date/size/type/duplicate/folder-age tests; content and OCR matching; pulling values (regex, dates, dictionaries) into names/folders; schedules; zip/extract; recycle/delete; notify.
- Two rules: if/else (complementary conditions with `not`), priorities (exclusive conditions).
- Script only: network, email, upload, databases, merge/split files, anything else.
- Impossible: loops, counters/state across rules or runs, stop-processing, script output into variables, moving folders as units, triggers other than file changes/schedules/rescans.

## Hard rules
`enabled:false` on every rule; no invented kinds/fields/values; prefer `recycle` over `delete`; `on_conflict` `skip` unless the user asked otherwise; `log`-only first for risky ideas; escape backslashes (`"C:\\Users\\Me"`); unique ids; minimal scripts, no network/credentials unless asked; list your assumptions. More patterns and edge cases: AI-AUTHORING-EXAMPLES.md (optional).

## Example 1: nested conditions, extracted variable, transforms
```json
{"deckhand_export":1,
 "variables":[{"id":"vendor","title":"Vendor","def":{"type":"regex","pattern":"Vendor:\\s*([A-Za-z0-9 &.-]+)","group1":true}}],
 "rules":[{"id":"inv","name":"File vendor invoices","enabled":false,
  "folders":[{"path":"C:\\Users\\Me\\Downloads"}],
  "condition":{"kind":"all","items":[
   {"kind":"file_type","types":["pdf"]},
   {"kind":"any","items":[{"kind":"text","var":"contents","op":"contains","value":"invoice"},{"kind":"text","var":"name","op":"regex","value":"^inv[-_ ]?\\d+"}]},
   {"kind":"not","item":{"kind":"any","items":[{"kind":"text","var":"name","op":"contains","value":"draft"},{"kind":"number","var":"size","op":"gt","value":20,"unit":"mb"}]}},
   {"kind":"text","var":"vendor","op":"not_empty"}]},
  "actions":[{"kind":"rename","name":"{modified:yyyy-MM-dd} {vendor>title>sanitize}","on_conflict":"skip","on_missing":"skip"},
   {"kind":"move","dest":"D:\\Finance\\{vendor>title>sanitize}\\{modified:yyyy}","on_conflict":"skip","on_missing":"skip"}]}]}
```
## Example 2: script action with args
```json
{"deckhand_export":1,
 "scripts":[{"id":"log_file","name":"Append to CSV log","timeout_secs":30,"body":"param([string]$File,[string]$Day)\nAdd-Content -LiteralPath 'C:\\Logs\\files.csv' -Value \"$Day,$File\""}],
 "rules":[{"id":"big","name":"Log big videos","enabled":false,"folders":[{"path":"D:\\Media","subfolders":true}],
  "condition":{"kind":"all","items":[{"kind":"file_type","types":["video"]},{"kind":"number","var":"size","op":"gt","value":2,"unit":"gb"}]},
  "actions":[{"kind":"run_script","script":"log_file","args":"\"{path}\" \"{modified:yyyy-MM-dd}\""}]}]}
```

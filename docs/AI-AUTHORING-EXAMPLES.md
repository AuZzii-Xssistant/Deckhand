# Deckhand authoring examples (optional companion to AI-AUTHORING.md)
Every block is a complete draft that passes `--validate-draft`. Adapt paths; keep `"enabled":false`.

## 1. Compact patterns: text ops, size, duplicates, copy/log/notify, intervals
```json
{"deckhand_export":1,"rules":[
 {"id":"p_dups","name":"Log duplicate photos","enabled":false,
  "folders":[{"path":"C:\\Users\\Me\\Pictures","subfolders":true,"interval_minutes":30}],
  "condition":{"kind":"all","items":[{"kind":"file_type","types":["image"]},{"kind":"duplicate","folders":["C:\\Users\\Me\\Pictures"],"subfolders":true,"keep":"newest"}]},
  "actions":[{"kind":"log","message":"Duplicate: {path}"}]},
 {"id":"p_big","name":"Warn about big files","enabled":false,
  "folders":[{"path":"D:\\Projects","subfolders":true,"interval_minutes":60}],
  "condition":{"kind":"number","var":"size","op":"gt","value":2,"unit":"gb"},
  "actions":[{"kind":"notify","message":"{filename} is over 2 GB"}]},
 {"id":"p_scans","name":"Copy scans","enabled":false,
  "folders":[{"path":"C:\\Scans"}],
  "condition":{"kind":"all","items":[
    {"kind":"text","var":"ext","op":"is","value":"pdf"},
    {"kind":"any","items":[{"kind":"text","var":"name","op":"regex","value":"^scan[-_ ]?\\d{4}"},{"kind":"text","var":"name","op":"starts_with","value":"IMG","case_sensitive":true}]},
    {"kind":"text","var":"name","op":"not_contains","value":"private"},
    {"kind":"text","var":"name","op":"not_regex","value":"\\(\\d+\\)$"}]},
  "actions":[{"kind":"copy","dest":"D:\\Backup\\Scans","on_conflict":"skip"},{"kind":"log","message":"Copied {filename}"}]},
 {"id":"p_exe","name":"Move installers except Sheltered","enabled":false,
  "folders":[{"path":"C:\\Users\\Me\\Downloads"}],
  "condition":{"kind":"all","items":[{"kind":"text","var":"ext","op":"is","value":"exe"},{"kind":"not","item":{"kind":"text","var":"name","op":"contains","value":"sheltered"}}]},
  "actions":[{"kind":"move","dest":"D:\\Installers","on_conflict":"skip"}]},
 {"id":"p_old","name":"Log old downloads","enabled":false,
  "folders":[{"path":"C:\\Users\\Me\\Downloads","interval_minutes":1440}],
  "condition":{"kind":"date","var":"modified","op":"older_than","amount":6,"unit":"months"},
  "actions":[{"kind":"log","message":"Old: {filename} ({modified:yyyy-MM-dd})"}]}
]}
```

## 2. Preset: photos into Year\Month by date taken
```json
{"deckhand_export":1,"presets":[{"id":"photos_by_date","name":"Photos by date taken","category":"Photos","description":"Sorts pictures into year and month folders.","subfolders":false,
 "condition":{"kind":"file_type","types":["image"]},
 "actions":[{"kind":"move","dest":"{image.taken:yyyy|@modified:yyyy}\\{image.taken:yyyy-MM|@modified:yyyy-MM}","on_conflict":"skip"}]}]}
```

## 3. Stale project folders: recycle, then remove the empty folder (log first in real life)
```json
{"deckhand_export":1,"rules":[{"id":"stale","name":"Clean stale scratch folders","enabled":false,
 "folders":[{"path":"D:\\Scratch","subfolders":true,"exclude_folders":["keep","node_modules"]}],
 "exclude":[{"kind":"extension","value":"psd","note":"never touch Photoshop files"}],
 "condition":{"kind":"folder_age","op":"older_than","amount":90,"unit":"days","subfolders":true},
 "actions":[{"kind":"recycle"},{"kind":"remove_empty_folder","which":"source","and_parents":false}]}]}
```

## 4. Weekly schedule: extract archives, recycle the archive only if extraction succeeded
```json
{"deckhand_export":1,"rules":[{"id":"unpack","name":"Unpack downloads weekly","enabled":false,
 "folders":[{"path":"C:\\Users\\Me\\Downloads"}],
 "schedule":{"kind":"weekly","time":"07:30","days":[0],"run_missed":true},
 "condition":{"kind":"file_type","types":["archive"]},
 "actions":[{"kind":"extract","dest":"D:\\Unpacked\\{name}"},{"kind":"recycle"}]}]}
```

## 5. Variables: dictionary + custom_date + date finder
```json
{"deckhand_export":1,
 "variables":[
  {"id":"dept","title":"Department","source":"contents","def":{"type":"dictionary","items":[{"find":"payroll","ret":"HR"},{"find":"purchase order","ret":"Purchasing"},{"find":"invoice*due","ret":"Accounts"}]}},
  {"id":"doc_date","title":"Date in document","source":"contents","occurrence":{"number":1,"from_top":true},"def":{"type":"date","order":"dmy","format":"yyyy-MM-dd"}},
  {"id":"stamp","title":"Run month","def":{"type":"custom_date","source":"now","format":"yyyy-MM"}}],
 "rules":[{"id":"docs","name":"Route office documents","enabled":false,
  "folders":[{"path":"C:\\Inbox"}],
  "condition":{"kind":"all","items":[{"kind":"file_type","types":["pdf","document"]},{"kind":"text","var":"dept","op":"not_empty"}]},
  "actions":[{"kind":"rename","name":"{doc_date|@modified:yyyy-MM-dd} {name}","on_conflict":"skip"},{"kind":"move","dest":"D:\\Docs\\{dept}\\{stamp}","on_conflict":"skip"}]}]}
```

## 6. Custom interpreter script (Python) with arguments
```json
{"deckhand_export":1,
 "scripts":[{"id":"py_stat","name":"Print size in KB","shell":"other","interpreter":"python.exe","extension":"py","args":"\"{script}\" \"{path}\"","timeout_secs":20,"body":"import os, sys\nprint(os.path.getsize(sys.argv[1]) // 1024)"}],
 "rules":[{"id":"py_rule","name":"Size report","enabled":false,
  "folders":[{"path":"C:\\Reports"}],
  "condition":{"kind":"all_files"},
  "actions":[{"kind":"run_script","script":"py_stat"}]}]}
```

## Edge cases
- Rule order: all rules see every file. If rule A moves a file out of rule B's folder, B never sees it. Two rules matching one file both act on it (the second on the new location).
- `all`/`any` need `items` (array). `not`/`no_ocr` need `item` (object). An empty `all`/`any` matches nothing, so `{"kind":"not","item":{"kind":"all","items":[]}}` also matches nothing.
- `on_missing` applies only to Move/Copy/Rename/Sort/Zip templates. `{image.taken:yyyy|@modified:yyyy}` formats the EXIF date and falls back to the modified date (put the format on BOTH parts).
- `date` before/after/on need `date`; older_than/newer_than need `amount`+`unit`. `folder_age` takes only older_than/newer_than.
- A `copy` with `follow:true` makes later actions work on the copy, not the original.
- `skip_destinations` (default on) stops a rule re-examining files already in its own destination folders when subfolders are watched.
- `run` command and script args are single strings. Quote paths: in a `run` command cmd `"{path}"`, PowerShell `'{path}'`; in a script's `args` always `"{path}"` (single quotes are not quotes there). Any file name works: Deckhand escapes the value for the quotes you wrote.
- Imported presets get fresh ids; imported variables whose id exists with a different definition are renamed `id_2` and references in imported rules follow.

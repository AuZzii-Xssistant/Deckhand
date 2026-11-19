# Connect Deckhand to an AI client

Local MCP is a preview feature in Deckhand 0.9.50. A compatible AI client can help draft a rule, ask for missing details and send the draft to Deckhand for review.

## Set up a local client on Windows

1. In Deckhand, open **Help → Connect an AI client…** or **Settings → AI integrations**.
2. Choose **Claude Desktop / JSON** for Claude Desktop, Cursor or a compatible JSON client. Choose **Codex / TOML** for Codex. Copy the setup and add the Deckhand entry to your client's local MCP configuration. Preserve other entries.
3. Keep **Use the library currently open in Deckhand** checked if you want the client to submit drafts, propose edits or request previews. Clear it for authoring and validation without profile access.
4. Reload the client and try “Help me organise invoice PDFs in Downloads. Ask me what you need before drafting a rule.”

Deckhand fills in the command and profile path for your PC. A client launches the connection when it needs it. The preview has been tested with the standalone Windows build. Availability in the Store edition depends on its Windows command alias. ChatGPT on the web cannot connect directly to this local setup.

## Review and run

New rules arrive disabled. Review changes in Deckhand before enabling a rule. Proposed edits to eligible disabled rules and preview requests are under **Rules → Review AI requests**. Deckhand opens the preview on your desktop. A real run requires confirmation there.

The client can check aggregate scan and run totals using the request ID. File-level results remain in Deckhand. An interrupted run can report recovered counts after restart if it reached the action journal.

When you enable profile access, the client may read eligible rule definitions, including folder paths. Your client may share those details with its model provider. See the [privacy policy](https://auzzii-xssistant.github.io/Deckhand/privacy.html).

## Names are not unique

Deckhand lets two rules or presets share a name, so a client must not identify an existing rule by name alone. The rule list returns each rule's id, group, watched folders and how many rules have the same name. The client should pass the id in later requests and, when several rules share a name, ask you which one you mean. The command line follows the same rule: a name that matches several rules exits with code 6 and lists the candidates with their ids.

## Reading file contents

A draft that tests the text of a file uses the File contents condition (`contents`). Its options are `contents: { "ocr": true, "columns": false }`: read pictures and scanned PDFs with Windows OCR (on by default), and read a PDF column by column. OCR is an option of each condition, not a switch on the rule or in Settings.

## Use the guides without MCP

Open **Help → Author rules with AI…** to copy the references to your chosen AI tool. Ask it for a Deckhand JSON draft, then use **Rules → Import** to validate and review it.

- [Rule authoring guide](AI-AUTHORING.md)
- [Worked examples](AI-AUTHORING-EXAMPLES.md)
- [Rule draft JSON schema](deckhand-draft.schema.json)

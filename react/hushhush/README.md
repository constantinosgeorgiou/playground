# hushhush

Remove source identifiers from links.

Usage:

1. The user pastes the URL from the site in the box.
2. The platform tries to identify which platform the link is from.
3. A list appears, below the box. the first result is the URL without any query parameters, followed by all possible combinations of query parameters. This allows the user to open the links to check if they still work.
   1. If the platform identifies the link is from a specific platform based on the `domains` array in the `SourceIdentifiers.json` file the first result should be displayed with a label as "high confidence".

Source identifiers are in a JSON file named `SourceIdentifiers.json`.

The format is the following:

```json
{
    "instagram": {
        "domains": ["instagram.com"],
        "sourceidentifiers": ["igsh"]
    },
    "youtube": {
        "domains": ["youtube.com", "youtu.be"],
        "sourceidentifiers": ["si"]
    }
}
```

It should use static site generation in order to be hosted as a single file or directory to any server without the need of a database or a running server. It should use React to help with interactivity.


Bugs:

- [x] After I clean a URL, when I try to clean an empty URL it doesnt clean the previous Results.
- [x] when typing with a keyboard pressing enter should submit the form.
- [ ] SourceIdentifiers.json, keys should be camelCase
- [ ] Generate all combinations of URLs


example.com/test?a=1&b=2&c=3

This should be displayed instead of high and low confidence.
Exact result (full target icon)
Approximate result (empty target icon)
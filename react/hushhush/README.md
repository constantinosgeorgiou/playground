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

## Motivation

Big platforms use various query parameters to track the sources of the links. Clicking links while logged in helps them build a graph of all the accounts associated with eachother. This is information could be damning for journalists, activists, and people who are vigilant about their online privacy.

## FAQ

## How do you clean the links?

A crowded sourced file is used containing known source identifiers that various sites are using to track the links.

### Do you collect any data?

No. Everything is done on your device.

_Technical answer:_ To build this site Next.JS was used, which does collect anonymous [telemetry](https://nextjs.org/telemetry). We switch this feature off, so that not even general usage information is sent to their servers.

What are Urchin Tracking Module (UTM) parameters?

> Urchin Tracking Module (UTM) parameters are five variants of URL parameters used by marketers to track the effectiveness of online marketing campaigns across traffic sources and publishing media. They were introduced by Google Analytics' predecessor Urchin and, consequently, are supported out of the box by Google Analytics. The UTM parameters in a URL identify the campaign that refers traffic to a specific website, and attribute the browser's website session and the sessions after that until the campaign attribution window expires to it. The parameters can be parsed by analytics tools and used to populate reports.
>
> Source: Wikipedia

### How can I contribute?

With code:

- You can contribute code by having a look at the open issues and creating a Pull Request.

With suggestions:

- Open a new issue to tell us which site to add.

With issue reports:

- Open a new issue to report to us an issue that came up with the site.

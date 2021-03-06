# Notion to Obsidian Converter

This is a simple script to convert exported Notion notes to Obsidian (or maybe other systems too).

## Usage

1. Download Notion data from Notion>Settings & Members>Settings>Export content>Export all workspace content
2. Unzip the data using 7-Zip (or something better than Window's default)
3. Clone this repository
4. Install packages: `npm i`
5. Run `npm run start`
    1. You have the choice to generate markdown tables for each Notion database/linked database (it's going to add a lot of links to your Obsidian Graph).
        1. You can then decide whether you want to keep the linked db. Currently they are useless since there are no filter in the export aka they are the same as the main db and just add useless duplicate to the Obsidian Graph)
    2. You have the choice of renaming all the files/folders without the uuid and updating the links to Obsidian references.
6. Input the path where your Notion notes are
7. Move notes folder into Obsidian directory

_Warning: Notion pages that contain parentheses or dashes in the title will have them removed by Notion while exporting your data so the file will be created without them, even though the link itself will still retain them._

## How it works

**Paths:**

The script searches through every path and removes the long UUID at the end of both the directory paths and the file paths.

**Conversion Features:**

-   Markdown links are converted from `[Link Text](Notion\Link\Path)` to `[[Link Text]]`. It isn't perfect due to name collision, but it works for most links. Some links are `www.notion.so` links when they're related table records and those are converted from `https://www.notion.so/The-Page-Title-2d41ab7b61d14cec885357ab17d48536` to `[[The Page Title]]`.
-   Links to a file with no extension (.md, .png, ...) or notion url, are not transformed to an Obsidian link (Obsidian doesn't detect them correctly and put them on the grap...):

    -   `![Histograms%20c15c33d1f1aa4c88bfd9ba2ac1da4b4a/untitled](Histograms%20%202%20c15c33d1f1aa4c88bfd9ba2ac1da4b4a/untitled)`
    -   to `![Histograms/untitled](Histograms/untitled)`

-   After CSV's have their links corrected a secondary Markdown file is made with the same name with all of its contents converted into a Markdown table (multiline values are converted to single line because of Markdown table limitations).

    -   The first column is transformed to an Obsidian Reference. It's generally the name of the document.

-   URL links found in Markdown are left as-is: `[Link Text](URL)` because Obsidian renders these correctly. The signifier for a "valid URL" is just containing `://` or being an IP, so it captures `http://`, `https://` and other networks like `ipfs://` as well as `xxx.xxx.xxx.xxx` for IPs.

-   If a link contains illegal characters `*"/\<>:|?` the character is replaced with a space.

-   Image links are converted from `![Page%20Title%20c5ae5f01ba5d4fb9a94d13d99397100c/Image%20Name.png](Page%20Title%20c5ae5f01ba5d4fb9a94d13d99397100c/Image%20Name.png)` to `![Page Title/Image Name.png]`

## Why

**I want to know that I'm not too tied to Notion. That I can still use my notes if I want to stop using Notion.**

### Notion raw export is not that usable in Obsidian

-   It relies on Markdown links instead of Obsidian links
-   Tables are in csv which has some benefit but are not usable in Obsidian
-   UUID at the end of file name is a nice feature to avoid colisions (notes with the same name) but:
    -   It's not practical to read/edit
    -   Windows can't handle large paths.
    -   I'm thinking about transforming them in shorter "UUID" like using the first 8 char of the UUID

## Known issues

-   Notes with a very long title won't be properly linked. The main issue is that Notion cut the file name at a variable length around 50 characters for very long names.
    -   That's why cut at 45 characters to have the same limit everywhere
-   Notion remove the following characters, `"./*%<>:?`, from the file name and thus the links.

## Warning

This script transform the folder to make it work in Obsidian.

This is not made to be robust. Don't run it twice on the same export or it's likely to fail and truncate paths unnecessarily.

# Inspiration

The original idea and basic implementation was inspired by Conner Tennery https://github.com/connertennery/Notion-to-Obsidian-Converter

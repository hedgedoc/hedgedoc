# Notes

!!! info "Design Document"
    This is a design document, explaining the design and vision for a HedgeDoc 2
    feature. It is not a user guide and may or may not be fully implemented.

Each note in HedgeDoc 2 contains the following information:

- publicId (`b604x5885k9k01bq7tsmawvnp0`)
  <!-- markdownlint-disable proper-names -->
- a list of aliases (`[hedgedoc-2, hedgedoc-next]`)
  <!-- markdownlint-enable proper-names -->
- groupPermissions
- userPermissions
- viewCount (`0`)
- owner
- revisions
- authorColors
- historyEntries
- description (`All you never wanted to know about notes`)
- title (`Notes`)
- tags (`[features, cool, update]`)
- version

The `publicId` is the default possibility of identifying a note. It will be a randomly generated
128-bit value encoded with [base32-encode][base32-encode] using the crockford variant and converted
to lowercase. This variant of base32 is used, because that results in ids that only use one case of
alpha-numeric characters and other url safe characters. We convert the id to lowercase, because we
want to minimize case confusion.

`aliases` are the other way of identifying a note. There can be any number of them, and the owner
of the note is able to add or remove them. All aliases are just strings (especially to accommodate
the old identifier from HedgeDoc 1 [see below](#conversion-of-hedgedoc-1-notes)), but new aliases
added with HedgeDoc 2 will only allow characters matching this regex: `[a-z0-9\-_]`. This is done to
once again prevent case confusion. One of the aliases can be set as the primary alias, which will be
used as the identifier for the history entry.

`groupPermissions` and `userPermissions` each hold a list of the appropriate permissions.
Each permission holds a reference to a note and a user/group and specify what the user/group
is allowed to do.
Each permission is additive, that means a user that has only the right to read a note via a group,
but the right to write via a different group or directly for his user, is able to write in the note.

The `viewCount` is a simple counter that holds how often the read-only view of the note in question
was requested.

`owner` is the user that created the note or later got ownership of the note. The current owner is
able to change the owner of the note to someone else. The owner of a note is the only person that
can perform the following actions:

- delete the note
- modify `aliases`
- remove all `revisions`

The `revisions` hold all revisions of the note. These are the changes to the note content and by
whom they were performed.

The `authorColors` each specify for the tuple user and note which color should be used
to highlight them.

The `historyEntries` hold the history entries this note is referenced in. They are mainly here
for the purpose of deleting the history entries on note deletion.

`description`, `tags` and `title` are each information specified in the [frontmatter][frontmatter]
of the note. They are extracted and saved in the database to allow the history page to show them and
do a search for tags without having to do a full-text search or having to parse the tags of
each note on search.
While `description` and `tags` are only specified by the [frontmatter][frontmatter], the title is

- the content of the *title* field of the [frontmatter][frontmatter] of the note
- **OR** the content of the *title* field in the *opengraph* field of the [frontmatter][frontmatter]
  of the note
- **OR** the first level 1 heading of the note

which ever of these is the first to not be unspecified.  
All mentioned fields are extracted from the note content by the backend on save or update.

`version` specifies if a note is an old HedgeDoc 1 note, or a new HedgeDoc 2 note.
This is mainly used to redirect old notes form <https://md.example.org/noteid>
to <https://md.example.org/n/noteid>.

## Deleting Notes

- The owner of a note may delete it.
  - By default, this also removes all revisions and all files that were uploaded to that note.
  - The owner may choose to skip deleting associated uploads, leaving them without a note.
  - The frontend should show a list of all uploads that will be affected
    and provide a method of skipping deletion.
- The owner of a note may delete all revisions. This effectively purges the edit
  history of a note.

## Conversion of HedgeDoc 1 notes

First we want to define some terms of the HedgeDoc 1 notes:

- **noteId**: This refers to the auto-generated id for new notes.
  (<https://demo.hedgedoc.org/Q_Iz5T_lQWGYxne0sbMtwg>)

- **shortId**: This refers to the auto-generated short id which is used for "published" notes and
  slide presentation mode. (<https://demo.hedgedoc.org/s/61ZHI6HGE>)

- **alias**: This refers to user-defined URLs for notes on instances with Free-URL mode enabled.
  (<https://md.kif.rocks/lowercase>)

The noteId, shortId and alias of each HedgeDoc 1 note are saved as HedgeDoc 2 aliases.
Each note gets a newly generated publicId.

[frontmatter]: https://jekyllrb.com/docs/front-matter/
[base32-encode]: https://www.npmjs.com/package/base32-encode

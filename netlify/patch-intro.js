/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const { copyFile } = require('fs/promises');

console.log("Patch intro.md to include netlify banner.")
copyFile("netlify/intro.md", "public/mock-backend/public/intro.md")
  .then(() => console.log("Copied intro.md"))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })

console.log("Patch motd.txt to include privacy policy.")
copyFile("netlify/motd.txt", "public/mock-backend/public/motd.txt")
  .then(() => console.log("Copied motd.txt"))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })

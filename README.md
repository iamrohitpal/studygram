# Studygram Workspace

This repository houses the Studygram project, which is organized as a monorepo containing the following components:

- **studygram-api**: Node.js + Express backend using MySQL for data persistence.
- **studygram-web**: React PWA application designed for end-users.
- **studygram-admin**: React Admin panel designed for administrators.

## Features Implemented
- **Guest Mode**: Unauthenticated users can browse public posts, search, and view study reels.
- **Post Visibility Controls**: Content creators can restrict their posts to "Logged-in Users Only" (registered) or leave them as "Public (Everyone)".
- **Follow System**: Users can follow/unfollow each other directly from the feed (Instagram-style), with immediate UI feedback and local storage syncing.
- **Cascading Deletions**: Deleting a post automatically cleans up associated likes, comments, and saves without foreign key constraints failing.
- **Interactive Feed**: Guests are prompted to login/register if they try to like, comment, save, or follow users.

## Project Structure
```text
studygram/
├── studygram-api/     # Express API Backend
├── studygram-web/     # React User PWA
└── studygram-admin/   # React Admin Dashboard
```

## Setup Instructions

Please refer to the individual project READMEs for specific installation and running instructions:
- [studygram-api](./studygram-api/README.md)
- [studygram-web](./studygram-web/README.md)
- [studygram-admin](./studygram-admin/README.md)

# Studygram Web Frontend

Studygram is an interactive, modern Progressive Web Application (PWA) designed to foster a community of learners. This React application uses Vite, TypeScript, Tailwind CSS, and Material UI.

## Implemented Features

### 1. Guest Mode
- **Unauthenticated Access**: Guests can explore the `Home Feed`, `Search`, and `Study Reels` without an account.
- **Login Prompts**: Interacting with core functionality (Liking, Commenting, Saving, or Following) will seamlessly redirect guests to the login page.
- **Smart UI Restrictions**: Elements like the "3-dots" menu (for reporting/hiding posts) are automatically hidden for guest users.

### 2. The Follow System (Instagram-Style)
- **In-Feed Follows**: Users can follow/unfollow creators directly from the feed using the follow button in the Post header.
- **Optimistic UI**: The state toggles instantly, utilizing `localStorage` to ensure cross-page session continuity.
- **Self-Follow Protection**: The application prevents you from accidentally following yourself by hiding the follow button on your own posts.

### 3. Post & Visibility Controls
- **Flexible Visibility**: When uploading a new post, creators can pick between:
  - `Public (Everyone)`: Visible to all, including guests.
  - `Logged-in Users Only`: Restricted visibility for authenticated members.
- **Rich Media**: Support for Images, Videos, and Study Notes.

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & Vanilla CSS + Material UI
- **State Management**: Redux Toolkit & React Query
- **Routing**: React Router DOM

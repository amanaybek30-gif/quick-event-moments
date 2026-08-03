# Event Capture Pro

Build a mobile-first, multi-event photo and video sharing platform designed for live events such as graduations, conferences, and festivals.

The platform must allow event organizers to collect crowd-sourced photos and videos from attendees via QR code, and manage all media in one centralized system.

⸻

🎯 CORE OBJECTIVE

Create a system where:

 • Admin creates events

 • Organizers manage their event and generate QR codes

 • Guests scan QR → upload photos/videos instantly

 • All media is stored, organized, and downloadable

The experience must be fast, simple, and optimized for mobile users in low-bandwidth environments.

⸻

👑 USER ROLES & PERMISSIONS

1. SUPER ADMIN (Platform Owner)

Admin has full control over the platform.

Features:

 • Secure login (email + password)

 • Dashboard showing:

 • Total events

 • Total uploads

 • Create new events with:

 • Event name

 • Event date

 • Event description (optional)

 • Cover image upload

 • Automatically generate:

 • Unique event ID

 • Event URL

 • Assign organizer access:

 • Email or secure access link

 • View all events and their media

 • Delete or manage events

⸻

2. ORGANIZER (Client)

Organizer should only access their assigned event.

Access:

 • Login OR secure private link (no complex auth)

Dashboard Features:

 • View event:

 • Cover image

 • Event name & date

 • Generate QR code for event link

 • Download QR code (PNG format)

Media Management:

 • View gallery (photos + videos)

 • Filter:

 • Photos only

 • Videos only

 • Sort:

 • Newest first

 • Download:

 • Single file

 • Bulk download (ZIP if possible)

Insights (optional but valuable):

 • Total uploads count

 • Number of contributors

⸻

3. GUEST (NO LOGIN REQUIRED)

Guests access the platform via QR code.

⸻

📱 GUEST EXPERIENCE FLOW

Event Landing Page

 • Display:

 • Event cover image

 • Event name

 • Headline:

“Capture the Moment 🎓”

 • Subtext:

“Upload your photos and videos to the official event gallery”

Buttons:

 • 📸 Take Photo

 • ⬆️ Upload Photo

 • 🎥 Upload Video

Optional input:

 • Name (optional, not required)

⸻

Upload Flow

Requirements:

 • Allow:

 • Camera capture (photo/video)

 • File upload from device

 • Automatically:

 • Compress images before upload

 • Optimize video size if possible

 • Show:

 • Upload progress bar

 • Loading indicator

⸻

Success Screen

After upload:

 • Message:

“✅ Your upload has been added!”

 • Subtext:

“Thank you for capturing the moment 🎉”

Buttons:

 • Upload Another

 • View Gallery

⸻

🖼️ GALLERY SYSTEM

Public Gallery (optional toggle)

 • Grid layout

 • Display:

 • Photos and videos

 • Features:

 • Lazy loading (for performance)

 • Infinite scroll or pagination

 • Click to view full screen

 • Video:

 • Tap to play

⸻

Organizer Gallery

 • Same layout but with:

 • Download buttons

 • Filter tools

 • Sorting options

⸻

☁️ BACKEND & STORAGE

Use cloud storage for media:

 • Cloudinary OR AWS S3

Store metadata:

 • Event ID

 • File URL

 • File type (image/video)

 • Upload timestamp

 • Optional user name

⸻

⚡ PERFORMANCE REQUIREMENTS

 • Mobile-first design (priority)

 • Extremely fast load times

 • Optimize for slow internet (3G/4G)

 • Compress all uploads before storage

 • Limit steps:

👉 Scan → Tap → Upload (max 2–3 steps)

⸻

🎨 UI / UX DESIGN

 • Clean, modern, elegant

 • Theme:

 • White background

 • Gold accents (premium/event feel)

 • Large buttons for mobile

 • Smooth transitions

 • Minimal clutter

⸻

🔐 SECURITY & ACCESS CONTROL

 • Admin: full access

 • Organizer: event-restricted access

 • Guest: no login required

 • Prevent unauthorized access to admin/organizer dashboards

⸻

🚀 ADVANCED FEATURES (IF POSSIBLE)

 • Real-time gallery updates (auto-refresh)

 • Watermark images/videos with:

 • Event name or logo

 • “Featured Media” section (selected by organizer)

 • Basic moderation:

 • Ability to delete uploads

 • Upload analytics:

 • Total uploads per event

⸻

📱 TECHNICAL REQUIREMENTS

 • Build as a Progressive Web App (PWA)

 • Fully responsive (mobile-first)

 • No app installation required

 • Works smoothly on Android and iPhone browsers

⸻

 🧠 KEY PRINCIPLES

 • Simplicity over complexity

 • Speed over heavy features

 • Zero friction for guests

 • Maximum control for organizers

 • Scalable for multiple events

⸻

🔥 FINAL INSTRUCTION

This platform should feel like a professional event tool, not a prototype.

It must be:

 • Reliable during live events

 • Easy to use for non-technical users

 • Ready to scale across multiple events

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://quick-event-moments.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d2419189-2c8a-47b2-907f-f0971d7a2880).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

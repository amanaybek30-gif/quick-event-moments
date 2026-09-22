# Fix Google sign-in

## Changes
- Remove the legacy Google fallback that bypasses the app’s managed Google provider and fails in installed mobile apps.
- Use one managed sign-in flow across browser, iOS PWA, Android PWA, and preview contexts.
- Preserve the loading state during redirects and show the actual sign-in failure when navigation cannot start.
- Verify the hosted sign-in endpoint, production callback, app compilation, and sign-in launch behavior.

## Technical details
The managed authentication library already chooses a full-page redirect when the app runs standalone and a popup only inside the embedded preview. The current standalone/mobile detection incorrectly switches those users to a separate legacy provider path, causing the inconsistent failure.

// ==========================================================
// WellnessHub Default Rules Configuration
// ==========================================================
// This file defines the default, out-of-the-box experience
// for a new user. These rules will be displayed on the
// Settings page until the user copies them to their account.
//
// IMPORTANT: The file paths are placeholders. The user must
// replace 'user' with their actual Linux username and ensure
// the media files exist at these locations.
// ==========================================================

export const defaultRules = [
  // --- Rules for when the user is feeling SAD ---
  // Goal: To provide an uplifting and hopeful atmosphere.
  {
    emotion: "sad",
    action: "play_music",
    payload: "/home/user/Music/Uplifting/cinematic_hope_uplifting.wav",
    is_enabled: true,
  },
  {
    emotion: "sad",
    action: "change_wallpaper",
    payload: "/home/user/Pictures/Wallpapers/hopeful.jpg",
    is_enabled: true,
  },
  {
    emotion: "sad",
    action: "speak",
    payload:
      "I've noticed you might be feeling down. I'm playing some uplifting music for you.",
    is_enabled: false, // Spoken messages are off by default to be less intrusive.
  },

  // --- Rules for when the user is feeling ANGRY ---
  // Goal: To create a calming and de-stressing environment.
  {
    emotion: "angry",
    action: "play_music",
    payload: "/home/user/Music/Calm/lofi_decompression_calm.wav",
    is_enabled: true,
  },
  {
    emotion: "angry",
    action: "change_wallpaper",
    payload: "/home/user/Pictures/Wallpapers/serene_blue.png",
    is_enabled: true,
  },
  {
    emotion: "angry",
    action: "speak",
    payload:
      "Taking a moment to breathe. I've played some calming music to help you relax.",
    is_enabled: true,
  },

  // --- Rules for when the user is feeling HAPPY ---
  // Goal: To maintain and complement a positive mood without being disruptive.
  {
    emotion: "happy",
    action: "play_music",
    payload: "/home/user/Music/Energetic/funky_electronic_energetic.wav",
    is_enabled: false, // Disabled by default so it doesn't interrupt a user's current music.
  },
];

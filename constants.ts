
import { ReferenceMap, PromptData } from './types';

// Map specific keywords/names to Reference IDs automatically
export const SMART_ALIASES: Record<string, string> = {
  "ayo": "auraayo",
  "rayne": "rayneaura",
  "hana": "aurahana",
  "hanna": "aurahana",
  "zorbie": "zorbie",
  "jax": "jaxiron",
  "iron": "jaxiron",
  "gnatman": "auragnat",
  "gnat": "auragnat",
  "kinetic": "aurakinetic",
  "sparky": "aurakinetic"
};

export const INITIAL_LORE = `WORLD SETTING: "The World of Aura"
GENRE: Shonen Battle / Sci-Fi / Urban Fantasy
TONE: High-energy, gritty, slightly comedic but serious combat.

POWER SYSTEM ("AURA"):
- Everyone has "Aura" which manifests as colored energy.
- Colors denote personality/fighting style (Red=Aggressive, Blue=Calm/Tech, Pink=Precision, Green=Alien).
- "Destiny Cup" is the main fighting tournament.

LOCATIONS:
- South City: A cyberpunk metropolis where the poor live in the "Lower Wards" and the rich in the "Sky Spire".
- Cheetahlicious Club: A notorious hangout spot for fighters.

HISTORY:
- The "Negus" were ancient warriors who originally harnessed Aura.
- Modern fighters use a mix of martial arts and Aura projection.
- Being "Broke" is a major character motivation for Ayo.`;

export const INITIAL_CHARACTERS: ReferenceMap = {
  auragnat: {
      id: "auragnat",
      name: "Gnatman",
      color: "#374151",
      description: "Tactical superhero wearing a full black insect-themed armored suit, helmet with large amber bug-eye lenses, translucent wing attachments.",
      voice: "Raspy, filtered tactical voice, serious tone",
      base64: null,
      mimeType: null,
      type: 'character'
  },
  aurakinetic: {
      id: "aurakinetic",
      name: "Kinetic",
      color: "#3b82f6",
      description: "Young black male with short dreadlocks/twists, expressive brown eyes, athletic build, often surrounded by blue electric aura.",
      voice: "High energy, youthful, fast-talking",
      base64: null,
      mimeType: null,
      type: 'character'
  },
  auraayo: { 
      id: "auraayo",
      name: "Ayo", 
      color: "#f472b6",
      description: "Young man with red skin, spiky white hair, orange eyes.",
      voice: "Energetic, gritty Shonen Hero voice, medium pitch", 
      base64: null,
      mimeType: null,
      type: 'character'
  },
  aurahana: { 
      id: "aurahana",
      name: "Hana", 
      color: "#60a5fa",
      description: "Female lead, long flowing pink hair, green eyes, fair skin.",
      voice: "Sharp, commanding female voice, slightly raspy", 
      base64: null,
      mimeType: null,
      type: 'character'
  },
  rayneaura: { 
      id: "rayneaura",
      name: "Rayne", 
      color: "#3b82f6",
      description: "Young white male with spiky dark blue hair, confident smirk.",
      voice: "Smooth, arrogant, deep calm voice", 
      base64: null,
      mimeType: null,
      type: 'character'
  },
  zorbie: {
      id: "zorbie",
      name: "Zorbie",
      color: "#84cc16",
      description: "Green-skinned alien humanoid with antennae, yellow eyes.",
      voice: "High-pitched, quirky alien voice", 
      base64: null,
      mimeType: null,
      type: 'character'
  },
  jaxiron: {
      id: "jaxiron",
      name: "Jax Iron",
      color: "#94a3b8",
      description: "Tall muscular man, short slicked-back dark hair, vertical scar over left eye.",
      voice: "Deep, gravelly, serious soldier voice", 
      base64: null,
      mimeType: null,
      type: 'character'
  }
};

export const INITIAL_LOCATIONS: ReferenceMap = {
  locforest: {
    id: "locforest",
    name: "Anime Forest",
    color: "#22c55e",
    description: "Lush green ancient forest with massive twisting trees, bioluminescent plants, filtered sunlight beams, mystical atmosphere, highly detailed anime background",
    voice: null,
    base64: null,
    mimeType: null,
    type: 'location'
  },
  loccity: {
    id: "loccity",
    name: "South City",
    color: "#a855f7",
    description: "Futuristic cyberpunk city street at night, neon signs, wet pavement reflections, towering skyscrapers, crowded atmosphere, anime style background",
    voice: null,
    base64: null,
    mimeType: null,
    type: 'location'
  },
  locarena: {
    id: "locarena",
    name: "Destiny Arena",
    color: "#fbbf24",
    description: "Massive high-tech stadium interior, bright stadium lights, cheering crowds in shadows, holographic displays, grand tournament vibe",
    voice: null,
    base64: null,
    mimeType: null,
    type: 'location'
  }
};

export const INITIAL_PROMPTS: PromptData[] = [
  {
      id: "01",
      time: "00:00 - 00:15",
      characters: ["auragnat"],
      content: "Sequence 1: THE ANOMALY\nPrompt: Cinematic extreme wide shot of Aether City skyline at midnight, heavy rainstorm. In the foreground, @auragnat stands perched on a gothic stone gargoyle. Lighting is moody neon noir, deep shadows, cyan city glow. Rain pours in sheets, bouncing off his form. Camera slowly pushes in on his back. Atmosphere is gritty, photorealistic.\nChronological Flow:\n(Audio) Heavy rain hitting concrete. Distant sirens.\n(Audio) Gnatman [Raspy, filtered tactical voice]: \"This city screams in neon... trying to drown out the darkness.\""
  },
  {
      id: "02",
      time: "00:15 - 00:30",
      characters: ["auragnat"],
      content: "Sequence 2: The Anomaly\nPrompt: From @auragnat's back on the Aether City rooftop, transition to an over-the-shoulder close-up shot of @auragnat's left gauntlet. Rain droplets bead on the matte black armor. A holographic wireframe map of the Moon projects from the gauntlet, glowing ominous orange. The hologram shows a jagged red fracture line spreading across the lunar surface. @auragnat tilts his head slightly.\nChronological Flow:\n(Audio) MENTOR (Comms): \"Readings are spiking. Gravitational shear on the lunar surface. It's cracking.\"\n(Audio) Gnatman [Raspy, filtered tactical voice]: \"I see it. Something’s clawing its way out.\""
  },
  {
      id: "03",
      time: "00:30 - 00:45",
      characters: ["aurakinetic"],
      content: "Sequence 3: The Static Surfer\nPrompt: On the wet Aether City rooftops, @aurakinetic surfs past the camera on a disc of crackling blue static electricity, moving right to left at high speed. Rain evaporates into steam around him. Lighting shifts to bright blue strobing from his power.\nChronological Flow:\n(Audio) Loud electrical crackle. Hip-hop beat fading in.\n(Audio) Kinetic [High energy, youthful]: \"Woooo! Yo, is it always this wet in this dimension?\""
  },
  {
      id: "04",
      time: "00:45 - 01:00",
      characters: ["auragnat", "aurakinetic"],
      content: "Sequence 4: The Confrontation\nPrompt: On the wet Aether City rooftop, @auragnat stands motionless and heavy on the left. @aurakinetic hovers on the right, bobbing gently, surrounded by a nervous blue electric aura. @auragnat stares silently, his glowing visor slit fixed on the teen.\nChronological Flow:\n(Audio) Kinetic [High energy, youthful]: \"Okay, don't freak out. I know, 'stranger danger,' but my compass says the world ends right about... here.\"\n(Audio) Gnatman [Raspy, filtered tactical voice]: \"Get off my roof.\""
  },
  {
      id: "05",
      time: "01:00 - 01:15",
      characters: ["auragnat", "aurakinetic"],
      content: "Sequence 5: The Vortex\nPrompt: From @auragnat and @aurakinetic on the Aether City rooftop, looking at each other, the camera cinematically tilts up to the night sky above Aether City. The sky tears open, and a massive purple vortex swirls in the clouds. A gigantic, burning meteor punches through the vortex, illuminating the city in apocalyptic red light. @auragnat and @aurakinetic are small silhouettes looking up.\nChronological Flow:\n(Audio) A sound like tearing metal.\n(Audio) Kinetic [High energy, youthful]: \"Okay, that? That is definitely not weather.\"\n(Audio) Gnatman [Raspy, filtered tactical voice]: \"Mentor. Analysis. Now.\""
  },
  {
      id: "06",
      time: "01:15 - 01:30",
      characters: [],
      content: "Sequence 6: The Void Manifests\nPrompt: In the night sky above Aether City, the camera telephoto zooms on the burning meteor. The rock shell explodes. Emerging from the center is The Void Emperor, a humanoid silhouette of Vantablack negative space, surrounded by an accretion disk of swirling purple energy. The space around him warps via gravitational lensing.\nChronological Flow:\n(Audio) VOID EMPEROR: \"This reality... is brittle. I shall shatter it to build my throne.\""
  },
  {
      id: "07",
      time: "01:30 - 01:45",
      characters: ["auragnat", "aurakinetic"],
      content: "Sequence 7: Zero-G City\nPrompt: As The Void Emperor, looming in the Aether City sky, raises a hand, the camera widens to a slow-motion shot of Aether City. Gravity reverses. Cars, water, and debris lift off the ground. @auragnat fires a grappling hook to anchor himself to the rooftop. @aurakinetic grabs a floating chimney. Fluid dynamics show water globules rising, depicting chaotic zero-g physics.\nChronological Flow:\n(Audio) Warping 'wub-wub' sound.\n(Audio) Gnatman [Raspy, filtered tactical voice]: \"Gravitational inversion! Mag-boots engaged!\""
  },
  {
      id: "08",
      time: "01:45 - 02:00",
      characters: ["auragnat", "aurakinetic"],
      content: "Sequence 8: The Fastball Special\nPrompt: From @auragnat anchored and @aurakinetic holding a chimney amidst the zero-g Aether City, a high-speed tracking shot follows @aurakinetic holding @auragnat, encased in a bullet-shaped aura of blue lightning. They rocket upwards, breaking the sound barrier with a visible mach cone. They punch through the clouds into the star-filled void of space. Anime-style speed lines and motion blur.\nChronological Flow:\n(Audio) Sonic boom.\n(Audio) Kinetic [High energy, youthful]: \"You're heavy! What do you keep in that belt, lead weights?!\""
  },
  {
      id: "09",
      time: "02:00 - 02:15",
      characters: ["aurakinetic"],
      content: "Sequence 9: Planetary Destruction\nPrompt: In deep space, an IMAX extreme wide shot of the Moon. The Void Emperor (giant avatar scale) looms over the lunar surface. Massive chunks of the Moon's crust rip away. Glowing magma bleeds from the cracks. Earth is visible in the background. Rigid body destruction with millions of rock particles.\nChronological Flow:\n(Audio) Deep resonant cracking.\n(Audio) Kinetic [High energy, youthful]: \"Dude... he just broke the Moon.\""
  },
  {
      id: "10",
      time: "02:15 - 02:30",
      characters: ["auragnat", "aurakinetic"],
      content: "Sequence 10: Debris Surfing\nPrompt: In deep space, amidst the Moon debris, a dynamic action camera weaves through. @aurakinetic surfs on a spinning slab of moon rock. @auragnat uses maneuvering thrusters to glide, shooting grappling hooks at floating rocks. They dodge purple energy beams. High contrast lighting from the sun.\nChronological Flow:\n(Audio) Zapping lasers.\n(Audio) Kinetic [High energy, youthful]: \"Woooo! Moon-surfing!\""
  },
  {
      id: "11",
      time: "02:30 - 02:45",
      characters: ["auragnat", "aurakinetic"],
      content: "Sequence 11: The Singularity Strike\nPrompt: In deep space, near the Moon debris and the Void Emperor, a macro slow-motion shot of impact. @auragnat throws a \"Void Grenade.\" @aurakinetic blasts it with a massive bolt of blue lightning. The grenade detonates, creating a singularity implosion. The purple accretion disk shatters into spectrum colors. Shockwave rings distort the stars.\nChronological Flow:\n(Audio) High pitched whine followed by a massive BOOM.\n(Audio) VOID EMPEROR: \"IMPOSSIBLE!\""
  },
  {
      id: "12",
      time: "02:45 - 03:00",
      characters: ["auragnat", "aurakinetic"],
      content: "Sequence 12: The Wormhole Collapse\nPrompt: In deep space, following the singularity implosion, the defeated Void Emperor implodes into a destabilizing wormhole. The extraction shuttle (Icarus) arrives but is instantly crushed by the gravitational distortion. The wormhole folds space. @auragnat and @aurakinetic are violently sucked into the spatial tear amidst the shuttle debris. The background shifts instantly from the Moon to the blurred blue curve of Earth’s upper atmosphere.\nChronological Flow:\n(Audio) Warping space sound.\n(Audio) MENTOR (Comms): \"Spatial displacement detected! You're jumping directly to Low Earth Orbit!\""
  },
  {
      id: "13",
      time: "03:00 - 03:15",
      characters: ["auragnat", "aurakinetic"],
      content: "Sequence 13: Freefall Recovery\nPrompt: In Low Earth Orbit, following the violent spatial tear, a wide IMAX shot (2.39:1) shows the black void filled with shattered debris of the white Icarus shuttle spinning violently. @auragnat stabilizes, using blue ion thrusters to grab an unconscious @aurakinetic. Harsh sunlight creates pitch-black shadows (chiaroscuro).\nChronological Flow:\n(Audio) Gnatman [Raspy, filtered tactical voice]: \"Mentor, I have him. The shuttle is gone.\""
  },
  {
      id: "14",
      time: "03:15 - 03:30",
      characters: ["auragnat", "aurakinetic"],
      content: "Sequence 14: The Wake Up\nPrompt: In Low Earth Orbit, from @auragnat holding the unconscious @aurakinetic, a close-up on @auragnat’s face/visor, reflecting Earth. He yanks @aurakinetic. @aurakinetic wakes up, panicked. Purple sparks (ferrofluid style) leak from @aurakinetic's hands, reacting to the vacuum. Background debris begins to glow faint red from atmospheric entry.\nChronological Flow:\n(Audio) Gnatman [Raspy, filtered tactical voice]: \"Wake up, Sparky! I’m not burning up for your corpse!\""
  },
  {
      id: "15",
      time: "03:30 - 03:45",
      characters: ["auragnat", "aurakinetic"],
      content: "Sequence 15: The Plasma Sheath\nPrompt: From @aurakinetic waking up in Low Earth Orbit as debris glows, a long shot looks down as they slam into Earth's atmosphere. A violent 'Shock Cone' forms—igniting into a blinding sheath of ionized plasma (pink/violet/orange). The camera shudders violently. @auragnat's suit glows cherry-red.\nChronological Flow:\n(Audio) Deafening ROAR of wind and fire.\n(Audio) Gnatman [Raspy, filtered tactical voice]: \"I need a shield!\""
  },
  {
      id: "16",
      time: "03:45 - 04:00",
      characters: ["aurakinetic"],
      content: "Sequence 16: The Shield Struggle\nPrompt: In Earth's atmosphere, surrounded by plasma, a medium shot from a dynamic angle shows @aurakinetic screaming, eyes glowing white. He claps hands, creating a geometric, translucent purple energy sphere. It pushes the orange plasma away, creating a safe pocket. The shield flickers dangerously, showing signs of failing power.\nChronological Flow:\n(Audio) Kinetic [High energy, youthful]: (Straining) \"I can't... hold the heat... forever!\""
  },
  {
      id: "17",
      time: "04:00 - 04:15",
      characters: ["auragnat", "aurakinetic"],
      content: "Sequence 17: The Magnetic Cushion\nPrompt: From them struggling with the shield in Earth's atmosphere, a high-angle shot looks down at a wet, industrial rooftop in Aether City as they fall at terminal velocity. @aurakinetic blasts a weak magnetic pulse. The metal roof liquefies and warps upwards like ferrofluid spikes to catch them. They smash into the metal cushion, creating a cloud of steam and sparks.\nChronological Flow:\n(Audio) High-pitched magnetic whine, CRUNCH of warping metal."
  },
  {
      id: "18",
      time: "04:15 - 04:30",
      characters: ["auragnat", "aurakinetic"],
      content: "Sequence 18: The Chromatics\nPrompt: From the Aether City rooftop where they just crashed, a POV shot from the alleyway below. A gang of The Chromatics point up at the roof. The leader has a holographic face mask. Lighting is pink and green rim lights.\nChronological Flow:\n(Audio) CHROMATIC LEADER: \"Space debris! Let's see if it bleeds!\""
  },
  {
      id: "19",
      time: "04:30 - 04:45",
      characters: ["auragnat", "aurakinetic"],
      content: "Sequence 19: The Conductive Disk\nPrompt: In the Aether City alleyway below the rooftop, a tracking action shot follows @auragnat and @aurakinetic as they jump from the roof. @aurakinetic tries to form a saucer but his hand just sparks weakly. He desperately grabs a metal trash can lid mid-air, channeling the last of his current into it to magnetize it. He surfs the lid down. @auragnat swings on a grapple.\nChronological Flow:\n(Audio) Kinetic [High energy, youthful]: \"Batteries are cooked... need a conductor!\""
  },
  {
      id: "20",
      time: "04:45 - 05:00",
      characters: ["auragnat", "aurakinetic"],
      content: "Sequence 20: The Interrogation (Bridge Scene)\nPrompt: In an Aether City alleyway, ground level, tight framing. @auragnat holds the defeated Chromatic Leader against a brick wall by the throat. Rain washes over them. In the background, @aurakinetic leans heavily against a dumpster, his electric aura dim and sputtering, physically exhausted. He tries to light a spark but it fizzles.\nChronological Flow:\n(Audio) Gnatman [Raspy, filtered tactical voice]: \"The Serpent Collective. Where are they?\"\n(Audio) CHROMATIC LEADER: \"Subway... Sector 9...\"\n(Audio) Kinetic [High energy, youthful]: \"Hurry up... I'm running on fumes here. Literally zero percent.\""
  },
  {
      id: "21",
      time: "05:00 - 05:15",
      characters: ["auragnat", "aurakinetic"],
      content: "Sequence 21: The Bio-Agents\nPrompt: From the Aether City alleyway, transition to a wide shot of an abandoned subway platform. Shadows on the ceiling detach and drop. They are Bio-Agents—human-reptile hybrids with scaling skin and cybernetic tails. Subsurface scattering on their slimy skin under green sodium lights. @auragnat and @aurakinetic stand back-to-back.\nChronological Flow:\n(Audio) Gnatman [Raspy, filtered tactical voice]: \"Bio-Agents. The Serpent's elite guard.\""
  },
  {
      id: "22",
      time: "05:15 - 05:30",
      characters: ["auragnat"],
      content: "Sequence 22: The Railgun Strike\nPrompt: In the subway tunnel, an exterior shot of the moving Mag-Lev train. A Bio-Agent heavy trooper aims a massive coil-lined Railgun. He fires. A beam of pure kinetic force hits the track ahead. The beam obliterates the linear induction propulsion coils, leaving twisted, molten copper and destroyed concrete. The track is severed.\nChronological Flow:\n(Audio) Sonic boom.\n(Audio) Gnatman [Raspy, filtered tactical voice]: \"Mentor! The track is gone!\""
  },
  {
      id: "23",
      time: "05:30 - 05:45",
      characters: ["aurakinetic"],
      content: "Sequence 23: The Living Engine\nPrompt: Inside the moving Mag-Lev train, @aurakinetic sees the severed track gap. He screams, pushing past his limits. His skin turns pure, blinding white (energy form). Massive, structural-level arcs of thick blue and purple lightning explode from his chest, arcing out the windows to the subway tunnel walls. The lightning strikes the walls and solidifies, creating temporary rails of pure energy.\nChronological Flow:\n(Audio) The sound of a power grid overloading.\n(Audio) Kinetic [High energy, youthful]: \"I need... MORE POWER!\""
  },
  {
      id: "24",
      time: "05:45 - 06:00",
      characters: ["auragnat", "aurakinetic"],
      content: "Sequence 24: The Crossing\nPrompt: In the subway tunnel, a wide exterior spectacle shot. The train hits the gap. It does not fall. It rides on the jagged, blinding arcs of lightning generated by @aurakinetic, bridging the abyss. The train glides over the gap suspended by magnetic force, grinding against the tunnel air, sending showers of molten sparks like fireworks. @auragnat anchors himself on the roof.\nChronological Flow:\n(Audio) Kinetic [High energy, youthful]: (Voice distorted by energy) \"NOT... TODAY!\""
  },
  {
      id: "25",
      time: "06:00 - 06:15",
      characters: ["auragnat", "aurakinetic"],
      content: "Sequence 25: The Prime Manifestation\nPrompt: In the dark subway tunnel, after the train's landing, a low angle, cinematic slow zoom. The smoke clears to reveal Serpent Prime floating out of the shadows. His upper body is humanoid, composed of shifting purple cosmic gas and iridescent scales. Where legs should be, he has a massive, floating tail made of pure crackling green energy. His eyes burn like two blinding white quasars. The air around him distorts with heat.\nChronological Flow:\n(Audio) A deep, resonant hum that vibrates the speakers.\n(Audio) Gnatman [Raspy, filtered tactical voice]: (Whispering) \"What is that thing...?\""
  },
  {
      id: "26",
      time: "06:15 - 06:30",
      characters: ["aurakinetic"],
      content: "Sequence 26: The Revelation\nPrompt: In the dark subway tunnel, a close-up on Serpent Prime's face, cosmic gas swirling around his jaw. He raises a hand formed of nebula dust, pointing directly at the camera. Reverse shot to @aurakinetic, who is exhausted and kneeling. @aurakinetic freezes, his eyes widening as a blue memory-flash flickers across his face.\nChronological Flow:\n(Audio) SERPENT PRIME: (Voice sounding like a legion of whispers) \"You think you are lost, boy? I know exactly where you came from. And I know your true name.\""
  },
  {
      id: "27",
      time: "06:30 - 06:45",
      characters: ["aurakinetic"],
      content: "Sequence 27: The Cliffhanger\nPrompt: In the dark subway tunnel, an extreme close-up on @aurakinetic’s face. The fear is palpable. The camera violently zooms into his pupil until the screen goes black. Hard cut. Bold white text appears in the center of the black void: \"TO BE CONTINUED\".\nChronological Flow:\n(Audio) A sharp, high-pitched violin screech that cuts to abrupt silence on the black screen."
  }
];

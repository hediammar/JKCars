# Design Guidelines: Futuristic Rent-a-Car & Excursion Booking Website

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern automotive and travel booking platforms with a futuristic twist. The design combines the clean aesthetic of Tesla's website with the booking functionality of Booking.com, while maintaining a unique Tunisian coastal identity.

## Core Design Elements

### A. Color Palette

**Primary Colors:**
- Electric Blue: `#007BFF` (207 100% 50%) - Primary brand color for CTAs, headers, active states
- Sky/Cyan Blue: `#00C2FF` (192 100% 50%) - Secondary accents, hover states, highlights
- Pure White: `#FFFFFF` (0 0% 100%) - Main background, card surfaces
- Deep Charcoal: `#0A0A0A` (0 0% 4%) - Primary text, headings

**Gradient Applications:**
- Hero overlays: `from-blue-600/20 to-cyan-400/10`
- Card hover effects: `from-blue-500/5 to-cyan-400/5`
- Button gradients: `from-blue-600 to-blue-700`
- Glowing accents: `shadow-blue-500/50`

**Glassmorphism Effects:**
- Background: `bg-white/80 backdrop-blur-lg`
- Borders: `border border-blue-100/50`
- Card surfaces: `bg-white/90 backdrop-blur-md`

### B. Typography

**Font Stack:**
- Primary: "Manrope" (via Google Fonts CDN)
- Fallback: "Inter", system-ui, -apple-system

**Type Scale:**
- Hero Headlines: `text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight`
- Page Titles: `text-4xl md:text-5xl font-bold`
- Section Headers: `text-3xl md:text-4xl font-semibold`
- Card Titles: `text-xl md:text-2xl font-semibold`
- Body Text: `text-base md:text-lg leading-relaxed`
- Labels/Meta: `text-sm md:text-base font-medium text-gray-600`

### C. Layout System

**Spacing Primitives:**
- Use Tailwind units: `2, 4, 6, 8, 12, 16, 20, 24, 32` for consistent rhythm
- Section padding: `py-16 md:py-20 lg:py-24`
- Card padding: `p-6 md:p-8`
- Element gaps: `gap-4 md:gap-6 lg:gap-8`

**Container Strategy:**
- Full-width sections: `w-full` with inner `max-w-7xl mx-auto px-4`
- Content sections: `max-w-6xl mx-auto`
- Form containers: `max-w-4xl mx-auto`

**Grid Layouts:**
- Car Fleet: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Features: `grid grid-cols-1 md:grid-cols-3 gap-8`
- Excursions: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

### D. Component Library

**Navigation:**
- Fixed top navigation with glassmorphism: `fixed top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-blue-100/50`
- Logo: Electric blue with glow effect
- Nav links: `text-gray-700 hover:text-blue-600 transition-colors`
- Mobile: Slide-in drawer with Framer Motion

**Buttons:**
- Primary CTA: `bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all`
- Secondary: `border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-all`
- Outline on images: `bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-3 rounded-lg`

**Cards:**
- Car Cards: White with subtle shadow, hover lift effect (`hover:-translate-y-2 hover:shadow-xl transition-all duration-300`)
- Glassmorphism overlay on images: `bg-gradient-to-t from-black/60 to-transparent`
- Corner radius: `rounded-xl md:rounded-2xl`

**Forms:**
- Input fields: `bg-white border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-4 py-3`
- Select dropdowns: Custom styled with blue accents
- Date pickers: Blue theme integration
- Progress bar: Gradient blue with animated fill

**Data Display:**
- Spec badges: `bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium`
- Price display: `text-3xl font-bold text-blue-600`
- Availability calendar: Blue highlights for available dates
- Photo galleries: Full-width slider with thumbnail navigation

**Overlays:**
- Modals: `bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl`
- Confirmation dialogs: Centered with Framer Motion scale animation
- Booking summary: Sticky panel with glassmorphism effect

### E. Animations & Interactions

**Framer Motion Patterns:**
- Page transitions: `fadeIn` with slide from bottom
- Card reveals: Stagger children with `staggerChildren: 0.1`
- Hover effects: Scale 1.02 with glow shadow
- Floating elements: Subtle y-axis motion (`animate={{ y: [0, -10, 0] }}`)

**Scroll Animations:**
- Section reveals: Fade in + slide up when in viewport
- Parallax hero: Slow scroll on background video/image
- Sticky booking panel: Appears after scrolling past hero

**Micro-interactions:**
- Button hover: Glow shadow expansion
- Input focus: Border color transition + ring effect
- Car card hover: Lift + shadow + image slight zoom
- Add-on selection: Checkmark animation with blue pulse

## Images

**Hero Section:**
- Large hero image/video: Luxury car driving along Tunisian coastline at sunset, Hammamet beach visible
- Aspect ratio: 16:9 on desktop, 4:3 on mobile
- Overlay: `bg-gradient-to-r from-blue-600/30 to-transparent`
- Placement: Full-width above fold with CTA buttons overlaid

**Fleet Page:**
- Car images: Professional studio shots, white background, 3:2 aspect ratio
- Multiple angles in gallery: Front, side, interior, trunk
- Thumbnail strip below main image

**Excursions Page:**
- Destination cards: Landscape photos of Tunisian landmarks (Tunis Medina, Sidi Bou Said, Sahara dunes)
- 16:9 aspect ratio with gradient overlay for text readability

**About Page:**
- Tunisia map visualization showing coverage areas
- Team photos or modern illustration set
- Office/fleet photos with blue color grading

**Background Elements:**
- Subtle blue gradient orbs: Floating decorative elements
- Geometric patterns: Light blue lines and shapes for visual interest

## Special Features

**Car Details Page:**
- Split layout: 60% image gallery, 40% sticky booking panel
- Tab navigation: Overview, Specifications, Reviews, Insurance
- Real-time price calculator with animated number transitions

**Booking Flow:**
- 4-step progress indicator with animated blue line
- Summary sidebar always visible with price breakdown
- Confirmation with animated checkmark and booking ID reveal

**Mobile Optimization:**
- Bottom sticky CTA bar: `fixed bottom-0 bg-white/95 backdrop-blur-lg border-t border-blue-100 p-4`
- Hamburger menu with smooth slide animation
- Touch-friendly spacing: minimum 44px tap targets
- Swipeable image galleries and date selectors

**Performance:**
- Lazy load all images below fold
- Optimize hero video for mobile (static image fallback)
- Preload critical fonts and icons
- Use WebP format with fallbacks
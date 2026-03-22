# **App Name**: Musheas Nexus

## Core Features:

- Dashboard Overview: Visualize key business metrics such as total orders, revenue, pending/delivered orders, recent orders, top locations, and daily revenue trends on an interactive dashboard.
- Comprehensive Order Management: Efficiently view, search, filter, and manage all customer orders. Includes detailed order views, status updates, note-taking, and direct customer communication via WhatsApp integration.
- Product Catalog Editor: Manage the product catalog by editing product names, prices, stock levels, descriptions, and active status. Supports bulk updates for efficiency.
- Detailed Analytics and Reporting: Access in-depth business analytics including best-selling products, delivery rates, average order value, sales breakdown by product, and order status distributions.
- Customizable Business Settings: Configure essential operational settings such as contact information, shipping policies, website text content, and notification preferences through dedicated settings cards.
- Adaptive & Responsive Interface: Ensures full functionality and an optimized user experience across both desktop (with persistent sidebar) and mobile devices (with a responsive bottom navigation bar and drawer menu).

## Style Guidelines:

- Background: #060e10. A very deep, sophisticated blue-black, establishing a rich foundation for the dashboard's premium dark aesthetic.
- Surface Accents: #0a1a1d (Surface 1) and #0d2226 (Surface 2). Progressively lighter shades used for cards and nested UI components, adding hierarchical depth.
- Primary Accent: #d2b26b (Gold accent). An elegant, warm gold that evokes luxury and quality, used for prominent branding, calls to action, and highlighting critical data.
- Secondary Accent: #55aab4 (Teal). A refreshing and modern teal providing a biotechnological touch, offering visual contrast and signifying active states or new notifications.
- Text Colors: #e6f0ee (Text) for primary content ensures high readability. rgba(230,240,238,.58) (Muted) for secondary information or disabled elements.
- Status/Semantic Colors: #3dba7e (Green) for success or positive states, #e05c5c (Red) for errors, warnings, or negative states, and #b8903f (Gold dark) for darker gold tones or active gold elements.
- Borders: rgba(210,178,107,.13) (Border subtle) and rgba(210,178,107,.25) (Border strong). Subtle gold-tinted borders define interactive and content area boundaries.
- Headings: 'DM Serif Display' (serif), providing an elegant and premium visual for main titles and page headers. The Topbar page title specifically uses this font in gold.
- Body Text: 'Sora' (sans-serif), chosen for its modern clarity and excellent readability across all general content.
- Numbers & Code: 'DM Mono' (monospace), specifically used for numerical displays like prices or identifiers (e.g., DA values, phone numbers, stock counts) for precise, structured presentation. Note: currently only Google Fonts are supported.
- System Messages: 'Chargement...' placeholder text for loading states and 'Aucune commande trouvée' for empty states are displayed with appropriate text styles, often muted.
- Responsive Structure: A persistent 228px wide sidebar on desktop collapses into a mobile bottom navigation bar (≤768px), complemented by a left-drawer hamburger menu for full navigation on smaller screens.
- UI Element Styling: Cards maintain a generous 16px border-radius, while inputs and buttons have an 11px radius, contributing to a soft and contemporary aesthetic. Specific grid layouts are applied throughout.
- Modular Components: Order detail modals appear centered on desktop and as a bottom sheet on mobile. A filter bar scrolls horizontally on mobile for compact interaction. Touch targets adhere to a minimum 44px height.
- Interactive Elements: A Topbar contains a dynamic page title, 'Actualiser' button, 'Notifications' button, and a 'Sauvegarder' primary button (gold gradient), with a hamburger menu visible on mobile.
- Navigation Icons: Clearly identifiable icons (e.g., overview, orders, products, analytics, settings) enhance navigation in both sidebar and bottom navigation.
- Notification & Status Indicators: A red badge displays new order counts on the 'Commandes' navigation item. A red dot alerts to new notifications in the topbar. Status badges feature a 5px colored dot on the left, consistent with toast notifications.
- Smooth Transitions: A 0.22s fadeUp animation ensures fluid view changes, enhancing user experience during navigation. Toast notifications smoothly slide in from the right bottom corner and auto-dismiss after 2.8s.
- Interactive Feedback: Stats cards exhibit subtle hover effects (border brightening and slight vertical lift). Table rows highlight with a delicate gold tint on hover.
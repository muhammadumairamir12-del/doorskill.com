// ===== UI/UX DESIGN PATTERNS & COMPONENTS =====
// Based on Fiverr design specifications

export const DESIGN_TOKENS = {
  colors: {
    primary: '#1DBF73', // Green - CTAs and badges
    background: '#FFFFFF',
    text: '#222222',
    lightText: '#74767E',
    border: '#E8E8E8',
    hover: '#0E8E4F', // Darker green
    success: '#1DBF73',
    error: '#D74B4B',
    warning: '#F9A825',
    info: '#0074E4',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  typography: {
    heading1: { size: '32px', weight: 700, lineHeight: 1.4 },
    heading2: { size: '24px', weight: 700, lineHeight: 1.4 },
    heading3: { size: '20px', weight: 700, lineHeight: 1.4 },
    body: { size: '16px', weight: 400, lineHeight: 1.5 },
    small: { size: '14px', weight: 400, lineHeight: 1.5 },
    caption: { size: '12px', weight: 400, lineHeight: 1.5 },
  },
  radius: '8px',
  shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
};

// ===== HOMEPAGE STRUCTURE =====
export const HOMEPAGE_STRUCTURE = {
  topNav: {
    items: ['Logo', 'Search Bar', 'Categories', 'Fiverr Pro', 'Explore', 'Sign In', 'Join'],
    sticky: true,
    position: 'top',
  },
  hero: {
    title: 'The fastest way to get your work done',
    subtitle: 'Find and hire top freelancers for your projects',
    searchPlaceholder: 'What service are you looking for?',
    popularTags: [
      'Logo Design',
      'WordPress',
      'Social Media Marketing',
      'Graphic Design',
      'Video Editing',
    ],
  },
  socialProof: {
    title: 'Trusted by leading companies',
    logos: ['Google', 'Meta', 'Amazon', 'Airbnb', 'Microsoft', 'Netflix'],
  },
  popularServices: {
    title: 'Popular services',
    layout: 'grid',
    columns: { desktop: 6, tablet: 3, mobile: 2 },
    items: [
      { category: 'Logo Design', icon: '🎨' },
      { category: 'Web Development', icon: '💻' },
      { category: 'Social Media Marketing', icon: '📊' },
      { category: 'Video Editing', icon: '🎬' },
      { category: 'Content Writing', icon: '✍️' },
      { category: 'UI/UX Design', icon: '🎨' },
    ],
  },
  featuredCarousels: [
    {
      title: 'Featured in Graphics & Design',
      category: 'graphics_design',
      layout: 'horizontal_scroll',
    },
    {
      title: 'Featured in Programming & Tech',
      category: 'programming_tech',
      layout: 'horizontal_scroll',
    },
  ],
  sellerSuccessStories: {
    title: 'Why sellers love Fiverr',
    items: [
      { quote: 'I went from freelancer to full-time business owner', author: 'John' },
      { quote: 'Fiverr helped me scale my design business', author: 'Sarah' },
    ],
  },
  ctaSection: {
    title: 'Become a Seller',
    subtitle: 'Earn money by offering your services',
    buttonText: 'Start Selling',
    buttonColor: DESIGN_TOKENS.colors.primary,
  },
  footer: {
    columns: [
      { title: 'Categories', links: ['Graphics', 'Programming', 'Marketing'] },
      { title: 'Company', links: ['About', 'Careers', 'Blog'] },
      { title: 'Support', links: ['Help Center', 'Contact', 'Status'] },
      { title: 'Community', links: ['Forums', 'Sellers', 'Buyers'] },
    ],
    socialLinks: ['Facebook', 'Twitter', 'LinkedIn', 'Instagram'],
  },
};

// ===== GIG CARD COMPONENT =====
export function createGigCard(gig, seller) {
  return {
    type: 'gig_card',
    layout: 'compact',
    elements: [
      {
        id: 'thumbnail',
        type: 'image',
        src: gig.imageUrl,
        alt: gig.title,
        height: '200px',
        objectFit: 'cover',
        priority: true,
      },
      {
        id: 'seller_info',
        type: 'flex',
        items: [
          { type: 'avatar', src: seller.avatarUrl, size: '32px' },
          {
            type: 'text_stack',
            items: [
              { text: seller.username, type: 'name', weight: 600 },
              {
                text: seller.sellerLevel,
                type: 'level_badge',
                color: DESIGN_TOKENS.colors.primary,
              },
            ],
          },
        ],
      },
      {
        id: 'title',
        type: 'text',
        text: gig.title,
        maxLines: 2,
        fontSize: DESIGN_TOKENS.typography.body.size,
        fontWeight: 600,
      },
      {
        id: 'rating',
        type: 'flex',
        items: [
          { type: 'stars', rating: seller.avgRating, maxStars: 5 },
          { type: 'text', text: seller.avgRating, fontSize: '14px' },
          { type: 'text', text: `(${seller.reviewCount})`, color: DESIGN_TOKENS.colors.lightText },
        ],
      },
      {
        id: 'price',
        type: 'text',
        text: `Starting at $${gig.startingPrice}`,
        fontSize: DESIGN_TOKENS.typography.heading3.size,
        fontWeight: 700,
      },
      {
        id: 'heart_button',
        type: 'button',
        icon: '♡',
        size: 'small',
        position: 'top_right',
        action: 'save_to_favorites',
      },
    ],
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius,
    boxShadow: DESIGN_TOKENS.shadow,
    hoverEffect: 'lift', // Subtle shadow increase on hover
  };
}

// ===== GIG DETAIL PAGE LAYOUT =====
export function createGigDetailLayout(gig, seller, reviews = []) {
  return {
    type: 'gig_detail_page',
    layout: 'two_column',
    columns: {
      main: {
        width: '65%',
        sections: [
          {
            id: 'gallery',
            type: 'image_gallery',
            images: gig.images,
            thumbnails: true,
            zoom: true,
          },
          {
            id: 'description',
            type: 'collapsible_text',
            title: 'Description',
            content: gig.description,
            expanded: false,
            maxHeightCollapsed: '200px',
          },
          {
            id: 'faq',
            type: 'accordion',
            title: 'FAQ',
            items: gig.faqs || [],
          },
          {
            id: 'reviews',
            type: 'review_section',
            averageRating: calculateAverageRating(reviews),
            reviewCount: reviews.length,
            reviews: reviews.slice(0, 5),
            sortOptions: ['Most Relevant', 'Most Recent', 'Highest Rating'],
          },
        ],
      },
      sidebar: {
        width: '35%',
        sticky: true,
        sections: [
          {
            id: 'package_selector',
            type: 'package_selector',
            packages: gig.packages,
            onSelect: 'show_checkout',
          },
          {
            id: 'pricing',
            type: 'pricing_display',
            basePrice: gig.packages[0].price,
            currency: 'USD',
            revisions: gig.packages[0].revisions,
            deliveryDays: gig.packages[0].deliveryDays,
          },
          {
            id: 'cta_button',
            type: 'button',
            text: 'Continue',
            color: DESIGN_TOKENS.colors.primary,
            size: 'large',
            width: '100%',
            action: 'proceed_to_checkout',
          },
          {
            id: 'seller_card',
            type: 'seller_card',
            sellerData: {
              name: seller.username,
              avatar: seller.avatarUrl,
              level: seller.sellerLevel,
              rating: seller.avgRating,
              responseTime: seller.avgResponseTime,
              memberSince: seller.createdAt,
              identityVerified: seller.identityVerified,
            },
            contact: 'Contact Seller',
          },
          {
            id: 'contact_button',
            type: 'button',
            text: 'Contact Seller',
            variant: 'secondary',
            width: '100%',
            action: 'open_messages',
          },
        ],
      },
    },
    belowFold: {
      id: 'related_gigs',
      type: 'carousel',
      title: 'Related Services',
      items: [], // Populated with related gigs
    },
  };
}

// ===== CALCULATE AVERAGE RATING =====
function calculateAverageRating(reviews) {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  return (sum / reviews.length).toFixed(1);
}

// ===== DESIGN PRINCIPLES =====
export const DESIGN_PRINCIPLES = {
  background: 'White (#FFFFFF) - clean and minimal',
  cards: 'White cards with subtle shadows',
  primaryColor: 'Green (#1DBF73) for all CTAs and trust badges',
  hierarchy: 'Trust signals placed above the fold',
  sidebar: 'Sticky purchase sidebar - always visible on scroll',
  responsive: 'Mobile-first grid: 1-2 columns mobile, 3-4 desktop',
  disclosure: 'Progressive disclosure: descriptions collapsed by default',
  spacing: 'Consistent 16px (md) and 24px (lg) spacing',
  typography: 'Clear hierarchy with 3 heading sizes + body text',
};

// ===== RESPONSIVE BREAKPOINTS =====
export const BREAKPOINTS = {
  mobile: '0px',
  tablet: '768px',
  desktop: '1024px',
  widescreen: '1440px',
};

// ===== GRID LAYOUT CONFIGURATIONS =====
export const GRID_CONFIGS = {
  gigGrid: {
    mobile: { columns: 1, gap: '16px' },
    tablet: { columns: 2, gap: '16px' },
    desktop: { columns: 3, gap: '24px' },
    widescreen: { columns: 4, gap: '24px' },
  },
  categoryGrid: {
    mobile: { columns: 2, gap: '16px' },
    tablet: { columns: 3, gap: '16px' },
    desktop: { columns: 6, gap: '24px' },
    widescreen: { columns: 6, gap: '24px' },
  },
};

// ===== COLOR PALETTE =====
export const COLOR_PALETTE = {
  primary: {
    name: 'Fiverr Green',
    main: '#1DBF73',
    dark: '#0E8E4F',
    light: '#E8F9F1',
  },
  neutral: {
    white: '#FFFFFF',
    gray1: '#F8F8F8',
    gray2: '#EFEFEF',
    gray3: '#D8D8D8',
    gray4: '#999999',
    black: '#222222',
  },
  semantic: {
    success: '#1DBF73',
    error: '#D74B4B',
    warning: '#F9A825',
    info: '#0074E4',
  },
};

// ===== UI/UX EXPORT =====
export const UIPatterns = {
  designTokens: DESIGN_TOKENS,
  homepage: HOMEPAGE_STRUCTURE,
  createGigCard,
  createGigDetail: createGigDetailLayout,
  principles: DESIGN_PRINCIPLES,
  breakpoints: BREAKPOINTS,
  gridConfigs: GRID_CONFIGS,
  colorPalette: COLOR_PALETTE,
};

export default UIPatterns;

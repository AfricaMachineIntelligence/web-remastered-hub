export type PricingItem = {
  name: string;
  price: string;
  cents: number;
  duration?: string;
  tagline?: string;
  includes?: string[];
  note?: string;
};

export type PricingCategory = {
  name: string;
  items: PricingItem[];
};

export type Brand = "palm_aura" | "smoochie_kids";

export type PricingSection = {
  label: string;
  brand: Brand;
  categories: PricingCategory[];
  sectionNote?: string;
};

export const pricingData: Record<string, PricingSection> = {
  nailbar: {
    label: "Nail Bar",
    brand: "palm_aura",
    categories: [
      { name: "Manicures", items: [] },
      { name: "Pedicures", items: [] },
      { name: "Gel Nails", items: [] },
      { name: "Nail Art", items: [] },
    ],
  },
  headspa: {
    label: "Head Spa",
    brand: "palm_aura",
    categories: [
      {
        name: "Japanese Head Spa Packages",
        items: [
          {
            name: "Express Glow",
            price: "R500",
            cents: 50000,
            duration: "30–35 min",
            tagline: "Perfect for a quick refresh and stress reset.",
            includes: [
              "Facial cleanse & gentle exfoliating scrub",
              "Neck & shoulder cleanse, scrub & massage",
              "Revitalizing self-heating steam eye mask",
              "Invigorating scalp exfoliation & wash",
              "Ultra-hydrating conditioning treatment & scalp massage",
              "Relaxing waterfall rinse",
              "Full body relaxation enhanced by our electric massage bed",
              "Hair towel-dried & brushed (no drying included)",
            ],
          },
          {
            name: "Signature Relax",
            price: "R740",
            cents: 74000,
            duration: "45 min",
            tagline: "A deeper relaxation experience for total scalp & upper-body renewal.",
            includes: [
              "Facial cleanse & gentle scrub with soothing massage",
              "Neck & shoulder cleanse, scrub & massage",
              "Revitalizing steam eye mask",
              "Scalp exfoliation & deep cleanse",
              "Ultra-hydrating conditioning treatment & scalp massage",
              "Waterfall rinse",
              "Hair towel-dried & brushed (no drying included)",
              "Full body relaxation enhanced by our electric massage bed",
              "Head & facial steamer",
            ],
          },
          {
            name: "Signature Luxury Reset Experience",
            price: "R990",
            cents: 99000,
            duration: "60 min",
            tagline: "The ultimate luxury reset — from Skin to Soul.",
            includes: [
              "Facial cleanse, gentle scrub & soothing massage",
              "Neck & shoulder cleanse, scrub & deep massage",
              "Pink clay facial mask & hydrating avocado cream application",
              "Revitalizing steam eye mask",
              "Deep scalp exfoliation & wash",
              "Intensive conditioning treatment & scalp massage",
              "Soothing waterfall rinse",
              "Choice of leave-in treatment OR complimentary self-service dry bar",
              "Full electric bed body massage throughout",
              "Head & facial steamer",
            ],
          },
          {
            name: "Ultimate Royal Head Spa",
            price: "R1,500",
            cents: 150000,
            duration: "90 min",
            tagline: "Our most luxurious head-to-toe relaxation experience.",
            includes: [
              "Welcome drink on arrival",
              "Luxury facial cleanse, exfoliation & soothing massage",
              "Neck & shoulder cleanse, scrub & deep massage",
              "Pink clay facial mask & hydrating cream massage",
              "Revitalizing steam eye mask",
              "Deep scalp exfoliation & detox wash",
              "Ultra-hydrating conditioning treatment & scalp massage",
              "Signature waterfall rinse on our electric Japanese massage bed",
              "Deep foot scrub & relaxing foot massage",
              "Choice of leave-in treatment OR complimentary self-service dry bar",
              "Head & facial steamer",
            ],
          },
        ],
      },
    ],
    sectionNote: "Where luxury meets total relaxation on our electric massage waterfall bed. All treatments are performed on our luxurious electric Japanese head spa bed that gently massages your body throughout your treatment, enhancing circulation, easing muscle tension, and elevating your relaxation experience.",
  },
  salon: {
    label: "Salon",
    brand: "palm_aura",
    categories: [
      { name: "Braids", items: [] },
      { name: "Blowouts & Styling", items: [] },
      { name: "Weaves & Extensions", items: [] },
      { name: "Treatments", items: [] },
    ],
  },
  barber: {
    label: "Barbershop",
    brand: "palm_aura",
    categories: [
      {
        name: "Haircuts",
        items: [
          { name: "Chiskop & Beard", price: "R130", cents: 13000 },
          { name: "Haircut & Beard", price: "R180", cents: 18000 },
          { name: "Haircut", price: "R150", cents: 15000 },
          { name: "Haircut (Kids Under 7)", price: "R120", cents: 12000 },
          { name: "Haircut & Blow", price: "R220", cents: 22000 },
        ],
      },
      {
        name: "Colour & Dye",
        items: [
          { name: "Haircut & Dye (Black)", price: "R250", cents: 25000 },
          { name: "Haircut & Dye (Kids Under 7)", price: "R200", cents: 20000 },
          { name: "Haircut & Bleach", price: "R300", cents: 30000 },
          { name: "Cut, Bleach & Colour", price: "R510", cents: 51000 },
          { name: "Haircut & Blow + Dye", price: "R350", cents: 35000 },
          { name: "Bleach", price: "R180", cents: 18000 },
          { name: "Hair Colouring (Dye)", price: "R180", cents: 18000 },
          { name: "Black Dye", price: "R180", cents: 18000 },
        ],
      },
      {
        name: "Beard & Trim",
        items: [
          { name: "Beard Trim", price: "R30", cents: 3000 },
          { name: "Edge Up / Trim", price: "R50", cents: 5000 },
        ],
      },
    ],
  },
  lashbar: {
    label: "Lash Bar",
    brand: "palm_aura",
    categories: [
      {
        name: "Classic Lashes",
        items: [
          { name: "Classic", price: "R340", cents: 34000 },
          { name: "Wispy Classic", price: "R370", cents: 37000 },
          { name: "Classic Refill", price: "R150", cents: 15000 },
        ],
      },
      {
        name: "Hybrid Lashes",
        items: [
          { name: "Hybrid", price: "R440", cents: 44000 },
          { name: "Wispy Hybrid", price: "R470", cents: 47000 },
          { name: "Hybrid Refill", price: "R350", cents: 35000 },
        ],
      },
      {
        name: "Volume Lashes",
        items: [
          { name: "Volume", price: "R540", cents: 54000 },
          { name: "Wispy Volume", price: "R570", cents: 57000 },
          { name: "Volume Refill", price: "R350", cents: 35000 },
        ],
      },
      {
        name: "Mega Volume Lashes",
        items: [
          { name: "Mega Volume", price: "R640", cents: 64000 },
          { name: "Wispy Mega Volume", price: "R670", cents: 67000 },
          { name: "Mega Volume Refill", price: "R450", cents: 45000 },
        ],
      },
    ],
  },
  restaurant: {
    label: "Restaurant",
    brand: "palm_aura",
    categories: [
      { name: "Breakfast", items: [] },
      { name: "Lunch", items: [] },
      { name: "Beverages & Smoothies", items: [] },
      { name: "Kids Menu", items: [] },
    ],
  },
  kidshair: {
    label: "Kids Salon",
    brand: "smoochie_kids",
    categories: [
      {
        name: "Cornrows",
        items: [
          { name: "1 pony, no extensions", price: "R350", cents: 35000 },
          { name: "2 pony, no extensions", price: "R380", cents: 38000 },
          { name: "1 pony + afro puff", price: "R380", cents: 38000 },
          { name: "1 pony + extensions", price: "R400", cents: 40000 },
        ],
      },
      {
        name: "Braids",
        items: [
          { name: "Short braids", price: "R500", cents: 50000 },
          { name: "Medium braids", price: "R600", cents: 60000 },
          { name: "Long braids", price: "R700", cents: 70000 },
          { name: "Short knotless", price: "R730", cents: 73000 },
        ],
      },
      {
        name: "Boys Hairstyles",
        items: [
          { name: "Twists", price: "R250", cents: 25000 },
          { name: "Cornrows half head", price: "R250", cents: 25000 },
          { name: "Cornrows full head", price: "R300", cents: 30000 },
        ],
      },
    ],
  },
  kidsspa: {
    label: "Kids Spa",
    brand: "smoochie_kids",
    categories: [
      {
        name: "Spa Packages",
        items: [
          { name: "Standard Package", price: "R570", cents: 57000 },
          { name: "VIP Package", price: "R670", cents: 67000 },
          { name: "BFF Package", price: "R1,040", cents: 104000 },
          { name: "Sisterly Love", price: "R1,240", cents: 124000 },
          { name: "VVIP Package", price: "R1,520", cents: 152000 },
          { name: "Parent & Me Pamper Day", price: "R1,250", cents: 125000 },
        ],
      },
      {
        name: "Individual Treatments",
        items: [
          { name: "Full body massage", price: "R520", cents: 52000 },
          { name: "Foot massage", price: "R200", cents: 20000 },
          { name: "Facial", price: "R180", cents: 18000 },
          { name: "Nail polish", price: "R120", cents: 12000 },
          { name: "Gelish nails", price: "R200", cents: 20000 },
        ],
      },
      {
        name: "Hydro Sessions (30 min)",
        items: [
          { name: "Single Session", price: "R525", cents: 52500 },
          { name: "4 Session Package", price: "R1,850", cents: 185000 },
          { name: "6 Session Package", price: "R2,700", cents: 270000 },
          { name: "8 Session Package", price: "R3,440", cents: 344000 },
          { name: "10 Session Package", price: "R4,100", cents: 410000 },
          { name: "12 Session Package", price: "R4,680", cents: 468000 },
        ],
      },
    ],
  },
};

/** Flat list of all services that have prices (excludes "coming soon" items) */
export type FlatPricingItem = PricingItem & {
  category: string;
  section: string;
  sectionKey: string;
  brand: Brand;
};

export const allPricedItems: FlatPricingItem[] = Object.entries(pricingData).flatMap(
  ([key, section]) =>
    section.categories.flatMap((cat) =>
      cat.items.map((item) => ({
        ...item,
        category: cat.name,
        section: section.label,
        sectionKey: key,
        brand: section.brand,
      }))
    )
);

export const palmAuraSections = Object.entries(pricingData)
  .filter(([, s]) => s.brand === "palm_aura")
  .map(([key, s]) => ({ key, label: s.label }));

export const smoochieKidsSections = Object.entries(pricingData)
  .filter(([, s]) => s.brand === "smoochie_kids")
  .map(([key, s]) => ({ key, label: s.label }));

export const allSections = Object.entries(pricingData).map(([key, s]) => ({
  key,
  label: s.label,
  brand: s.brand,
}));

/* ============================================
   MOCK-DATA.JS — Curated Editorial Dataset
   Provides high-fidelity editorial fallback stories
   for zero-config previews and quota-exhaustion resilience.
   ============================================ */

const CURATED_EDITORIAL_DATA = [
  // Technology
  {
    id: "curated-tech-01",
    title: "Next-Generation Neural Architecture Sets New Benchmarks for Edge Device Inference",
    description: "Researchers unveil a novel quantized transformer model capable of running multi-modal reasoning tasks locally on mobile silicon with sub-10ms latency and 40% reduced energy consumption.",
    link: "https://techcrunch.com",
    sourceName: "TechCrunch",
    sourceIcon: "https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png",
    pubDate: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    categories: ["technology", "ai"]
  },
  {
    id: "curated-tech-02",
    title: "Global Semiconductor Alliance Announces 2nm Lithography Commercial Production Milestones",
    description: "Major foundries confirm mass production timelines for 2-nanometer gate-all-around architectures, promising significant efficiency gains for upcoming high-performance computing clusters.",
    link: "https://arstechnica.com",
    sourceName: "Ars Technica",
    sourceIcon: null,
    pubDate: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    categories: ["technology", "hardware"]
  },
  {
    id: "curated-tech-03",
    title: "Open Source AI Consortium Launches Verified Watermarking Standard for Generative Media",
    description: "A collaborative coalition of tech leaders publishes an immutable cryptographic provenance framework to trace synthetic audio, video, and text generation across web protocols.",
    link: "https://theverge.com",
    sourceName: "The Verge",
    sourceIcon: null,
    pubDate: new Date(Date.now() - 195 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
    categories: ["technology", "security"]
  },
  {
    id: "curated-tech-04",
    title: "Autonomous Space Craft Systems Complete Lunar Orbit Relocalization Exercise",
    description: "Deep space navigation algorithms successfully orient satellites without Earth-bound telemetry signals, enabling future long-duration deep planetary expeditions.",
    link: "https://wired.com",
    sourceName: "Wired",
    sourceIcon: null,
    pubDate: new Date(Date.now() - 320 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    categories: ["technology", "space"]
  },

  // Business
  {
    id: "curated-biz-01",
    title: "Central Banks Signal Coordinated Liquidity Shift as Global Inflation Moderates",
    description: "Monetary policymakers adjust treasury yields and interest rate guidance following consecutive quarters of price stability across major industrial economies.",
    link: "https://bloomberg.com",
    sourceName: "Bloomberg",
    sourceIcon: null,
    pubDate: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
    categories: ["business", "markets"]
  },
  {
    id: "curated-biz-02",
    title: "Venture Investment in Climate Tech Rebounds With Historic Infrastructure Commitments",
    description: "Over $14 billion deployed across geothermal, battery recycling, and modular nuclear startups in the latest fiscal quarter as clean transition funding accelerates.",
    link: "https://ft.com",
    sourceName: "Financial Times",
    sourceIcon: null,
    pubDate: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    categories: ["business", "energy"]
  },
  {
    id: "curated-biz-03",
    title: "Global Supply Chain Congestion Drops to Pre-Pandemic Lows as Automation Expands",
    description: "Port logistics data indicates record turnaround times driven by predictive dockside container routing and automated electric cargo handling fleets.",
    link: "https://reuters.com",
    sourceName: "Reuters",
    sourceIcon: null,
    pubDate: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    categories: ["business", "logistics"]
  },

  // Science
  {
    id: "curated-sci-01",
    title: "James Webb Space Telescope Identifies Atmospheric Water Vapor on Terrestrial Exoplanet",
    description: "Spectroscopic observations reveal unambiguous biosignature precursors around a quiet M-dwarf star forty light-years away, sparking international scientific analysis.",
    link: "https://nature.com",
    sourceName: "Nature",
    sourceIcon: null,
    pubDate: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
    categories: ["science", "astronomy"]
  },
  {
    id: "curated-sci-02",
    title: "Breakthrough Solid-State Battery Chemistry Triples Volumetric Energy Density",
    description: "Materials researchers demonstrate a ceramic electrolyte composite that survives 2,000 extreme charge cycles with negligible lithium dendrite degradation.",
    link: "https://scientificamerican.com",
    sourceName: "Scientific American",
    sourceIcon: null,
    pubDate: new Date(Date.now() - 290 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80",
    categories: ["science", "physics"]
  },

  // World
  {
    id: "curated-world-01",
    title: "International Summit Reaches Historic Treaty on High Seas Biodiversity Protection",
    description: "Delegates from 190 nations ratify legally binding governance protecting 30 percent of international oceanic territory from unregulated industrial exploitation.",
    link: "https://bbc.com",
    sourceName: "BBC News",
    sourceIcon: null,
    pubDate: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    categories: ["world", "policy"]
  },
  {
    id: "curated-world-02",
    title: "High-Speed Trans-Continental Rail Link Enters Final Phase of Electrification",
    description: "Engineers connect zero-emission electrical corridors across three borders, cutting cross-regional journey times by more than 60 percent.",
    link: "https://theguardian.com",
    sourceName: "The Guardian",
    sourceIcon: null,
    pubDate: new Date(Date.now() - 410 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80",
    categories: ["world", "infrastructure"]
  },

  // Health
  {
    id: "curated-health-01",
    title: "Phase III Trials Validate mRNA Therapeutic Targeting Pancreatic Cancer Recurrence",
    description: "Oncology teams report significant progression-free survival rates in personalized vaccine trials designed using patient-specific neoantigen profiling.",
    link: "https://statnews.com",
    sourceName: "STAT News",
    sourceIcon: null,
    pubDate: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80",
    categories: ["health", "medicine"]
  },

  // Sports
  {
    id: "curated-sports-01",
    title: "World Athletics Adopts Dynamic Biometric Aerodynamic Regulations for Distance Track",
    description: "New technical regulations balance next-generation composite foam footwear advancements with historic athletic competitive baselines.",
    link: "https://espn.com",
    sourceName: "ESPN",
    sourceIcon: null,
    pubDate: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    categories: ["sports"]
  },

  // Entertainment
  {
    id: "curated-ent-01",
    title: "Interactive Virtual Cinema Redefines Audience Participation at Global Film Festival",
    description: "Spatial audio and neural rendering technologies deliver personalized multi-angle storytelling experiences hailed as a milestone for narrative cinema.",
    link: "https://hollywoodreporter.com",
    sourceName: "Hollywood Reporter",
    sourceIcon: null,
    pubDate: new Date(Date.now() - 350 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    categories: ["entertainment", "arts"]
  }
];

/**
 * Returns filtered curated editorial items matching requested category or search query.
 */
function getCuratedEditorialStories(category = "top", query = "") {
  let list = [...CURATED_EDITORIAL_DATA];

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    return list.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.sourceName.toLowerCase().includes(q) ||
      (item.categories && item.categories.some(c => c.toLowerCase().includes(q)))
    );
  }

  const cat = (category || "top").toLowerCase();
  if (cat === "top" || cat === "all") {
    return list;
  }

  const filtered = list.filter(item => 
    item.categories && item.categories.some(c => c.toLowerCase() === cat)
  );

  return filtered.length > 0 ? filtered : list.slice(0, 8);
}

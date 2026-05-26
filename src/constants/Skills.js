export const SKILL_CATEGORIES = {
  "Hospitality & Tourism": [
    "Guest Relations", "Event Management", "Catering & Banquets", "F&B Services", 
    "Table Setup & Protocol", "Fine Dining", "Mixology & Bartending", "Front Desk Operations",
    "Housekeeping & Room Setup", "Laundry & Valet Services", "Barista Art", "Concierge Services"
  ],
  "Construction & Trades": [
    "Masonry", "Plastering", "Concrete Works", "Bricklaying", "Formwork", "Plumbing & Piping",
    "Electrical Wiring & Installation", "HVAC Maintenance", "Drywall & Painting", 
    "Tile & Marble Setting", "Welding & Metal Fabrication", "Scaffolding Assembly"
  ],
  "Logistics & Warehousing": [
    "Forklift Operations (Licensed)", "Inventory Management & Cataloging", "Order Picking & Packing",
    "Shipment Loading & Dispatch", "Supply Chain Coordination", "Warehouse Safety Protocols",
    "Courier & Heavy Truck Driving"
  ],
  "Agriculture & Harvesting": [
    "Crop Planting & Seeding", "Fruit & Vegetable Picking", "Greenhouse Climate Management",
    "Irrigation System Maintenance", "Farm Machinery Operations", "Animal Care & Husbandry"
  ],
  "Culinary Arts": [
    "Food Prep & Safety (HACCP)", "Line Cooking & Grill", "Pastry & Baking", "Menu Engineering",
    "Kitchen Prep & Sanitation", "International Cuisine"
  ],
  "General Labor & Maintenance": [
    "Facility Deep Cleaning", "Gardening & Landscaping", "Basic Handtool Operations",
    "Heavy Lifting & Relocation", "Waste Management & Recycling"
  ]
};

export const ALL_PRESET_SKILLS = Object.values(SKILL_CATEGORIES).flat();

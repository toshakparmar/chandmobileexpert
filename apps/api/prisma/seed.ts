import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const superAdminPhone = '9999999999';

  // Check if super admin exists
  const existingAdmin = await prisma.user.findUnique({
    where: { phone: superAdminPhone },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    await prisma.user.create({
      data: {
        phone: superAdminPhone,
        email: 'admin@chandmobileexpert.com',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        password: hashedPassword, // For testing, we just hash the OTP as the password
        isPhoneVerified: true,
        isEmailVerified: true,
      },
    });
    console.log('Super Admin seeded successfully.');
  } else {
    console.log('Super Admin already exists.');
  }

  // Seed Categories
  const categoryDefinitions = [
    { name: "Cases & Covers", prefixes: ["Liquid Silicone", "Leather", "Rugged Armor", "Clear", "Magnetic"], suffixes: ["Case", "Cover", "Shell"] },
    { name: "Chargers & Cables", prefixes: ["20W USB-C", "65W GaN", "Braided", "Magnetic", "3-in-1"], suffixes: ["Charger", "Cable", "Power Adapter"] },
    { name: "Screen Protectors", prefixes: ["9H Tempered", "Matte", "Privacy", "Edge-to-Edge", "Anti-Glare"], suffixes: ["Glass", "Protector", "Film"] },
    { name: "Audio", prefixes: ["Wireless", "Noise Cancelling", "Sport", "Bluetooth", "Over-Ear"], suffixes: ["Earbuds", "Headphones", "Headset"] },
    { name: "Power Banks", prefixes: ["10000mAh", "20000mAh", "Magnetic", "Slim", "Solar"], suffixes: ["Power Bank", "Portable Charger", "Battery Pack"] },
    { name: "Smartwatches", prefixes: ["GPS", "Cellular", "Fitness", "Pro", "Active"], suffixes: ["Smartwatch", "Band", "Tracker"] },
    { name: "Phone Mounts", prefixes: ["Dashboard", "Vent", "Magnetic", "Bike", "Wireless Charging"], suffixes: ["Mount", "Holder", "Stand"] },
    { name: "Photography", prefixes: ["Macro", "Wide-Angle", "Telephoto", "3-in-1", "Professional"], suffixes: ["Lens Kit", "Clip-on Lens", "Filter"] },
    { name: "Gaming", prefixes: ["Mobile", "Bluetooth", "Cooling", "Ergonomic", "Trigger"], suffixes: ["Controller", "Gamepad", "Pad"] },
    { name: "Storage", prefixes: ["64GB", "128GB", "256GB", "High-Speed", "Extreme"], suffixes: ["MicroSD", "Flash Drive", "Memory Card"] },
    { name: "Keyboards & Mice", prefixes: ["Foldable", "Bluetooth", "Silent", "Ergonomic", "Mini"], suffixes: ["Keyboard", "Mouse", "Combo"] },
    { name: "Tripods & Gimbals", prefixes: ["3-Axis", "Flexible", "Extendable", "Compact", "Heavy-Duty"], suffixes: ["Gimbal", "Tripod", "Stabilizer"] },
    { name: "Bluetooth Speakers", prefixes: ["Waterproof", "Mini", "Bass", "Portable", "Party"], suffixes: ["Speaker", "Soundbar", "Boombox"] },
    { name: "VR Headsets", prefixes: ["Mobile", "3D", "Immersive", "Foldable", "Pro"], suffixes: ["VR Headset", "Goggles", "Glasses"] },
    { name: "Stylus Pens", prefixes: ["Active", "Magnetic", "Universal", "Precision", "Rechargeable"], suffixes: ["Stylus", "Pen", "Pencil"] },
    { name: "Cleaning Kits", prefixes: ["Microfiber", "Anti-Bacterial", "Screen", "Airpod", "Complete"], suffixes: ["Cleaning Kit", "Wipes", "Brush"] },
    { name: "Ring Lights", prefixes: ["10-inch", "Desktop", "RGB", "Selfie", "Dimmable"], suffixes: ["Ring Light", "LED Panel", "Stand"] },
    { name: "Docks & Hubs", prefixes: ["7-in-1", "USB-C", "Aluminum", "Thunderbolt", "Magnetic"], suffixes: ["Hub", "Dock", "Docking Station"] },
    { name: "Smart Tags", prefixes: ["Bluetooth", "Waterproof", "Anti-Lost", "Compact", "Pro"], suffixes: ["Tracker", "Tag", "Finder"] },
    { name: "Wearable Tech", prefixes: ["Smart", "Fitness", "Health", "Sleep", "Active"], suffixes: ["Ring", "Band", "Monitor"] },
  ];
  
  const categories: any[] = [];

  const techImages = [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&q=80",
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80",
    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80",
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80",
    "https://images.unsplash.com/photo-1585862705497-b8c116b47209?w=500&q=80",
    "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&q=80",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80"
  ];

  for (let i = 0; i < categoryDefinitions.length; i++) {
    const catData = categoryDefinitions[i];
    const slug = catData.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
    const icon = techImages[i % techImages.length];

    const existingCat = await prisma.category.findUnique({
      where: { slug },
    });
    
    if (!existingCat) {
      const cat = await prisma.category.create({
        data: {
          name: catData.name,
          slug,
          description: `Premium ${catData.name} for your devices.`,
          icon,
          isActive: true,
        }
      });
      categories.push(cat);
      console.log(`Created category: ${catData.name}`);
    } else {
      categories.push(existingCat);
    }
  }

  // Seed Products dynamically
  if (categories.length >= 20) {
    const productsToSeed: any[] = [];
    let productCounter = 1;
    
    for (let i = 0; i < categoryDefinitions.length; i++) {
      const catDef = categoryDefinitions[i];
      const dbCat = categories[i];
      
      // Create 5 products per category
      for (let j = 0; j < 5; j++) {
        const prefix = catDef.prefixes[Math.floor(Math.random() * catDef.prefixes.length)];
        const suffix = catDef.suffixes[Math.floor(Math.random() * catDef.suffixes.length)];
        const brands = ["Apple", "Samsung", "Pro", "Ultra", "Max"];
        const brand = brands[Math.floor(Math.random() * brands.length)];
        
        const price = Math.floor(Math.random() * 4000) + 299;
        
        productsToSeed.push({
          name: `${brand} ${prefix} ${suffix}`,
          description: `Premium high-quality ${catDef.name.toLowerCase()} featuring ${prefix.toLowerCase()} technology.`,
          price: price,
          stockCount: Math.floor(Math.random() * 200) + 10,
          image: techImages[productCounter % techImages.length],
          categoryId: dbCat.id,
        });
        productCounter++;
      }
    }

    for (const prod of productsToSeed) {
      const slug = prod.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
      const existingProd = await prisma.product.findUnique({
        where: { slug },
      });

      if (!existingProd) {
        await prisma.product.create({
          data: {
            ...prod,
            slug,
            isActive: true,
          }
        });
        console.log(`Created product: ${prod.name}`);
      }
    }
  }

  // Remove previous team members and store the actual user-specified team
  await prisma.teamMember.deleteMany({});
  console.log("Cleared all previous team members from database.");

  const teamMembersToSeed = [
    {
      name: "Founder",
      role: "Founder",
      bio: "With over 15 years of experience, founded the company to bring quality repairs to Chandigarh.",
      image: "/team/founder.jpg",
      isActive: true,
    },
    {
      name: "CEO",
      role: "CEO",
      bio: "Driving the vision and expansion of Chand Mobile Expert to reach new heights.",
      image: "/team/ceo.jpg",
      isActive: true,
    },
    {
      name: "Operation Director",
      role: "Operation Director",
      bio: "Ensures every device goes through our rigorous quality checks swiftly and securely.",
      image: "/team/operations.jpg",
      isActive: true,
    },
    {
      name: "Technician",
      role: "Senior Technician",
      bio: "Specializes in complex micro-soldering and intricate board-level diagnostics.",
      image: "/team/technician1.jpg",
      isActive: true,
    },
    {
      name: "Technician",
      role: "Technician",
      bio: "Expert at rapid, flawless screen and battery replacements for all flagship devices.",
      image: "/team/technician2.jpg",
      isActive: true,
    },
  ];

  for (const member of teamMembersToSeed) {
    await prisma.teamMember.create({ data: member });
    console.log(`Created team member: ${member.role} (${member.name})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

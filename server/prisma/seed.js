const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EventFlow Database Seeding...');

  // Clean old data using standard SQL delete
  await prisma.user.deleteMany();
  await prisma.eventCategory.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.event.deleteMany();
  await prisma.coupon.deleteMany();

  // 1. Password Hashing
  const passwordHash = await bcrypt.hash('Password123!', 12);

  // 2. Create Users (Admin, Organizers, Attendees)
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@eventflow.com',
      passwordHash,
      role: 'ADMIN',
      isVerified: true
    }
  });

  const organizer1 = await prisma.user.create({
    data: {
      name: 'Satyam Shrivastav',
      email: 'organizer@eventflow.com',
      passwordHash,
      role: 'ORGANIZER',
      isVerified: true,
      organizerProfile: {
        create: {
          organization: 'Apex Tech Innovations',
          bio: 'Host of premier developer conferences and AI hackathons worldwide.',
          isVerified: true
        }
      }
    }
  });

  const organizer2 = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena@concerts.com',
      passwordHash,
      role: 'ORGANIZER',
      isVerified: true,
      organizerProfile: {
        create: {
          organization: 'Global Sound & Music Live',
          bio: 'Curating world-class musical tours and cultural festivals.',
          isVerified: true
        }
      }
    }
  });

  const attendee1 = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      passwordHash,
      role: 'ATTENDEE',
      isVerified: true
    }
  });

  const attendee2 = await prisma.user.create({
    data: {
      name: 'Sophia Chen',
      email: 'sophia@yahoo.com',
      passwordHash,
      role: 'ATTENDEE',
      isVerified: true
    }
  });

  console.log('✅ Created Users & Organizer Profiles');

  // 3. Create Event Categories
  const categories = await Promise.all([
    prisma.eventCategory.create({ data: { name: 'Technology', slug: 'technology', description: 'AI, Cloud, Software Architecture & Startups' } }),
    prisma.eventCategory.create({ data: { name: 'Music & Concerts', slug: 'music', description: 'Live Bands, Electronic, Rock & Symphonies' } }),
    prisma.eventCategory.create({ data: { name: 'Business & Networking', slug: 'business', description: 'VC Pitching, Entrepreneurship & Leadership' } }),
    prisma.eventCategory.create({ data: { name: 'Workshops & Design', slug: 'workshops', description: 'UI/UX Design, Creative Writing & Photography' } }),
    prisma.eventCategory.create({ data: { name: 'Gaming & Esports', slug: 'gaming', description: 'Esports Tournaments, VR & Indie Game Dev' } })
  ]);

  const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]));
  console.log('✅ Created Event Categories');

  // 4. Create Venues
  const venue1 = await prisma.venue.create({
    data: {
      name: 'HITEX Exhibition Center',
      address: 'Trade Fair Office Building, IZZAT Nagar',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      latitude: 17.4705,
      longitude: 78.3740
    }
  });

  const venue2 = await prisma.venue.create({
    data: {
      name: 'Jawaharlal Nehru Indoor Stadium',
      address: 'Periamet',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      latitude: 13.0827,
      longitude: 80.2707
    }
  });

  const venue3 = await prisma.venue.create({
    data: {
      name: 'Bangalore International Exhibition Centre',
      address: '10th Mile, Tumkur Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      latitude: 13.0645,
      longitude: 77.4725
    }
  });

  console.log('✅ Created Venues');

  // 5. Create Realistic Events with Ticket Tiers, Speakers, Schedule & FAQs
  const event1 = await prisma.event.create({
    data: {
      title: 'AI & Generative Tech Summit 2026',
      slug: 'ai-generative-tech-summit-2026',
      description: 'The largest artificial intelligence conference featuring global keynote speakers from OpenAI, Google DeepMind, and Anthropic. Join over 2,000 developers, researchers, and founders for groundbreaking demos.',
      shortDescription: 'The premier AI & LLM conference in Asia.',
      bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
      status: 'PUBLISHED',
      eventType: 'HYBRID',
      startDate: new Date('2026-09-15T09:00:00Z'),
      endDate: new Date('2026-09-16T18:00:00Z'),
      startTime: '09:00 AM',
      endTime: '06:00 PM',
      capacity: 1500,
      remainingCapacity: 1500,
      refundPolicyDays: 7,
      refundPolicyPercent: 100,
      contactEmail: 'contact@apextech.io',
      isFeatured: true,
      organizerId: organizer1.id,
      categoryId: catMap['technology'],
      venueId: venue1.id,
      ticketTypes: {
        create: [
          { name: 'Early Bird Pass', description: 'Full 2-day access + Swag Kit', price: 499, quantity: 200, availableQty: 200, saleStart: new Date('2026-08-01'), saleEnd: new Date('2026-09-01') },
          { name: 'Regular Developer Ticket', description: 'Standard admission', price: 999, quantity: 1000, availableQty: 1000, saleStart: new Date('2026-08-01'), saleEnd: new Date('2026-09-15') },
          { name: 'VIP Executive Lounge', description: 'Front-row seating & VIP Speaker dinner access', price: 2999, quantity: 100, availableQty: 100, saleStart: new Date('2026-08-01'), saleEnd: new Date('2026-09-15') }
        ]
      },
      schedule: {
        create: [
          { startTime: '09:30 AM', endTime: '10:30 AM', title: 'Keynote: The Future of Autonomous Agents', speakerName: 'Dr. Aris Thorne' },
          { startTime: '11:00 AM', endTime: '01:00 PM', title: 'Hands-on Building with Multimodal Vision Transformers', speakerName: 'Sarah Jenkins' }
        ]
      },
      faqs: {
        create: [
          { question: 'Is laptop required for workshops?', answer: 'Yes, please bring your laptop with Node.js and Python 3.10+ installed.' },
          { question: 'Are meals provided?', answer: 'Buffet lunch and coffee passes are included for all ticket holders.' }
        ]
      }
    }
  });

  const event2 = await prisma.event.create({
    data: {
      title: 'Neon Nights — Electronic Symphony Concert',
      slug: 'neon-nights-electronic-symphony-2026',
      description: 'An unforgettable night of synthwave, orchestral brass, and laser projections featuring legendary synth artists and 50 live musicians on stage.',
      shortDescription: 'Live synthwave and orchestral laser symphony live.',
      bannerImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
      status: 'PUBLISHED',
      eventType: 'OFFLINE',
      startDate: new Date('2026-10-10T18:00:00Z'),
      endDate: new Date('2026-10-10T23:00:00Z'),
      startTime: '06:00 PM',
      endTime: '11:00 PM',
      capacity: 3000,
      remainingCapacity: 3000,
      refundPolicyDays: 3,
      refundPolicyPercent: 50,
      contactEmail: 'tickets@globalsound.com',
      isFeatured: true,
      organizerId: organizer2.id,
      categoryId: catMap['music'],
      venueId: venue2.id,
      ticketTypes: {
        create: [
          { name: 'General Admission Floor', description: 'Standing area near stage', price: 799, quantity: 2000, availableQty: 2000, saleStart: new Date('2026-08-01'), saleEnd: new Date('2026-10-10') },
          { name: 'VIP Seated Balcony', description: 'Elevated seating with private bar access', price: 1999, quantity: 500, availableQty: 500, saleStart: new Date('2026-08-01'), saleEnd: new Date('2026-10-10') }
        ]
      }
    }
  });

  const event3 = await prisma.event.create({
    data: {
      title: 'SaaS Founder & Angel Investor Summit',
      slug: 'saas-founder-angel-investor-summit-2026',
      description: 'Connect directly with over 50 VC firms, angel investors, and successful B2B SaaS founders. Pitch competitions, deal rooms, and live valuation teardowns.',
      shortDescription: 'Pitch your startup and network with top VCs.',
      bannerImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200',
      status: 'PUBLISHED',
      eventType: 'OFFLINE',
      startDate: new Date('2026-11-05T09:00:00Z'),
      endDate: new Date('2026-11-05T17:00:00Z'),
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      capacity: 800,
      remainingCapacity: 800,
      refundPolicyDays: 14,
      refundPolicyPercent: 100,
      contactEmail: 'invest@apextech.io',
      isFeatured: false,
      organizerId: organizer1.id,
      categoryId: catMap['business'],
      venueId: venue3.id,
      ticketTypes: {
        create: [
          { name: 'Founder Pass', description: 'Access to pitch stage and 1-on-1 VC meetings', price: 1499, quantity: 500, availableQty: 500, saleStart: new Date('2026-08-01'), saleEnd: new Date('2026-11-05') }
        ]
      }
    }
  });

  // 6. Create Coupons
  await prisma.coupon.create({
    data: {
      code: 'WELCOME20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minimumAmount: 499,
      maximumDiscount: 500,
      usageLimit: 500,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2026-12-31')
    }
  });

  await prisma.coupon.create({
    data: {
      code: 'FLAT200',
      discountType: 'FIXED_AMOUNT',
      discountValue: 200,
      minimumAmount: 999,
      usageLimit: 200,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2026-12-31')
    }
  });

  console.log('✅ Seeded Events, Ticket Tiers & Coupons');
  console.log('🚀 EventFlow Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

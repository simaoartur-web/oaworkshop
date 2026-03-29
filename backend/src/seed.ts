import { getPayload } from 'payload'
import configPromise from './payload.config'

const seed = async () => {
  const payload = await getPayload({ config: configPromise })

  console.log('Seeding data...')

  // 1. Create Admin User
  const adminExists = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: 'admin@oa.com',
      },
    },
  })

  if (adminExists.docs.length === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@oa.com',
        password: 'adminpassword123',
        roles: ['admin'],
      },
    })
    console.log('Admin user created.')
  }

  // 2. Create Disciplines
  const disciplinesData = [
    {
      name: 'Architecture',
      slug: 'architecture',
      intro: 'Excellence in sustainable design and innovative technical implementation across global scales.',
      themeColor: '#C45532',
      displayOrder: 1,
    },
    {
      name: 'Urban Planning',
      slug: 'urban-planning',
      intro: 'Research-driven planning solutions for the resilient cities and communities of tomorrow.',
      themeColor: '#4A5568',
      displayOrder: 2,
    },
    {
      name: 'Research',
      slug: 'research',
      intro: 'Pushing boundaries in material science and sustainable construction methodologies.',
      themeColor: '#2D3748',
      displayOrder: 3,
    },
  ]

  const createdDisciplines: any = {}

  for (const disc of disciplinesData) {
    const existing = await payload.find({
      collection: 'disciplines',
      where: { slug: { equals: disc.slug } },
    })

    if (existing.docs.length === 0) {
      const doc = await payload.create({
        collection: 'disciplines',
        data: disc,
      })
      createdDisciplines[disc.slug] = doc.id
      console.log(`Discipline created: ${disc.name}`)
    } else {
      createdDisciplines[disc.slug] = existing.docs[0].id
    }
  }

  // 3. Create Stats
  await payload.updateGlobal({
    slug: 'stats',
    data: {
      items: [
        { label: 'Projects Completed', value: 50, suffix: '+' },
        { label: 'Years of Combined Experience', value: 20, suffix: '+' },
        { label: 'Countries Worked In', value: 10, suffix: '+' },
      ],
    },
  })
  console.log('Stats seeded.')

  // 4. Create Site Settings & Navigation
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      studioName: 'O+A Architecture and Planners',
      contactEmail: 'info@oaplanners.com',
      address: 'Maputo, Mozambique\nMilan, Italy',
    },
  })

  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      menuItems: [
        { label: 'Home', link: '/' },
        { label: 'Architecture', link: '#architecture' },
        { label: 'Urban Planning', link: '#urbanism' },
        { label: 'Research', link: '#research' },
        { label: 'Workshops', link: '#workshop' },
        { label: 'Team', link: '#team' },
      ],
    },
  })
  console.log('Settings and Navigation seeded.')

  // 5. Create Team Members
  const teamData = [
    { fullName: 'Osvaldo Luís', role: 'Architect and Planner, MSc in Regional and Urban Planning', bio: 'Architect & Urban Planner with experience in UN-Habitat and Milan.' },
    { fullName: 'Artur Tomás', role: 'Architect and Planner, MSc in Regional and Urban Planning', bio: 'Architect & Urban Planner, specialized in regional development.' },
  ]

  const createdTeam: any[] = []
  for (const member of teamData) {
    const existing = await payload.find({
      collection: 'team-members',
      where: { fullName: { equals: member.fullName } },
    })

    if (existing.docs.length === 0) {
      // Create a dummy media for portrait since we don't have the file locally for seeding
      let media;
      try {
        media = await payload.create({
          collection: 'media',
          data: { 
            alt: member.fullName,
          },
          file: {
            data: Buffer.from(''),
            name: `${member.fullName.toLowerCase().replace(/ /g, '-')}.png`,
            mimetype: 'image/png',
            size: 0,
          }
        })
      } catch (err: any) {
        console.error(`Failed to create media for ${member.fullName}:`, JSON.stringify(err.data || err, null, 2))
        continue;
      }
      const doc = await payload.create({
        collection: 'team-members',
        data: {
          ...member,
          portraitImage: media.id,
          activeStatus: true,
        },
      })
      createdTeam.push(doc)
      console.log(`Team member created: ${member.fullName}`)
    } else {
      createdTeam.push(existing.docs[0])
    }
  }

  // 6. Create Projects (A few samples)
  const projectsData = [
    {
      title: 'Milan Cultural Hub',
      project_year: 2025,
      location: 'Milan, Italy',
      discipline: createdDisciplines['architecture'],
      latitude: 45.4642,
      longitude: 9.1900,
      short_description: 'A state-of-the-art facility designed to foster creativity and community engagement.',
    },
    {
      title: 'Singapore Green Corridor',
      project_year: 2026,
      location: 'Singapore',
      discipline: createdDisciplines['urban-planning'],
      latitude: 1.3521,
      longitude: 103.8198,
      short_description: 'A comprehensive urban strategy to transform disused rail corridors into a continuous park system.',
    },
    {
      title: 'Modular WASH Hub',
      project_year: 2024,
      location: 'Beira, Mozambique',
      discipline: createdDisciplines['research'],
      latitude: -19.8436,
      longitude: 34.8389,
      short_description: 'Rapidly deployable sanitation modules designed for low-resource environments.',
    },
  ]

  for (const proj of projectsData) {
    try {
      const existing = await payload.find({
        collection: 'projects',
        where: { title: { equals: proj.title } },
      })

      if (existing.docs.length === 0) {
        console.log(`Creating media for project: ${proj.title}...`)
        const media = await payload.create({
          collection: 'media',
          data: { alt: proj.title },
          file: {
            data: Buffer.from(''),
            name: `${proj.title.toLowerCase().replace(/ /g, '-')}.png`,
            mimetype: 'image/png',
            size: 0,
          }
        })
        
        console.log(`Creating project: ${proj.title} with media ID: ${media.id}...`)
        if (!proj.discipline) {
            console.error(`ERROR: Discipline not found for project ${proj.title}`)
            continue
        }

        await payload.create({
          collection: 'projects',
          data: {
            ...proj,
            slug: proj.title.toLowerCase().replace(/ /g, '-'),
            featured_image: media.id,
            _status: 'published',
            geolocation: {
              latitude: proj.latitude,
              longitude: proj.longitude,
              show_on_map: true,
            }
          },
          draft: false,
        })
        console.log(`Project created successfully: ${proj.title}`)
      }
    } catch (err: any) {
      console.error(`Failed to create project ${proj.title}:`, JSON.stringify(err.data || err, null, 2))
    }
  }

  console.log('Seeding complete.')
  process.exit(0)
}

seed().catch(err => {
    console.error('Seed failed critically:', err)
    process.exit(1)
})

import type { PortfolioData } from './types'

export const portfolioData: PortfolioData = {
  name: 'Casey Franceschy',
  title: 'Software Developer',
  introduction:
    'Developer building practical tools, APIs, and experiments—at work and for fun. Interested in teams that enjoy solving meaningful problems and learning together.',
  avatarUrl: '/assets/my-memoji.png',
  resumeUrl: '/assets/Casey_Franceschy.pdf',
  navItems: [
    { label: 'About', href: '#about' },
    { label: 'Experience', href: '#experience' },
    { label: 'Projects', href: '#projects' },
    { label: 'Contact', href: '#contact' },
  ],
  contacts: [
    { label: 'Email', href: 'mailto:casey.franceschy@gmail.com' },
    { label: 'GitHub', href: 'https://github.com/CaseyTea' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/casey-franceschy-694823124/' },
  ],
  metrics: [
    { value: '10,000+', label: 'employees and students served' },
    { value: '50%', label: 'faster bug triage' },
    { value: 'Top 5%', label: 'support staff ranking' },
  ],
  experience: [
    {
      id: 'analyst-programmer',
      title: 'Analyst 1: Programmer (Part-Time)',
      organization: 'Irvine Unified School District',
      dates: 'July 2024 – Present',
      summary: 'Built a centralized username generation system for 10,000+ employees and students.',
      highlights: [
        'Developed a modular .NET 8 Minimal API with database storage to prevent username collisions.',
        'Replaced legacy SQL and Bash migration scripts with code-first Entity Framework migrations.',
        'Automated build, publish, and IIS deployment workflows with Azure DevOps.',
        'Contributed username management and data validation capabilities to MyPortal HR workflows.',
      ],
      technologies: ['.NET 8', 'Minimal APIs', 'Entity Framework', 'SQL', 'Azure DevOps', 'IIS'],
    },
    {
      id: 'technical-specialist',
      title: 'Technical Specialist III',
      organization: 'Irvine Unified School District',
      dates: 'May 2023 – Present',
      summary: 'Ranked in the Top 5% of support staff through Zendesk metrics.',
      highlights: [
        'Delivered 100% customer satisfaction with response and resolution times 30% faster than team averages.',
        'Provided advanced support for district-wide hardware, software, and education technology across 50+ schools and offices.',
      ],
      technologies: ['IT Support', 'Zendesk', 'Education Technology'],
    },
    {
      id: 'quality-engineer-intern',
      title: 'Quality Engineer (Intern)',
      organization: 'Apple',
      dates: 'January 2022 – July 2022',
      summary: 'Cut bug triage time by 50% by optimizing log-parsing scripts.',
      highlights: [
        'Managed 9,000+ tickets during a six-month internship.',
        'Overhauled internal documentation to streamline triage for staff and new interns.',
        'Collaborated across teams to route tickets and improve workflow efficiency.',
      ],
      technologies: ['Log Analysis', 'Bug Triage', 'Technical Documentation'],
    },
  ],
  skillGroups: [
    {
      title: 'Application development',
      skills: ['.NET 8', 'C#', 'Blazor Server', 'Entity Framework', 'Python'],
    },
    {
      title: 'Data and APIs',
      skills: ['SQL', 'Minimal APIs', 'REST APIs'],
    },
    {
      title: 'Cloud and delivery',
      skills: ['Azure', 'AWS', 'Azure DevOps', 'CI/CD', 'IIS'],
    },
  ],
  projects: [
    {
      id: 'username-generator-api',
      name: 'Username Generator API',
      kind: 'professional',
      outcome: 'Provides collision-free usernames for new employees and students.',
      context: 'Modernized a legacy SQL-based username-generation process for Irvine Unified School District.',
      contribution:
        'Built the .NET Minimal API, extended it with support endpoints, and integrated it with HR and internal IT tools.',
      technologies: ['.NET', 'Minimal APIs', 'SQL', 'Entity Framework'],
      image: '/assets/projects/project-usernamegen.png',
    },
    {
      id: 'guess-that-ascii-mon',
      name: 'GuessThatAsciiMon',
      kind: 'side-project',
      outcome: 'A playable retro terminal-style Pokémon guessing game.',
      context: 'Fetches random Pokémon, converts sprites to ASCII art in real time, and gives players type and weight hints.',
      contribution: 'Created the Blazor Server game to practice working with external APIs while building a fun experiment.',
      technologies: ['Blazor Server', 'PokeAPI', 'API Integration'],
      image: '/assets/projects/ascii-ball.jpg',
      demoUrl: 'https://guessthatasciimon-hgdfeafdhqdddef0.canadacentral-01.azurewebsites.net/',
    },
    {
      id: 'mockbot',
      name: 'MockBot',
      kind: 'side-project',
      outcome: 'Turns a running joke into a Discord bot.',
      context: 'Created during a code jam to automate alternating-case text instead of typing it manually.',
      contribution: 'Built the bot as a lightweight, humorous community tool.',
      technologies: ['Python', 'Discord API'],
      image: '/assets/projects/project-mockbot.png',
      sourceUrl: 'https://github.com/CaseyTea/Mockbot',
    },
  ],
}

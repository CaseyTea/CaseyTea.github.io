import type { PortfolioData } from './types'

export const portfolioData: PortfolioData = {
  name: 'Casey Franceschy',
  title: 'Software Developer',
  introduction:
    'Developer building practical tools, APIs, and experiments—at work and for fun. Interested in teams that enjoy solving meaningful problems and learning together.',
  about: [
    'I’m Casey. Outside of work, I build and mod mechanical keyboards, spend plenty of time in Neovim using Vim motions, and get together with friends for code jams.',
    'I have a soft spot for frogs and for learning through playful projects—the kind of small, curious builds that make a new API or tool click. That same curiosity follows me into professional work: understand the real problem, keep the solution practical, and leave the system better than I found it.',
  ],
  availability:
    'I’m interested in software teams that care about useful systems, clear collaboration, and learning while they build.',
  resumeUrl: '/assets/Casey_Franceschy.pdf',
  location: 'Westminster, California',
  commandSections: [
    {
      id: 'overview',
      label: 'Go to overview',
      keywords: ['home', 'introduction', 'intro'],
    },
    {
      id: 'experience',
      label: 'Go to experience',
      keywords: ['work', 'career', 'history'],
    },
    {
      id: 'projects',
      label: 'Go to projects',
      keywords: ['portfolio', 'work', 'case studies'],
    },
    {
      id: 'skills',
      label: 'Go to skills',
      keywords: ['technology', 'tools', 'stack'],
    },
    {
      id: 'about',
      label: 'Go to about',
      keywords: ['bio', 'personal', 'neovim'],
    },
    {
      id: 'contact',
      label: 'Go to contact',
      keywords: ['email', 'connect', 'hire'],
    },
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
      engineeringNotes: [
        'Modernized a legacy SQL-based username-generation process.',
        'Built a .NET Minimal API with support endpoints for HR and internal IT tools.',
      ],
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
      engineeringNotes: [
        'Fetches random Pokémon and converts sprites to ASCII art in real time.',
        'Provides players with type and weight hints.',
      ],
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
      engineeringNotes: [
        'Created during a code jam to automate alternating-case text.',
        'Built as a lightweight Discord community tool with Python.',
      ],
      technologies: ['Python', 'Discord API'],
      image: '/assets/projects/project-mockbot.png',
      sourceUrl: 'https://github.com/CaseyTea/Mockbot',
    },
  ],
}

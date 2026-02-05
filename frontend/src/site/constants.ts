import { NavItem, ResearchPaper, TeamMember } from './types';

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'About',
    path: '/about',
    subItems: [
      { label: 'Mission & Overview', path: '/about' },
      { label: 'Our Team', path: '/about/team' },
      { label: 'Contact', path: '/about/contact' },
    ]
  },
  {
    label: 'Data Dashboard',
    path: '/dashboard',
    subItems: [
      { label: 'Census (ACS Demographics)', path: '/dashboard/census' },
      { label: 'Government Spending', path: '/dashboard/government-spending' },
      { label: 'Government Finances', path: '/dashboard/government-finances' },
      { label: 'FINRA Financial Literacy', path: '/dashboard/finra-financial-literacy' },
      { label: 'Fund Flow', path: '/dashboard/fund-flow' },
      { label: 'Federal Spending Breaks', path: '/dashboard/federal-spending-breaks' },
    ]
  },
  {
    label: 'Research',
    path: '/research',
    subItems: [
      {
        label: 'Earned Wage Access',
        path: '/research/earned-wage-access',
        description: 'Empirical analysis of EWA product availability and neighborhood characteristics',
        dataLink: '/data/maryland/finra'
      },
      {
        label: 'Federal Spending in Maryland',
        path: '/research/federal-spending',
        description: 'Direct and indirect effects through primary contracts and subcontracting linkages',
        dataLink: '/dashboard/federal-spending-breaks'
      },
      {
        label: 'Government Shutdown Cost',
        path: '/research/shutdown-cost',
        description: 'Economic cost of 2025 shutdown through employment, contracts, and federal spending',
        dataLink: '/data/maryland/employment'
      },
      {
        label: 'Maryland Business Climate Survey 2025',
        path: '/projects/business-survey',
        description: 'Maryland businesses report rising costs and relocation concerns'
      },
      {
        label: 'The Effects of EWA Programs',
        path: '/projects/ewa',
        description: 'Impact of EWA products on financial stability'
      },
      {
        label: 'Interactive Dashboard',
        path: '/dashboard/fund-flow',
        description: 'Tracking Federal Contracts and Subcontracts'
      },
    ]
  },
  {
    label: 'Projects',
    path: '/projects',
    subItems: [
      { label: 'Earned Wage Access', path: '/projects/ewa', partner: 'Dept. of Labor' },
      { label: 'Federal Spending in Maryland', path: '/projects/fed-spending', partner: "Comptroller's Office" },
      { label: 'MD Business Climate Survey 2025', path: '/projects/business-survey' },
      { label: 'State of Residence Choice of Veterans', path: '/projects/veterans-housing', partner: 'Veterans Affairs' },
    ]
  },
  {
    label: 'UMD Smith Home',
    path: 'https://mop.rhsmith.umd.edu/',
    subItems: undefined
  }
];

export const RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: 'ewa-001',
    title: 'Earned Wage Access: Financial Stability or Debt Trap?',
    abstract: 'An empirical analysis of where Earned Wage Access (EWA) products are offered and how their availability relates to neighborhood characteristics and financial literacy.',
    date: 'October 2023',
    authors: [],
    category: 'Earned Wage Access',
    dataLink: '/data/maryland/finra'
  },
  {
    id: 'fed-002',
    title: 'Federal Spending in Maryland',
    abstract: 'An analysis of the direct and indirect effects of federal spending through primary contracts and subcontracting linkages.',
    date: 'January 2024',
    authors: [],
    category: 'Federal Spending',
    dataLink: '/dashboard/federal-spending-breaks'
  },
  {
    id: 'shutdown-003',
    title: "What's the Cost of a Government Shutdown to Maryland?",
    abstract: 'An estimation of the economic cost of the 2025 government shutdown to Maryland through its effects on employment, federal contracts, and other forms of federal spending.',
    date: 'March 2024',
    authors: [],
    category: 'Government Shutdown',
    dataLink: '/data/maryland/employment'
  },
  {
    id: 'business-2025',
    title: 'Maryland Business Climate Survey 2025',
    abstract: 'Maryland businesses report rising costs, federal policy disruptions, and growing relocation concerns.',
    date: 'February 2025',
    authors: [],
    category: 'Business Research',
    dataLink: '/projects/business-survey'
  },
  {
    id: 'ewa-consumers',
    title: 'The Effects of Earned Wage Access Programs on Maryland Consumers',
    abstract: 'Explore the impact of EWA products on financial stability and consumer behavior across Maryland neighborhoods.',
    date: 'March 2025',
    authors: [],
    category: 'Financial Inclusion',
    dataLink: '/projects/ewa'
  },
  {
    id: 'fed-dashboard',
    title: 'Interactive Dashboard: Tracking Federal Contracts and Subcontracts',
    abstract: 'Analyze the flow of federal contracts through primary and subcontracting linkages across the state.',
    date: 'January 2025',
    authors: [],
    category: 'Data Tool',
    dataLink: '/dashboard/fund-flow'
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'liu-yang',
    name: 'Professor Liu Yang',
    role: 'Faculty Advisor',
    bio: 'Professor Liu Yang plays a key role in the Maryland Opportunity Project, bringing expertise in data analysis, economic policy, and applied research to support the project’s efforts to inform decision-making with rigorous economic evidence.',
    imageUrl: '/assets/YangLiu_updated.jpg',
    profileUrl: 'https://www.rhsmith.umd.edu/directory/liu-yang'
  },
  {
    id: 'vojislav-maksimovic',
    name: 'Professor Vojislav Maksimovic',
    role: 'Faculty Advisor',
    bio: 'Professor Vojislav Maksimovic plays a key role in the Maryland Opportunity Project, bringing expertise in data analysis, economic policy, and applied research to support the project’s efforts to inform decision-making with rigorous economic evidence.',
    imageUrl: '/assets/maksimovic-vojislav-2018.avif',
    profileUrl: 'https://www.rhsmith.umd.edu/directory/vojislav-maksimovic'
  },
  {
    id: 'kislaya-prasad',
    name: 'Professor Kislaya Prasad',
    role: 'Faculty Advisor',
    bio: 'Professor Kislaya Prasad plays a key role in the Maryland Opportunity Project, bringing expertise in data analysis, economic policy, and applied research to support the project’s efforts to inform decision-making with rigorous economic evidence.',
    imageUrl: '/assets/kislaya_prasad_updated.jpg',
    profileUrl: 'https://www.rhsmith.umd.edu/directory/kislaya-prasad'
  },
  {
    id: 'haotian-shi',
    name: 'Haotian Shi',
    role: 'Research Fellow',
    bio: 'Haotian Shi is a graduate research fellow with the Maryland Opportunity Project, working on quantitative analysis and empirical studies that contribute to the project’s policy-focused research.',
    imageUrl: '/assets/HaotianShi.jpg',
  },
  {
    id: 'premal-shah',
    name: 'Premal Shah',
    role: 'Developer',
    bio: 'Premal supports the Maryland Opportunity Project as its website developer, designing and maintaining the project’s digital platform to ensure clarity, accessibility, and effective communication of research findings.',
    imageUrl: '/assets/PremalParagbhaiShah.jpeg',
    profileUrl: 'https://shahpremal.com'
  }
];

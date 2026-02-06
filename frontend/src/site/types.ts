export interface SubNavItem {
  label: string;
  path: string;
  description?: string;  // For research descriptions
  partner?: string;      // For project partnerships
  dataLink?: string;     // Link to related data page
}

export interface NavItem {
  label: string;
  path: string;
  subItems?: SubNavItem[];
  disableNavigation?: boolean; // If true, clicking opens dropdown only
}

export interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  date: string;
  authors: string[];
  category: string;
  pdfUrl?: string;
  dataLink?: string;  // Link to related data visualization
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  profileUrl?: string;
}

export interface ChartDataPoint {
  year: string;
  amount: number;
  category: string;
}

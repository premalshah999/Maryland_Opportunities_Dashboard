import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, Download, LineChart } from 'lucide-react';

type ResearchSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type ResearchArticle = {
  slug: string;
  title: string;
  category: string;
  date: string;
  institution: string;
  preparedBy?: {
    faculty: string[];
    students: string[];
  };
  toc: string[];
  summary: string;
  sections: ResearchSection[];
  pdfUrl?: string;
  dataLink?: string;
  companionLink?: string;
};

const RESEARCH_ARTICLES: Record<string, ResearchArticle> = {
  'earned-wage-access': {
    slug: 'earned-wage-access',
    title: 'The Effects of Earned Wage Access Programs on Maryland Consumers',
    category: 'Earned Wage Access',
    date: 'February 2026',
    institution: 'University of Maryland, Robert H. Smith School of Business',
    preparedBy: {
      faculty: ['Dr. Vojislav Maksimovic', 'Dr. Liu Yang'],
      students: [
        'Sai Shashank Gorthy',
        'Shrenik Kalambur',
        'Yun Wang',
        'Yentell James',
        'Pranay Upreti',
        'Renhao Jiang',
        'Rivado Edah'
      ]
    },
    toc: [
      'Executive Summary',
      '1. Introduction',
      '2. Growth and Market Structure of EWA Services',
      '3. Is Earned Wage Access a "Free" Service?',
      '4. Repeat Usage, Delinquencies, and Financial Outcomes',
      '5. Demographic and Socioeconomic Patterns',
      'Financial Constraints and Financial Literacy',
      '6. Financial Access and Policy Implications',
      '7. Conclusion'
    ],
    summary:
      'This report evaluates Earned Wage Access adoption, pricing, repeat use, financial outcomes, and community-level correlates in Maryland using provider transaction data and socioeconomic indicators.',
    pdfUrl: '/assets/reports/research-ewa.pdf',
    dataLink: 'https://maryland-opportunities-dashboardv1.vercel.app/#/dashboard/government-spending',
    companionLink: '/research/earned-wage-access/scatter',
    sections: [
      {
        title: 'Executive Summary',
        paragraphs: [
          'This study examines the growth and implications of Earned Wage Access (EWA) along five dimensions: adoption trends, pricing, repeat use and repayment frictions, user correlates, and links to financial access.',
          'Using firm-level EWA transaction metrics and ZIP-code-level socioeconomic and financial-infrastructure measures, we document sharp growth in usage over time, with recurring users driving much of the increase.',
          'Although many providers advertise free options, expedited transfer fees and tipping are widespread, implying meaningful effective borrowing costs for a substantial share of transactions.',
          'Heavy repeat usage and repayment difficulty indicators suggest EWA often functions as a recurring short-term liquidity tool for financially constrained households.',
          'EWA usage is more concentrated in lower-income and financially constrained communities and is associated with local access to traditional banking and other forms of alternative financing.'
        ]
      },
      {
        title: '1. Introduction',
        paragraphs: [
          'Earned Wage Access programs allow workers to obtain a portion of earned but unpaid wages before traditional payday. Supporters argue EWA can reduce overdraft and alternative credit usage, while critics highlight repeated use, optional fee structures, and transparency concerns.',
          'In Maryland, adoption has reached substantial scale from January 2019 to September 2024.'
        ],
        bullets: [
          'Total transactions: 11 million',
          'Total transaction volume: $108 million',
          'Total unique customers: 345,000'
        ]
      },
      {
        title: '2. Growth and Market Structure of EWA Services',
        paragraphs: [
          'Usage has increased sharply in both user counts and transaction frequency, indicating that growth is not only adoption breadth but also usage intensity.',
          'The evidence suggests EWA is frequently used as part of regular cash-flow management, not only for infrequent emergency liquidity.',
          'Providers operate through two primary models.'
        ],
        bullets: [
          'Business-to-Business (B2B): employer and payroll-integrated model',
          'Direct-to-Consumer (D2C): direct worker onboarding through linked bank data',
          'In Maryland, D2C accounts for more than half of approximately 345,000 unique users'
        ]
      },
      {
        title: '3. Is Earned Wage Access a "Free" Service?',
        paragraphs: [
          'Marketing often frames EWA as no-cost, but transaction evidence indicates substantial user-paid costs across a large subset of providers.',
          'In the sample, providers reported approximately $35 million in revenue from around 5.5 million consumer payments, representing roughly half of all transactions in the covered data.',
          'Cost channels include expedited transfer fees, high implied APR on small-dollar advances, and widespread tipping behavior.',
          'Given common transaction sizes between $25 and $100, flat fees often translate to high annualized cost measures, with average APR estimates exceeding 100% in provider-level calculations.'
        ],
        bullets: [
          'Expedited transfer fees: typically $2 to $5 for faster disbursement',
          'Implied APR range in sample: roughly 42% to more than 200%, depending on provider',
          'Average cumulative tip per user in reporting providers: more than $280 over five years'
        ]
      },
      {
        title: '4. Repeat Usage, Delinquencies, and Financial Outcomes',
        paragraphs: [
          'A central finding is heavy repeat use, which is more consistent with recurring liquidity stress than one-time emergencies.',
          'Most users in the sample recorded 51 or more repeat transactions over a five-year period, and about 23% used EWA at least once every two weeks.',
          'Despite repeated use, a large share of users remained financially fragile: nearly half still reported inability to cover emergency expenses.',
          'Survey evidence also indicates labor supply adjustments, with 46% of users reporting additional hours or shifts linked to EWA usage.'
        ]
      },
      {
        title: '5. Demographic and Socioeconomic Patterns',
        paragraphs: [
          'EWA usage differs systematically by community characteristics, indicating structural rather than purely transitory demand patterns.',
          'Younger workers are overrepresented, with notable concentration among users aged 25 to 33.',
          'Usage correlates negatively with median income and educational attainment at the ZIP-code level, and positively with ZIP-code shares of Black and Hispanic residents.'
        ]
      },
      {
        title: 'Financial Constraints and Financial Literacy',
        paragraphs: [
          'Using FINRA National Financial Capability Survey responses for Maryland, the team constructed zip-code-level indices for financial constraint, financial literacy, and alternative financing usage.',
          'EWA usage is positively associated with measured financial constraints and negatively associated with financial literacy scores.',
          'This pattern is consistent with demand being tied to underlying vulnerability rather than purely deliberate optimization by financially resilient households.'
        ],
        bullets: [
          'Financial Constraint Index: 0-6 points across bill stress and shortfall indicators',
          'Financial Literacy Index: 0-5 points based on objective knowledge questions',
          'Alternative Financing Index: 0-5 points across payday, pawn, title, and related products'
        ]
      },
      {
        title: '6. Financial Access and Policy Implications',
        paragraphs: [
          'EWA usage is positively associated with local access to traditional banks and credit unions, indicating adoption is not mainly driven by complete exclusion from formal banking.',
          'There is also a positive association between EWA usage and alternative financing prevalence, suggesting a layered liquidity toolkit rather than simple one-for-one substitution.',
          'Policy design should therefore evaluate EWA within a broader household liquidity ecosystem and address transparency, affordability, and repeated-use risk.'
        ]
      },
      {
        title: '7. Conclusion',
        paragraphs: [
          'EWA now plays a meaningful role in Maryland household liquidity management. The evidence indicates many users face nontrivial costs and repeated usage patterns that can align with persistent financial strain.',
          'Policy responses should preserve useful short-term liquidity benefits while strengthening disclosure, fee clarity, and consumer protections that support long-term financial well-being.'
        ]
      }
    ]
  },
  'federal-spending': {
    slug: 'federal-spending',
    title: 'Federal Contracts in Maryland',
    category: 'Federal Contracts',
    date: 'January 2024',
    institution: 'University of Maryland, Robert H. Smith School of Business',
    toc: ['Overview', 'Methods', 'Key Findings', 'Policy Relevance'],
    summary:
      'This research evaluates direct and indirect effects of federal contract spending in Maryland through primary awards and subcontracting linkages.',
    pdfUrl: '/assets/reports/research-federal-contract-flows-md.pdf',
    dataLink: 'https://maryland-opportunities-dashboardv1.vercel.app/#/dashboard/fund-flow',
    sections: [
      {
        title: 'Overview',
        paragraphs: [
          'This report analyzes federal contract flows connected to Maryland, including direct prime awards and related subcontracting pathways.',
          'The focus is understanding how contract dollars circulate across sectors and geographies and where concentration risk emerges.'
        ]
      },
      {
        title: 'Methods',
        paragraphs: [
          'The team links federal contracting records to flow structures that identify origin, destination, and industry channels for awarded spending.',
          'Comparisons are made across locations and time windows to identify concentration, leakage, and dependency patterns.'
        ]
      },
      {
        title: 'Key Findings',
        paragraphs: [
          'Maryland outcomes reflect both direct federal relationships and indirect subcontracting networks.',
          'Network structure and agency concentration materially influence local exposure and resilience.'
        ]
      },
      {
        title: 'Policy Relevance',
        paragraphs: [
          'Findings support procurement strategy, supplier ecosystem development, and scenario planning for federal contract shocks.',
          'A full narrative update will be published in this page structure when the finalized long-form report text is provided.'
        ]
      }
    ]
  },
  'shutdown-cost': {
    slug: 'shutdown-cost',
    title: "What's the Cost of a Government Shutdown to Maryland?",
    category: 'Government Shutdown',
    date: 'March 2024',
    institution: 'University of Maryland, Robert H. Smith School of Business',
    toc: ['Overview', 'Approach', 'Impact Channels', 'Policy Relevance'],
    summary:
      'This research estimates the economic impact of federal shutdown conditions on Maryland employment, contract activity, and related income channels.',
    pdfUrl: '/assets/reports/research-government-shutdown-2025-md.pdf',
    dataLink: '/dashboard/federal-spending-breaks',
    sections: [
      {
        title: 'Overview',
        paragraphs: [
          'This report estimates potential statewide and local impacts from federal shutdown conditions affecting employment, contracts, and payment flows.',
          'The objective is to provide actionable estimates that can support preparedness and communication with stakeholders.'
        ]
      },
      {
        title: 'Approach',
        paragraphs: [
          'The analysis combines federal spending and labor dependencies with scenario assumptions to quantify likely impact ranges.',
          'Results are interpreted across states and local geographies to support contingency planning.'
        ]
      },
      {
        title: 'Impact Channels',
        paragraphs: [
          'Key channels include payroll interruption risk, contract slowdown effects, and downstream multiplier pressures on local demand.',
          'Distribution of impacts varies by federal concentration and industry exposure.'
        ]
      },
      {
        title: 'Policy Relevance',
        paragraphs: [
          'Results support budget planning, local mitigation prioritization, and communication strategy during federal disruption periods.',
          'A full narrative update will be published in this page structure when the finalized long-form report text is provided.'
        ]
      }
    ]
  }
};

export const ResearchDetail: React.FC = () => {
  const { researchSlug } = useParams<{ researchSlug: string }>();
  const article = researchSlug ? RESEARCH_ARTICLES[researchSlug] : null;

  if (!article) {
    return <Navigate to="/research" replace />;
  }

  return (
    <div className="animate-fadeIn">
      <div className="bg-white py-16 md:py-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/research"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 hover:text-umd-red transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Back to Research
          </Link>
          <div className="text-umd-red text-xs font-semibold uppercase tracking-[0.18em] mb-3">{article.category}</div>
          <h1 className="text-3xl md:text-5xl font-serif font-semibold text-gray-900 mb-4 leading-tight">{article.title}</h1>
          <p className="text-sm text-gray-500">{article.institution} · {article.date}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="flex flex-wrap gap-3 mb-10">
          {article.pdfUrl && (
            <a
              href={article.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-[11px] font-semibold uppercase tracking-[0.1em] rounded-md hover:bg-gray-800 transition-colors"
            >
              <Download size={14} />
              Download Report
            </a>
          )}
          {article.dataLink && (
            article.dataLink.startsWith('http') ? (
              <a
                href={article.dataLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-[11px] font-semibold uppercase tracking-[0.1em] rounded-md hover:border-umd-red hover:text-umd-red transition-colors"
              >
                <BarChart3 size={14} />
                Explore Data
              </a>
            ) : (
              <Link
                to={article.dataLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-[11px] font-semibold uppercase tracking-[0.1em] rounded-md hover:border-umd-red hover:text-umd-red transition-colors"
              >
                <BarChart3 size={14} />
                Explore Data
              </Link>
            )
          )}
          {article.companionLink && (
            <Link
              to={article.companionLink}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-[11px] font-semibold uppercase tracking-[0.1em] rounded-md hover:border-umd-red hover:text-umd-red transition-colors"
            >
              <LineChart size={14} />
              Interactive Figures
            </Link>
          )}
        </div>

        <article className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed">
          <p className="text-xl text-gray-500 font-light not-prose mb-8">{article.summary}</p>

          {article.preparedBy && (
            <div className="not-prose mb-10 bg-gray-50 border border-gray-100 p-6">
              <h2 className="text-lg font-serif text-gray-900 mb-4">Prepared by</h2>
              <p className="text-sm text-gray-600 mb-2"><span className="font-medium text-gray-800">Faculty:</span> {article.preparedBy.faculty.join(', ')}</p>
              <p className="text-sm text-gray-600"><span className="font-medium text-gray-800">Students:</span> {article.preparedBy.students.join(', ')}</p>
            </div>
          )}

          <div className="not-prose mb-10">
            <h2 className="text-lg font-serif text-gray-900 mb-4">Table of Contents</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              {article.toc.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>

          {article.sections.map((section) => (
            <section key={section.title} className="mb-10">
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={`${section.title}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
              ))}
              {section.bullets?.length ? (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={`${section.title}-${bullet}`}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
};

export default ResearchDetail;

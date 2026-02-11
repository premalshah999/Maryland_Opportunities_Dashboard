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
  hideSummary?: boolean;
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
    hideSummary: true,
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
    summary: 'The Effects of Earned Wage Access Programs on Maryland Consumers',
    pdfUrl: '/assets/reports/research-ewa.pdf',
    dataLink: 'https://maryland-opportunities-dashboardv1.vercel.app/#/dashboard/government-spending',
    companionLink: '/research/earned-wage-access/scatter',
    sections: [
      {
        title: 'Executive Summary',
        paragraphs: [
          'This study examines the growth and implications of Earned Wage Access (EWA) along five dimensions: adoption trends, pricing, repeat use and repayment frictions, user correlates, and links to financial access.',
          'Using firm-level EWA transaction metrics and ZIP-code-level socioeconomic and financial-infrastructure measures, we document a sharp increase in EWA usage over time, driven largely by recurring users rather than one-off borrowing. Although many providers advertise "free" options, fees for expedited transfers and tipping are widespread, implying meaningful effective borrowing costs for a substantial share of transactions.',
          'We find heavy repeat usage and nontrivial repayment difficulties on some platforms (e.g., payment delays and non-repayment), suggesting EWA often functions as a short-term liquidity management tool for financially constrained households rather than an occasional emergency bridge. EWA usage is disproportionately concentrated among lower-income and financially constrained communities and is correlated with demographic characteristics in provider-specific data.',
          'Finally, EWA adoption is positively associated with local access to traditional financial institutions and with other forms of alternative credit usage, indicating that EWA complements, rather than purely substitutes for, existing financial services in the areas where it is most prevalent.'
        ]
      },
      {
        title: '1. Introduction',
        paragraphs: [
          'Earned Wage Access (EWA) programs allow workers to obtain a portion of their earned but unpaid wages prior to the traditional payday. These services have expanded rapidly in recent years and are often marketed as tools that help households manage short-term liquidity needs. Advocates argue that EWA can reduce reliance on overdrafts or high-cost alternative credit products, while critics express concern that repeated use, optional fees, and limited transparency may exacerbate financial vulnerability.',
          'The growth of EWA in Maryland illustrates this broader trend. From January 2019 to September 2024, EWA providers operating in the state have reached substantial scale:',
          'This article examines aggregate patterns of EWA usage, pricing structures, and consumer outcomes in Maryland. Drawing on market inquiry responses and transaction-level evidence aggregated across multiple providers, the analysis focuses on economic mechanisms rather than firm-specific behavior. The discussion addresses five broad questions:'
        ],
        bullets: [
          'Total transactions: 11 million',
          'Total transaction volume: $108 million',
          'Total unique customers: 345,000',
          'How has EWA usage evolved over time?',
          'Are EWA services effectively free?',
          'What is the extent of repeat usage and repayment difficulties?',
          'What are the demographic and socioeconomic correlates of usage?',
          'What is the relationship between EWA adoption and financial access?'
        ]
      },
      {
        title: '2. Growth and Market Structure of EWA Services',
        paragraphs: [
          'EWA usage has increased sharply over time, both in the number of users and in transaction frequency. The parallel increase in users and transactions suggests that rising adoption is accompanied by greater transaction intensity. Rather than serving solely as an emergency liquidity tool, EWA appears to have become part of regular cash-flow management for many households.',
          'EWA services operate under two primary business models:',
          'In Maryland, the D2C model dominates, accounting for more than half of the approximately 345,000 unique users.'
        ],
        bullets: [
          'Business-to-Business (B2B): Providers partner with employers and integrate with payroll systems to facilitate wage advances directly through the workplace.',
          'Direct-to-Consumer (D2C): Providers work directly with workers by linking to their bank accounts to verify earnings, without requiring employer participation.'
        ]
      },
      {
        title: '3. Is Earned Wage Access a "Free" Service?',
        paragraphs: [
          'Although EWA services are often marketed as free, the data tell a different story. In our sample, a subset of EWA providers generated $35 million in total revenue from roughly 5.5 million consumer payments, accounting for about 50% of all transactions. Three primary factors contribute to the actual costs borne by users:'
        ],
        bullets: [
          'Expedited Transfer Fees: Most providers offer a no-cost option requiring up to two business days for disbursement. To receive funds faster, users pay fees ranging from $2 to $5 per advance.',
          'High Effective APR: Given that most transactions fall between $25 and $100, flat fees translate into substantial annualized costs. The average APR across providers exceeds 100%, ranging from 42% to over 200%, depending on the firm.',
          'Voluntary Tips: While framed as optional, tips are common in practice. Among providers reporting detailed data, the average cumulative tip per user reached over $280 over the sample period of five years.'
        ]
      },
      {
        title: '4. Repeat Usage, Delinquencies, and Financial Outcomes',
        paragraphs: [
          'A striking feature of EWA usage is the prevalence of repeat transactions. This pattern suggests reliance rather than episodic use, raising concerns about whether EWA alleviates or perpetuates financial strain. Three key findings emerge:'
        ],
        bullets: [
          'Persistent Reliance: Rather than serving as an occasional emergency tool, EWA appears embedded in regular cash-flow management. Most users have 51 or more repeat transactions during a five-year period, and 23% use the service at least once every two weeks.',
          'Limited Financial Improvement: Despite repeated usage, EWA does not appear to alleviate underlying financial constraints. Nearly 50% of users remain unable to cover emergency expenses even after using the service.',
          'Behavioral Consequences: EWA usage is associated with changes in work behavior. Among surveyed users, 46% reported working more hours or taking on additional shifts as a result of using EWA services.'
        ]
      },
      {
        title: '5. Demographic and Socioeconomic Patterns',
        paragraphs: [
          'EWA usage varies systematically across demographic and socioeconomic groups, suggesting that adoption reflects structural constraints rather than purely transitory shocks. Three key demographic correlates emerge:'
        ],
        bullets: [
          'Age: Younger workers are more likely to adopt EWA services. Notably, 32% of EWA users are between the ages of 25 and 33, indicating concentration among those early in their careers with limited savings buffers.',
          'Income and Education: EWA usage is disproportionately concentrated among lower-income households. Zip codes with higher median income and education levels exhibit negative correlations with EWA uptake.',
          'Race: Zip codes with higher percentages of Black and Hispanic residents use EWA services more frequently, pointing to racial disparities in financial access.'
        ]
      },
      {
        title: 'Financial Constraints and Financial Literacy',
        paragraphs: [
          'To further examine the relationship between financial vulnerability and EWA usage, we construct zip code-level indices using the National Financial Capability Survey (FINRA, 2009-2021), which includes approximately 2,500 respondents in Maryland. Three indices are computed:',
          'EWA usage is positively correlated with financial constraints and negatively correlated with financial literacy. This pattern suggests that demand for EWA services is closely tied to underlying economic vulnerability, rather than reflecting informed or deliberate financial decision-making.'
        ],
        bullets: [
          'Financial Constraint (0-6 points): Aggregates indicators of spending exceeding income, difficulty paying bills, lack of emergency funds, retirement account hardship withdrawals, late mortgage payments, and credit card payment difficulties.',
          'Financial Literacy (0-5 points): Based on objective questions assessing respondents\' financial knowledge.',
          'Alternative Financing (0-5 points): Captures frequent use of auto title loans, payday loans, pawn shops, rent-to-own stores, or subprime auto loans.'
        ]
      },
      {
        title: '6. Financial Access and Policy Implications',
        paragraphs: [
          'Access to traditional financial institutions plays a nuanced role in EWA usage. While bank access is typically required to use EWA services, greater availability of banks and credit unions is associated with higher EWA adoption. This suggests that EWA adoption does not primarily arise from exclusion from the formal banking system.',
          'Instead, EWA appears to be used by individuals who already have access to traditional financial institutions. In addition, there is a positive association between EWA use and the prevalence of alternative financing, indicating that EWA is part of a broader set of short-term liquidity tools used by financially constrained households. Taken jointly, these patterns imply that EWA functions as a complementary liquidity instrument within a layered financial ecosystem: consumers stack EWA on top of bank accounts and alternative credit products to manage cash-flow volatility.'
        ]
      },
      {
        title: '7. Conclusion',
        paragraphs: [
          'Earned Wage Access programs have become an increasingly prominent feature of the consumer financial landscape. While they offer flexibility and immediacy, the evidence suggests that EWA services are often neither costless nor used solely for emergencies. Instead, they are frequently embedded in the financial lives of economically vulnerable households, with repeated usage, meaningful costs, and nontrivial risks of repayment difficulty.',
          'Understanding EWA, therefore, requires a careful assessment of both its benefits and its risks. Effective policy responses should balance the short-term liquidity advantages of EWA against the need to promote transparency, affordability, and long-term financial well-being.'
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

const EWA_FIGURES = {
  fig1: {
    src: '/assets/reports/ewa-figures/fig1-transaction-distribution.png',
    alt: 'Figure 1. Distribution of Earned Wage Access transaction amounts.',
    caption: 'Fig. 1: Distribution of Earned Wage Access transaction amounts.'
  },
  fig2: {
    src: '/assets/reports/ewa-figures/fig2-demographic-patterns.png',
    alt: 'Figure 2. Demographic and Socioeconomic Correlates of EWA Usage.',
    caption: 'Fig. 2: Demographic and Socioeconomic Correlates of EWA Usage. (a) Income, (b) Education, (c) Black, (d) Hispanic.'
  },
  fig3: {
    src: '/assets/reports/ewa-figures/fig3-finra-indices.png',
    alt: 'Figure 3. FINRA Indices: Financial Constraints and Financial Literacy.',
    caption: 'Fig. 3: FINRA Indices: Financial Constraints and Financial Literacy.'
  },
  fig4: {
    src: '/assets/reports/ewa-figures/fig4-financial-access.png',
    alt: 'Figure 4. Financial Access and Alternative Financing.',
    caption: 'Fig. 4: Financial Access and Alternative Financing. (a) Nearby Banks, (b) Alternative Financing.'
  }
};

export const ResearchDetail: React.FC = () => {
  const { researchSlug } = useParams<{ researchSlug: string }>();
  const article = researchSlug ? RESEARCH_ARTICLES[researchSlug] : null;
  const isEwaArticle = article?.slug === 'earned-wage-access';

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
          {isEwaArticle ? (
            <div className="space-y-1 text-sm text-gray-600">
              <p>{article.institution}</p>
              <p>Date: {article.date}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">{article.institution} · {article.date}</p>
          )}
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

        <article className="max-w-none">
          {!article.hideSummary && (
            <div className="mb-8 p-6 border border-gray-100 bg-gray-50/70">
              <p className="text-xl text-gray-500 font-light">{article.summary}</p>
            </div>
          )}

          {article.preparedBy && (
            <div className="not-prose mb-10 bg-gray-50 border border-gray-100 p-6">
              <p className="text-base text-gray-900 mb-2">Prepared by:</p>
              <p className="text-base text-gray-700 mb-2">Faculty: {article.preparedBy.faculty.join(', ')}</p>
              <p className="text-base text-gray-700">Students: {article.preparedBy.students.join(', ')}</p>
            </div>
          )}

          <div className="not-prose mb-12 border border-gray-100 bg-white p-6 md:p-8">
            <h2 className="text-2xl font-serif text-gray-900 mb-6">Table of Contents</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              {article.toc.map((item) => (
                <div key={item} className="text-base">{item}</div>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            {article.sections.map((section) => (
              <section key={section.title} className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">{section.title}</h2>
                <div className="space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={`${section.title}-${paragraph.slice(0, 24)}`} className="text-gray-700 leading-8">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.bullets?.length ? (
                  article.slug === 'earned-wage-access' && section.title === '4. Repeat Usage, Delinquencies, and Financial Outcomes' ? (
                    <>
                      <ul className="mt-5 list-disc pl-6 space-y-2 text-gray-700 leading-7">
                        <li>{section.bullets[0]}</li>
                      </ul>
                      <figure className="mt-8">
                        <img src={EWA_FIGURES.fig1.src} alt={EWA_FIGURES.fig1.alt} className="w-full h-auto" />
                      </figure>
                      <ul className="mt-6 list-disc pl-6 space-y-2 text-gray-700 leading-7">
                        {section.bullets.slice(1).map((bullet) => (
                          <li key={`${section.title}-${bullet}`}>{bullet}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <ul className="mt-5 list-disc pl-6 space-y-2 text-gray-700 leading-7">
                      {section.bullets.map((bullet) => (
                        <li key={`${section.title}-${bullet}`}>{bullet}</li>
                      ))}
                    </ul>
                  )
                ) : null}

                {article.slug === 'earned-wage-access' && section.title === '5. Demographic and Socioeconomic Patterns' ? (
                  <>
                    <figure className="mt-8">
                      <img src={EWA_FIGURES.fig2.src} alt={EWA_FIGURES.fig2.alt} className="w-full h-auto" />
                    </figure>
                    <figure className="mt-6">
                      <img src={EWA_FIGURES.fig3.src} alt={EWA_FIGURES.fig3.alt} className="w-full h-auto" />
                    </figure>
                  </>
                ) : null}

                {article.slug === 'earned-wage-access' && section.title === '6. Financial Access and Policy Implications' ? (
                  <figure className="mt-8">
                    <img src={EWA_FIGURES.fig4.src} alt={EWA_FIGURES.fig4.alt} className="w-full h-auto" />
                  </figure>
                ) : null}
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
};

export default ResearchDetail;

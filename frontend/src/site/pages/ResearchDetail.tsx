import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, Download, LineChart } from 'lucide-react';
import { CollaborationPopup } from '../components/CollaborationPopup';

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
    date: 'February 2026',
    institution: 'University of Maryland, Robert H. Smith School of Business',
    hideSummary: true,
    preparedBy: {
      faculty: ['Dr. Vojislav Maksimovic', 'Dr. Liu Yang'],
      students: ['Kanat Isakov', 'Haotian Shi']
    },
    toc: [
      'Executive Summary',
      '1. Introduction',
      '2. Aggregate Trends of Contract in Maryland',
      '3. State-Level Decomposition',
      '4. Agency-Level Decomposition',
      '5. Industry-Level Decomposition',
      '6. Contractor-Level Decomposition',
      '6.1 Top Subawardees by Annual Average',
      '6.2 Funding Sources by Agency',
      '7. County-Level Decomposition',
      '8. Top-3 County Decomposition',
      '8.1 Anne Arundel County',
      '8.2 Howard County',
      '8.3 Montgomery County'
    ],
    summary: 'Federal Contract Flows in Maryland',
    pdfUrl: '/assets/reports/research-federal-contract-flows-md.pdf',
    dataLink: 'https://maryland-opportunities-dashboardv1.vercel.app/#/dashboard/fund-flow',
    sections: []
  },
  'shutdown-cost': {
    slug: 'shutdown-cost',
    title: 'Economic Impact of 2025 Federal Government Shutdown on Maryland',
    category: 'Government Shutdown',
    date: 'February 2026',
    institution: 'University of Maryland, Robert H. Smith School of Business',
    hideSummary: true,
    preparedBy: {
      faculty: ['Dr. Vojislav Maksimovic', 'Dr. Liu Yang'],
      students: ['Kanat Isakov', 'Haotian Shi']
    },
    toc: [
      'Executive Summary',
      '1. Introduction',
      '1.1 Data Sources',
      '1.2 Key Assumptions',
      '2. Federal Agency Furlough Rates',
      '3. Results: Economic Impact Analysis',
      '3.1 Employee Compensation Impact by County',
      '3.2 Induced Economic Impact by Industry',
      '3.3 Total Economic Impact Across by County',
      '3.4 County-Industry Breakdown',
      '3.4.1 Employee Compensation Impact by County and Industry',
      '3.4.2 Output Impact by County and Industry'
    ],
    summary: 'Economic Impact of 2025 Federal Government Shutdown on Maryland',
    pdfUrl: '/assets/reports/research-government-shutdown-2025-md.pdf',
    dataLink: '/dashboard/federal-spending-breaks',
    sections: []
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

const FEDERAL_FLOW_FIGURES = {
  fig1: { src: '/assets/reports/federal-flow-figures/fig1.png', alt: 'Figure 1: Federal Contract Flows to Maryland Over Time' },
  fig2: { src: '/assets/reports/federal-flow-figures/fig2.png', alt: 'Figure 2: State-Level Decomposition of Federal Contract Flows to Maryland' },
  fig3: { src: '/assets/reports/federal-flow-figures/fig3.png', alt: 'Figure 3: Federal Contract Flows to Maryland by Awarding Agency' },
  fig4: { src: '/assets/reports/federal-flow-figures/fig4.png', alt: 'Figure 4: Federal Contract Flows to Maryland by Industry (4-Digit NAICS)' },
  fig5: { src: '/assets/reports/federal-flow-figures/fig5.png', alt: 'Figure 5: Top 10 Maryland Subawardees by Annual Average Amount' },
  fig6: { src: '/assets/reports/federal-flow-figures/fig6.png', alt: 'Figure 6: Top 10 Maryland Subawardees: Funding by Major Agencies' },
  fig7: { src: '/assets/reports/federal-flow-figures/fig7.png', alt: 'Figure 7: Top 10 Maryland Counties by Federal Contract Flows' },
  fig8: { src: '/assets/reports/federal-flow-figures/fig8.png', alt: 'Figure 8: Federal Contract Flows to Anne Arundel County' },
  fig9: { src: '/assets/reports/federal-flow-figures/fig9.png', alt: 'Figure 9: Federal Contract Flows to Howard County' },
  fig10: { src: '/assets/reports/federal-flow-figures/fig10.png', alt: 'Figure 10: Federal Contract Flows to Montgomery County' }
};

const SHUTDOWN_FIGURES = {
  fig1: { src: '/assets/reports/shutdown-figures/fig1.png', alt: 'Figure 1: Federal Employee Salaries by Maryland County' },
  fig2: { src: '/assets/reports/shutdown-figures/fig2.png', alt: 'Figure 2: Employee Compensation Impact by County ($ Million)' },
  fig3: { src: '/assets/reports/shutdown-figures/fig3.png', alt: 'Figure 3: Industries by Induced Output ($ Million)' },
  fig4: { src: '/assets/reports/shutdown-figures/fig4.png', alt: 'Figure 4: Direct Compensation + Induced Output by County ($ Million)' },
  fig5: { src: '/assets/reports/shutdown-figures/fig5.png', alt: 'Figure 5: Top 5 Industries by Induced Employee Compensation for Selected Counties' },
  fig6: { src: '/assets/reports/shutdown-figures/fig6.png', alt: 'Figure 6: Top 5 Industries by Induced Output for Selected Counties' }
};

export const ResearchDetail: React.FC = () => {
  const { researchSlug } = useParams<{ researchSlug: string }>();
  const article = researchSlug ? RESEARCH_ARTICLES[researchSlug] : null;
  const isEwaArticle = article?.slug === 'earned-wage-access';
  const isFederalFlowArticle = article?.slug === 'federal-spending';
  const isShutdownArticle = article?.slug === 'shutdown-cost';

  if (!article) {
    return <Navigate to="/research" replace />;
  }

  return (
    <div className="animate-fadeIn">
      <CollaborationPopup />
      <div className="bg-white py-16 md:py-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/research"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 hover:text-umd-red transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Back to Research
          </Link>
          {!isEwaArticle && !isFederalFlowArticle && !isShutdownArticle && (
            <div className="text-umd-red text-xs font-semibold uppercase tracking-[0.18em] mb-3">{article.category}</div>
          )}
          <h1 className="text-3xl md:text-5xl font-serif font-semibold text-gray-900 mb-4 leading-tight">{article.title}</h1>
          {isEwaArticle || isFederalFlowArticle || isShutdownArticle ? (
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
          {isEwaArticle ? (
            <div className="space-y-10">
              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Executive Summary</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>This study examines the growth and implications of Earned Wage Access (EWA) along five dimensions: adoption trends, pricing, repeat use and repayment frictions, user correlates, and links to financial access.</p>
                  <p>Using firm-level EWA transaction metrics and ZIP-code-level socioeconomic and financial-infrastructure measures, we document a sharp increase in EWA usage over time, driven largely by recurring users rather than one-off borrowing. Although many providers advertise "free" options, fees for expedited transfers and tipping are widespread, implying meaningful effective borrowing costs for a substantial share of transactions.</p>
                  <p>We find heavy repeat usage and nontrivial repayment difficulties on some platforms (e.g., payment delays and non-repayment), suggesting EWA often functions as a short-term liquidity management tool for financially constrained households rather than an occasional emergency bridge. EWA usage is disproportionately concentrated among lower-income and financially constrained communities and is correlated with demographic characteristics in provider-specific data.</p>
                  <p>Finally, EWA adoption is positively associated with local access to traditional financial institutions and with other forms of alternative credit usage, indicating that EWA complements, rather than purely substitutes for, existing financial services in the areas where it is most prevalent.</p>
                </div>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Earned Wage Access (EWA) programs allow workers to obtain a portion of their earned but unpaid wages prior to the traditional payday. These services have expanded rapidly in recent years and are often marketed as tools that help households manage short-term liquidity needs. Advocates argue that EWA can reduce reliance on overdrafts or high-cost alternative credit products, while critics express concern that repeated use, optional fees, and limited transparency may exacerbate financial vulnerability.</p>
                  <p>The growth of EWA in Maryland illustrates this broader trend. From January 2019 to September 2024, EWA providers operating in the state have reached substantial scale:</p>
                  <p><strong><em>Total transactions:</em></strong> 11 million</p>
                  <p><strong><em>Total transaction volume:</em></strong> $108 million</p>
                  <p><strong><em>Total unique customers:</em></strong> 345,000</p>
                  <p>This article examines aggregate patterns of EWA usage, pricing structures, and consumer outcomes in Maryland. Drawing on market inquiry responses and transaction-level evidence aggregated across multiple providers, the analysis focuses on economic mechanisms rather than firm-specific behavior. The discussion addresses five broad questions:</p>
                  <p>How has EWA usage evolved over time?</p>
                  <p>Are EWA services effectively free?</p>
                  <p>What is the extent of repeat usage and repayment difficulties?</p>
                  <p>What are the demographic and socioeconomic correlates of usage?</p>
                  <p>What is the relationship between EWA adoption and financial access?</p>
                </div>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">2. Growth and Market Structure of EWA Services</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>EWA usage has increased sharply over time, both in the number of users and in transaction frequency. The parallel increase in users and transactions suggests that rising adoption is accompanied by greater transaction intensity. Rather than serving solely as an emergency liquidity tool, EWA appears to have become part of regular cash-flow management for many households.</p>
                  <p>EWA services operate under two primary business models:</p>
                  <p><strong><em>Business-to-Business (B2B):</em></strong> Providers partner with employers and integrate with payroll systems to facilitate wage advances directly through the workplace.</p>
                  <p><strong><em>Direct-to-Consumer (D2C):</em></strong> Providers work directly with workers by linking to their bank accounts to verify earnings, without requiring employer participation.</p>
                  <p>In Maryland, the D2C model dominates, accounting for more than half of the approximately 345,000 unique users.</p>
                </div>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">3. Is Earned Wage Access a "Free" Service?</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Although EWA services are often marketed as free, the data tell a different story. In our sample, a subset of EWA providers generated $35 million in total revenue from roughly 5.5 million consumer payments, accounting for about 50% of all transactions. Three primary factors contribute to the actual costs borne by users:</p>
                  <p><strong><em>Expedited Transfer Fees:</em></strong> Most providers offer a no-cost option requiring up to two business days for disbursement. To receive funds faster, users pay fees ranging from $2 to $5 per advance.</p>
                  <p><strong><em>High Effective APR:</em></strong> Given that most transactions fall between $25 and $100, flat fees translate into substantial annualized costs. The average APR across providers exceeds 100%, ranging from 42% to over 200%, depending on the firm.</p>
                  <p><strong><em>Voluntary Tips:</em></strong> While framed as optional, tips are common in practice. Among providers reporting detailed data, the average cumulative tip per user reached over $280 over the sample period of five years.</p>
                </div>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">4. Repeat Usage, Delinquencies, and Financial Outcomes</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>A striking feature of EWA usage is the prevalence of repeat transactions. This pattern suggests reliance rather than episodic use, raising concerns about whether EWA alleviates or perpetuates financial strain. Three key findings emerge:</p>
                  <p><strong><em>Persistent Reliance:</em></strong> Rather than serving as an occasional emergency tool, EWA appears embedded in regular cash-flow management. Most users have 51 or more repeat transactions during a five-year period, and 23% use the service at least once every two weeks.</p>
                </div>
                <figure className="mt-8">
                  <img src={EWA_FIGURES.fig1.src} alt={EWA_FIGURES.fig1.alt} className="w-full h-auto" />
                </figure>
                <div className="space-y-4 text-gray-700 leading-8 mt-6">
                  <p><strong><em>Limited Financial Improvement:</em></strong> Despite repeated usage, EWA does not appear to alleviate underlying financial constraints. Nearly 50% of users remain unable to cover emergency expenses even after using the service.</p>
                  <p><strong><em>Behavioral Consequences:</em></strong> EWA usage is associated with changes in work behavior. Among surveyed users, 46% reported working more hours or taking on additional shifts as a result of using EWA services.</p>
                </div>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">5. Demographic and Socioeconomic Patterns</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>EWA usage varies systematically across demographic and socioeconomic groups, suggesting that adoption reflects structural constraints rather than purely transitory shocks. Three key demographic correlates emerge:</p>
                  <p><strong><em>Age:</em></strong> Younger workers are more likely to adopt EWA services. Notably, 32% of EWA users are between the ages of 25 and 33, indicating concentration among those early in their careers with limited savings buffers.</p>
                  <p><strong><em>Income and Education:</em></strong> EWA usage is disproportionately concentrated among lower-income households. Zip codes with higher median income and education levels exhibit negative correlations with EWA uptake.</p>
                  <p><strong><em>Race:</em></strong> Zip codes with higher percentages of Black and Hispanic residents use EWA services more frequently, pointing to racial disparities in financial access.</p>
                </div>
                <figure className="mt-8">
                  <img src={EWA_FIGURES.fig2.src} alt={EWA_FIGURES.fig2.alt} className="w-full h-auto" />
                </figure>
                <div className="space-y-4 text-gray-700 leading-8 mt-6">
                  <h3 className="text-xl font-serif font-semibold text-gray-900 pt-2">Financial Constraints and Financial Literacy</h3>
                  <p>To further examine the relationship between financial vulnerability and EWA usage, we construct zip code-level indices using the National Financial Capability Survey (FINRA, 2009-2021), which includes approximately 2,500 respondents in Maryland. Three indices are computed:</p>
                  <p><strong><em>Financial Constraint (0-6 points):</em></strong> Aggregates indicators of spending exceeding income, difficulty paying bills, lack of emergency funds, retirement account hardship withdrawals, late mortgage payments, and credit card payment difficulties.</p>
                  <p><strong><em>Financial Literacy (0-5 points):</em></strong> Based on objective questions assessing respondents' financial knowledge.</p>
                  <p><strong><em>Alternative Financing (0-5 points):</em></strong> Captures frequent use of auto title loans, payday loans, pawn shops, rent-to-own stores, or subprime auto loans.</p>
                  <p>EWA usage is positively correlated with financial constraints and negatively correlated with financial literacy. This pattern suggests that demand for EWA services is closely tied to underlying economic vulnerability, rather than reflecting informed or deliberate financial decision-making.</p>
                </div>
                <figure className="mt-6">
                  <img src={EWA_FIGURES.fig3.src} alt={EWA_FIGURES.fig3.alt} className="w-full h-auto" />
                </figure>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">6. Financial Access and Policy Implications</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Access to traditional financial institutions plays a nuanced role in EWA usage. While bank access is typically required to use EWA services, greater availability of banks and credit unions is associated with higher EWA adoption. This suggests that EWA adoption does not primarily arise from exclusion from the formal banking system.</p>
                  <p>Instead, EWA appears to be used by individuals who already have access to traditional financial institutions. In addition, there is a positive association between EWA use and the prevalence of alternative financing, indicating that EWA is part of a broader set of short-term liquidity tools used by financially constrained households. Taken jointly, these patterns imply that EWA functions as a complementary liquidity instrument within a layered financial ecosystem: consumers stack EWA on top of bank accounts and alternative credit products to manage cash-flow volatility.</p>
                </div>
                <figure className="mt-8">
                  <img src={EWA_FIGURES.fig4.src} alt={EWA_FIGURES.fig4.alt} className="w-full h-auto" />
                </figure>
              </section>

              <section className="pb-2">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">7. Conclusion</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Earned Wage Access programs have become an increasingly prominent feature of the consumer financial landscape. While they offer flexibility and immediacy, the evidence suggests that EWA services are often neither costless nor used solely for emergencies. Instead, they are frequently embedded in the financial lives of economically vulnerable households, with repeated usage, meaningful costs, and nontrivial risks of repayment difficulty.</p>
                  <p>Understanding EWA, therefore, requires a careful assessment of both its benefits and its risks. Effective policy responses should balance the short-term liquidity advantages of EWA against the need to promote transparency, affordability, and long-term financial well-being.</p>
                </div>
              </section>
            </div>
          ) : isFederalFlowArticle ? (
            <div className="space-y-10">
              <section className="border-b border-gray-100 pb-8">
                <div className="not-prose mb-8 bg-gray-50 border border-gray-100 p-6">
                  <p className="text-base text-gray-900 mb-2">Prepared by:</p>
                  <p className="text-base text-gray-700 mb-2">Faculty: Dr. Vojislav Maksimovic, Dr. Liu Yang</p>
                  <p className="text-base text-gray-700">Students: Kanat Isakov, Haotian Shi</p>
                </div>
                <div className="not-prose border border-gray-100 bg-white p-6 md:p-8">
                  <h2 className="text-2xl font-serif text-gray-900 mb-6">Table of Contents</h2>
                  <div className="space-y-3 text-gray-700 leading-relaxed">
                    {article.toc.map((item) => (
                      <div key={item} className="text-base">{item}</div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Executive Summary</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>This report examines the flow of federal contract dollars into and out of Maryland through subcontracting relationships during fiscal years 2010-2024. While prime contract awards are typically measured by the location of the winning firm's headquarters, the actual economic impact of federal procurement depends critically on where subcontracted work is performed. Our analysis tracks two key measures: subcontract inflow: federal contracts that flow into Maryland when out-of-state prime contractors hire Maryland firms as subcontractors, and subcontract outflow: federal contracts that leave Maryland when in-state primes subcontract work to vendors outside the state.</p>
                  <p><strong><em>Key Findings:</em></strong></p>
                  <p><strong><em>Maryland shifted from net recipient to net sender.</em></strong> Maryland was a net recipient of subcontract dollars from 2014 to 2019, peaking at $1 billion in 2016. By 2024, this reversed to a net outflow of $1.2 billion.</p>
                  <p><strong><em>Defense brings dollars in; energy sends them out.</em></strong> The Department of Defense generates $10 billion in net inflow for Maryland. The Department of Energy shows the opposite: a net outflow of $8 billion.</p>
                  <p><strong><em>Technical work flows in; support services flow out.</em></strong> Maryland receives subcontracts in Aerospace ($7B), Computer Systems Design ($5B), and Scientific R&amp;D ($4B). The largest outflow is Facilities Support Services ($9B).</p>
                  <p><strong><em>Subcontracts concentration.</em></strong> Northrop Grumman Systems Corp leads with $230 million annually, over four times the second-place recipient.</p>
                </div>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Federal procurement often operates through a prime-subcontracting structure. A federal agency awards a prime contract to a principal contractor, who then executes the work by allocating portions of performance to downstream suppliers and service providers through subcontracts. In practice, subcontracting is a key channel through which federal dollars reach local firms, specialized vendors, and smaller businesses that do not directly hold prime awards. As a result, the geography of prime awards can differ materially from the geography of actual production and economic activity, because prime contractors may be headquartered in one place while subcontracts and the associated employment and spending—are distributed elsewhere.</p>
                  <p>Our analysis dissects Maryland's position in federal contract flows by tracking subcontract movements across state borders. We define two key measures:</p>
                  <p><strong><em>Subcontract Outflow.</em></strong> Dollars awarded through prime contracts to Maryland firms that subsequently subcontract work outside the state, representing federal spending that leaks from Maryland's economy to out-of-state suppliers.</p>
                  <p><strong><em>Subcontract Inflow.</em></strong> Dollars from prime contracts awarded to non-Maryland firms that flow into Maryland through subcontracts to in-state vendors, reflecting the state's role as a downstream participant in national procurement supply chains.</p>
                </div>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">2. Aggregate Trends of Contract in Maryland</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Figure 1 summarizes Maryland's federal subcontract inflow and outflow from FY2010 to FY2024. Both series grow over the sample period, but their relative magnitudes shift considerably. Inflow rises steadily through the 2010s and peaks at roughly $4 billion in FY2022, before declining to approximately $2 billion by FY2024. Outflow, by contrast, remains below inflow for most of the decade but accelerates after 2020, reaching $3 billion in FY2024.</p>
                  <p>The net flow panel captures this divergence more directly. Between FY2010 and 2013, the net subcontract flow was near zero as both series remained small. Maryland then emerges as a consistent net recipient from FY2014 through 2019, with net inflow peaking around $1 billion in FY2016. This trend reverses sharply after 2020: net flow turns negative and widens to approximately $1.2 billion by FY2024.</p>
                  <p>Figure 1: Federal Contract Flows to Maryland Over Time</p>
                </div>
                <figure className="mt-8">
                  <img src={FEDERAL_FLOW_FIGURES.fig1.src} alt={FEDERAL_FLOW_FIGURES.fig1.alt} className="w-full h-auto" />
                </figure>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">3. State-Level Decomposition</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Figure 2 disaggregates cumulative subcontract flows by counterpart state for FY2024. On the inflow side, Virginia is the dominant source of subcontract dollars flowing into Maryland, totaling $8 billion, followed by Texas ($5 billion) and intra-state subcontracting within Maryland itself ($4 billion). California, Ohio, and a cluster of states, including New Jersey, Missouri, Alabama, Tennessee, and Florida, each contribute between $0.5 billion and $1 billion.</p>
                  <p>On the outflow side, the pattern is more concentrated. Tennessee is the largest recipient of subcontract dollars, absorbing $7 billion in FY2024. Intra-state flows and Virginia follow closely at $4 billion, respectively. Texas ($2 billion) and California ($2 billion) round out the top destinations, while Pennsylvania, the District of Columbia, New York, Florida, and Massachusetts each receive between $0.5 billion and $1 billion.</p>
                  <p>The Virginia-Maryland corridor dominates both directions, reflecting the tight integration of the two states within the Washington, D.C. metropolitan procurement ecosystem.</p>
                  <p>Figure 2: State-Level Decomposition of Federal Contract Flows to Maryland</p>
                </div>
                <figure className="mt-8">
                  <img src={FEDERAL_FLOW_FIGURES.fig2.src} alt={FEDERAL_FLOW_FIGURES.fig2.alt} className="w-full h-auto" />
                </figure>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">4. Agency-Level Decomposition</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Figure 3 ranks the top five federal agencies by cumulative subcontract inflow and outflow associated with Maryland at FY2024. The Department of Defense (DOD) dominates both sides of the ledger, generating $19 billion in subcontract inflow to Maryland against $9 billion in outflow, yielding a net inflow of approximately $10 billion.</p>
                  <p>Beyond DOD, the remaining agencies are considerably smaller in scale but reveal important asymmetries. The Department of Health and Human Services (HHS) and NASA each bring roughly $2 billion into Maryland through subcontracts, while their outflows reach $2 billion and $3 billion respectively, making both approximately net neutral for the state. The Department of Energy (DOE) presents the starkest imbalance: inflow amounts to under $1 billion against $8 billion in outflow, producing a net loss of over $7 billion. The Department of Homeland Security (DHS) is relatively balanced, with $1 billion in inflow and $1 billion in outflow.</p>
                  <p>Taken together, Maryland's favorable aggregate position in defense subcontracting masks substantial leakage through energy-related contracts.</p>
                  <p>Figure 3: Federal Contract Flows to Maryland by Awarding Agency</p>
                </div>
                <figure className="mt-8">
                  <img src={FEDERAL_FLOW_FIGURES.fig3.src} alt={FEDERAL_FLOW_FIGURES.fig3.alt} className="w-full h-auto" />
                </figure>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">5. Industry-Level Decomposition</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Figure 4 presents subcontract flows by industry sector using 4-digit NAICS codes. First, inflows concentrate in high-value technical sectors, with Aerospace Product and Parts Manufacturing ($7B), Computer Systems Design and Related Services ($5B), and Scientific Research and Development Services ($4B) representing the largest inflow categories, indicating that Maryland's high-tech industries receive substantial subcontract work from out-of-state prime contractors. Second, outflows dominate in facilities support, with Facilities Support Services ($9B) constituting the largest outflow category, suggesting that Maryland primes rely heavily on out-of-state vendors for building operations and maintenance services.</p>
                  <p>Figure 4: Federal Contract Flows to Maryland by Industry (4-Digit NAICS)</p>
                </div>
                <figure className="mt-8">
                  <img src={FEDERAL_FLOW_FIGURES.fig4.src} alt={FEDERAL_FLOW_FIGURES.fig4.alt} className="w-full h-auto" />
                </figure>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">6. Contractor-Level Decomposition</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Figures 5 and 6 present the top 10 federal subcontract recipients located in Maryland based on the average value from 2010-2024.</p>
                </div>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">6.1 Top Subawardees by Annual Average</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Figure 5 ranks Maryland subawardees by annual average subcontract amount. Northrop Grumman Systems Corp dominates the rankings with an annual average of $230 million, far exceeding the second-place TEKsystems ($50 million) and third-place Textron Systems Corporation ($50 million). Other major defense contractors follow: Northrop Grumman Corporation ($36 million), Lockheed Martin Corp ($35 million), and FCN, Inc. ($34 million). The remaining top 10 include Edgewater Federal Solutions ($29 million), Smiths Detection Inc. ($23 million), Motorola Solutions ($22 million), and IBM ($21 million). This concentration underscores that federal subcontracting dollars flow disproportionately to a small number of large contractors in the state.</p>
                  <p>Figure 5: Top 10 Maryland Subawardees by Annual Average Amount.</p>
                </div>
                <figure className="mt-8">
                  <img src={FEDERAL_FLOW_FIGURES.fig5.src} alt={FEDERAL_FLOW_FIGURES.fig5.alt} className="w-full h-auto" />
                </figure>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">6.2 Funding Sources by Agency</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Figure 6 illustrates the distribution of federal contracts for the top 10 Maryland subawardees. The Department of Defense (DoD) is the dominant funding source, accounting for the vast majority of subcontract awards to Northrop Grumman Systems Corp ($3.5 billion total), TEKsystems, Textron Systems, Northrop Grumman Corporation, FCN, and Motorola Solutions. The Department of Homeland Security (DHS) serves as the primary funding source for Lockheed Martin Corp ($530 million) and Smiths Detection Inc. ($350 million), reflecting their focus on security-related contracts. Notably, Edgewater Federal Solutions ($440 million) receives nearly all of its funding from the Department of Energy, while IBM ($320 million) exhibits a more diversified funding portfolio spanning the Department of Veterans Affairs, DoD, and Health and Human Services.</p>
                  <p>Figure 6: Top 10 Maryland Subawardees: Funding by Major Agencies.</p>
                </div>
                <figure className="mt-8">
                  <img src={FEDERAL_FLOW_FIGURES.fig6.src} alt={FEDERAL_FLOW_FIGURES.fig6.alt} className="w-full h-auto" />
                </figure>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">7. County-Level Decomposition</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Figure 7 presents average annual subcontract inflow, outflow, and net flow by Maryland county over FY2015-2024. Anne Arundel County leads all counties in inflow, averaging over $700 million per year, followed by Montgomery County at roughly $400 million and Howard County at approximately $160 million. Prince George's County, Baltimore County, and a group of smaller counties, including Harford, Frederick, St. Mary's, Carroll, and Baltimore City, each average between $50 million and $110 million annually.</p>
                  <p>The outflow distribution is notably more concentrated. Frederick County dominates with an average annual outflow approaching $750 million, far exceeding all other counties. Montgomery County follows at roughly $450 million, with Howard and Prince George's counties each near $100 million. The remaining counties on the outflow side, including Baltimore, St. Mary's, Anne Arundel, Harford, Baltimore City, and Cecil, contribute relatively modest amounts.</p>
                  <p>The net flow panel clarifies which counties serve as net recipients versus net senders of subcontract dollars. Anne Arundel County stands out as the largest net beneficiary, with an average annual net inflow exceeding $600 million, reflecting its role as a major downstream destination for subcontracted federal work. On the other side, Frederick County is the largest net sender, with average annual net outflow surpassing $600 million, followed by Montgomery County at roughly $50 million.</p>
                  <p>Figure 7: Top 10 Maryland Counties by Federal Contract Flows</p>
                </div>
                <figure className="mt-8">
                  <img src={FEDERAL_FLOW_FIGURES.fig7.src} alt={FEDERAL_FLOW_FIGURES.fig7.alt} className="w-full h-auto" />
                </figure>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">8. Top-3 County Decomposition</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>To better understand the micro-geography of Maryland's subcontract flows, we examine three of the state's most active counties in federal procurement: Anne Arundel, Howard, and Montgomery. Each exhibits a distinct pattern in terms of geographic counterparts, agency composition, and net position.</p>
                </div>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">8.1 Anne Arundel County</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Anne Arundel County is the largest net recipient of subcontract dollars among Maryland counties, and its flow profile is heavily concentrated along a single axis. On the inflow side, Texas alone accounts for $0.4 billion in average annual subcontracts directed to Anne Arundel vendors, dwarfing the next largest source, Virginia, at $0.2 billion. Intra-state flows from other Maryland counties and smaller contributions from Washington and Tennessee round out the top five. By agency, the DOD overwhelmingly dominates, generating $0.7 billion in average annual inflow, more than thirty times the next largest agency (DOE at $0.02 billion). Outflows from Anne Arundel are minimal, with the largest destination being intra-state transfers at just $0.02 billion. The county's strong net positive position stems almost entirely from downstream DOD subcontracts awarded by out-of-state primes, particularly from Texas.</p>
                  <p>Figure 8: Federal Contract Flows to Anne Arundel County</p>
                </div>
                <figure className="mt-8">
                  <img src={FEDERAL_FLOW_FIGURES.fig8.src} alt={FEDERAL_FLOW_FIGURES.fig8.alt} className="w-full h-auto" />
                </figure>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">8.2 Howard County</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Howard County presents a more balanced but still net-positive profile. Virginia is the leading source of inflow at $0.08 billion annually, followed by intra-state flows ($0.04 billion) and smaller contributions from Massachusetts, Texas, and Ohio. DOD again leads on the agency side with $0.12 billion in inflow, supplemented by HHS and NASA at $0.02 billion each. On the outflow side, however, Howard County sends a notable volume of subcontract dollars to other Maryland counties ($0.04 billion) and to Virginia ($0.02 billion). By agency, NASA is the largest source of outflow at $0.07 billion, followed by DOD at $0.04 billion and HHS at $0.03 billion. This suggests that its contractors function as intermediaries, receiving DOD subcontracts while simultaneously farming out NASA and HHS work to vendors elsewhere.</p>
                  <p>Figure 9: Federal Contract Flows to Howard County</p>
                </div>
                <figure className="mt-8">
                  <img src={FEDERAL_FLOW_FIGURES.fig9.src} alt={FEDERAL_FLOW_FIGURES.fig9.alt} className="w-full h-auto" />
                </figure>
              </section>

              <section className="pb-2">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">8.3 Montgomery County</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Montgomery County is the most active county in terms of bilateral flow volume, but its net position is approximately neutral. Virginia is the dominant inflow source at $0.3 billion, with intra-state, Ohio, Mississippi, and Texas contributing between $0.03 billion and $0.07 billion each. DOD leads inflow by agency at $0.23 billion, followed by DHS and HHS at $0.06 billion apiece. Outflows, however, are substantial: Virginia receives $0.22 billion and intra-state transfers account for $0.13 billion, with Massachusetts, Florida, and Texas absorbing smaller amounts. On the agency side, DOD outflow reaches $0.34 billion, exceeding its inflow, while HHS ($0.06 billion) and DHS ($0.05 billion) also register meaningful outflows.</p>
                  <p>Figure 10: Federal Contract Flows to Montgomery County</p>
                </div>
                <figure className="mt-8">
                  <img src={FEDERAL_FLOW_FIGURES.fig10.src} alt={FEDERAL_FLOW_FIGURES.fig10.alt} className="w-full h-auto" />
                </figure>
              </section>
            </div>
          ) : isShutdownArticle ? (
            <div className="space-y-10">
              <section className="border-b border-gray-100 pb-8">
                <div className="not-prose mb-8 bg-gray-50 border border-gray-100 p-6">
                  <p className="text-base text-gray-900 mb-2">Prepared by:</p>
                  <p className="text-base text-gray-700 mb-2">Faculty: Dr. Vojislav Maksimovic, Dr. Liu Yang</p>
                  <p className="text-base text-gray-700">Students: Kanat Isakov, Haotian Shi</p>
                </div>
                <div className="not-prose border border-gray-100 bg-white p-6 md:p-8">
                  <h2 className="text-2xl font-serif text-gray-900 mb-6">Table of Contents</h2>
                  <div className="space-y-3 text-gray-700 leading-relaxed">
                    {article.toc.map((item) => (
                      <div key={item} className="text-base">{item}</div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Executive Summary</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Maryland hosts approximately 139,000 civilian federal jobs across military and non-military agencies. Many Marylanders are also employed in federal positions located in the greater Washington, D.C. metropolitan area. Altogether, Maryland residents hold about 227,000 federal jobs. In 2023, these jobs generated an estimated $27 billion in income, accounting for 9.2% of the total adjusted gross income earned by all Marylanders.</p>
                  <p>Based on agency employment levels and their announced furlough rates, we estimate that approximately 45% of federal government employees in Maryland have been furloughed, directly affecting over 102,000 Maryland residents and resulting in an estimated temporary wage loss of $255 million per week.</p>
                </div>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Federal government shutdowns occur when Congress fails to pass appropriations legislation to fund federal government operations. During shutdowns, non-essential federal employees are furloughed without pay, leading to reduced household spending and ripple effects throughout the economy. Maryland is particularly vulnerable to shutdown impacts due to its high concentration of federal employees and defense contractors. This report quantifies the economic spillover effects of the proposed 2025 government shutdown on Maryland's economy.</p>
                </div>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">1.1 Data Sources</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>We utilize multiple data sources for this analysis:</p>
                  <p><strong><em>Federal Employee Data:</em></strong> U.S. Office of Personnel Management (OPM) salary data for Maryland federal employees by agency and county</p>
                  <p><strong><em>Furlough Rates:</em></strong> Agency contingency plans compiled by GovExec.com, indicating the percentage of employees who would be furloughed by agency (Table 1)</p>
                  <p><strong><em>IMPLAN Model:</em></strong> 2024 IMPLAN input-output model for Maryland at the county level, capturing inter-industry linkages and multiplier effects</p>
                </div>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">1.2 Key Assumptions</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Weekly economic loss per county estimated as: (county resident salary × furlough rate) / 52 weeks</p>
                  <p>Furlough rate represents the proportion of federal employees placed on unpaid leave during the shutdown</p>
                  <p>Due to lack of data on federal agency distribution across counties, we assume a uniform furlough rate across all Maryland counties</p>
                  <p>Furloughed employees receive no pay during shutdown (back pay not modeled)</p>
                </div>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">2. Federal Agency Furlough Rates</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Table 1 presents the furlough rates for 30 major federal agencies based on their 2025 contingency plans. The rates vary significantly across agencies, ranging from 0% (Smithsonian Institution) to 93% (Equal Employment Opportunity Commission and NASA). Agencies with higher proportions of employees deemed "essential" have lower furlough rates, such as the Department of the Treasury (2%) and the Department of Veterans Affairs (4%). Defense-related agencies (DOD, Army, Navy, Air Force) have uniform 45% furlough rates, reflecting the large civilian workforce supporting military operations.</p>
                  <div className="overflow-x-auto">
                    <p><strong><em>Table 1: Federal Agency Furlough Rates</em></strong></p>
                    <table className="min-w-full border border-gray-200 text-sm text-gray-700">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 border-b border-gray-200 font-semibold">Agency</th>
                          <th className="px-4 py-3 border-b border-gray-200 font-semibold">Furlough Rate (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="px-4 py-3 border-b border-gray-100">Smithsonian Institution</td><td className="px-4 py-3 border-b border-gray-100">0%</td></tr>
                        <tr><td className="px-4 py-3 border-b border-gray-100">Equal Employment Opportunity Commission</td><td className="px-4 py-3 border-b border-gray-100">93%</td></tr>
                        <tr><td className="px-4 py-3 border-b border-gray-100">NASA</td><td className="px-4 py-3 border-b border-gray-100">93%</td></tr>
                        <tr><td className="px-4 py-3 border-b border-gray-100">Department of the Treasury</td><td className="px-4 py-3 border-b border-gray-100">2%</td></tr>
                        <tr><td className="px-4 py-3 border-b border-gray-100">Department of Veterans Affairs</td><td className="px-4 py-3 border-b border-gray-100">4%</td></tr>
                        <tr><td className="px-4 py-3 border-b border-gray-100">Department of Defense (DOD)</td><td className="px-4 py-3 border-b border-gray-100">45%</td></tr>
                        <tr><td className="px-4 py-3 border-b border-gray-100">Department of the Army</td><td className="px-4 py-3 border-b border-gray-100">45%</td></tr>
                        <tr><td className="px-4 py-3 border-b border-gray-100">Department of the Navy</td><td className="px-4 py-3 border-b border-gray-100">45%</td></tr>
                        <tr><td className="px-4 py-3">Department of the Air Force</td><td className="px-4 py-3">45%</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p>Maryland hosts around 139,000 federal jobs across military and non-military agencies. Table 2 shows the distribution of employees by agency, along with average salaries and estimated salary reductions from furloughs. The Department of Health and Human Services employs the largest workforce in Maryland (41,000 employees), followed by the military services (Army: 14,500; Navy: 18,000; Defense: 12,000).</p>
                  <div className="overflow-x-auto">
                    <p><strong><em>Table 2: Federal Employees by Agency in Maryland</em></strong></p>
                    <table className="min-w-full border border-gray-200 text-sm text-gray-700">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 border-b border-gray-200 font-semibold">Agency</th>
                          <th className="px-4 py-3 border-b border-gray-200 font-semibold">Employees</th>
                          <th className="px-4 py-3 border-b border-gray-200 font-semibold">Average Salary ($k)</th>
                          <th className="px-4 py-3 border-b border-gray-200 font-semibold">Estimated Salary Reduction ($m)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="px-4 py-3 border-b border-gray-100">Department of Health and Human Services</td><td className="px-4 py-3 border-b border-gray-100">41,000</td><td className="px-4 py-3 border-b border-gray-100">Not specified in text</td><td className="px-4 py-3 border-b border-gray-100">Not specified in text</td></tr>
                        <tr><td className="px-4 py-3 border-b border-gray-100">Army</td><td className="px-4 py-3 border-b border-gray-100">14,500</td><td className="px-4 py-3 border-b border-gray-100">Not specified in text</td><td className="px-4 py-3 border-b border-gray-100">Not specified in text</td></tr>
                        <tr><td className="px-4 py-3 border-b border-gray-100">Navy</td><td className="px-4 py-3 border-b border-gray-100">18,000</td><td className="px-4 py-3 border-b border-gray-100">Not specified in text</td><td className="px-4 py-3 border-b border-gray-100">Not specified in text</td></tr>
                        <tr><td className="px-4 py-3 border-b border-gray-100">Defense</td><td className="px-4 py-3 border-b border-gray-100">12,000</td><td className="px-4 py-3 border-b border-gray-100">Not specified in text</td><td className="px-4 py-3 border-b border-gray-100">Not specified in text</td></tr>
                        <tr><td className="px-4 py-3">All federal agencies in Maryland</td><td className="px-4 py-3">~139,000</td><td className="px-4 py-3">Not specified in text</td><td className="px-4 py-3">~8,000</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p>The total estimated direct salary impact from the furloughs amounts to approximately $8 billion. The Department of Health and Human Services, the Department of Commerce, and the Navy account for the largest salary reductions due to their substantial furlough rates.</p>
                  <div className="overflow-x-auto">
                    <p><strong><em>Table 3: Military vs Non-Military Salary Data</em></strong></p>
                    <table className="min-w-full border border-gray-200 text-sm text-gray-700">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 border-b border-gray-200 font-semibold">Category</th>
                          <th className="px-4 py-3 border-b border-gray-200 font-semibold">Salary ($k)</th>
                          <th className="px-4 py-3 border-b border-gray-200 font-semibold">Furlough Rate (%)</th>
                          <th className="px-4 py-3 border-b border-gray-200 font-semibold">Employees</th>
                          <th className="px-4 py-3 border-b border-gray-200 font-semibold">Salary Deduction ($m)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-3 border-b border-gray-100">Military</td>
                          <td className="px-4 py-3 border-b border-gray-100">130</td>
                          <td className="px-4 py-3 border-b border-gray-100">45</td>
                          <td className="px-4 py-3 border-b border-gray-100">46,000</td>
                          <td className="px-4 py-3 border-b border-gray-100">2,600</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Non-Military</td>
                          <td className="px-4 py-3">140</td>
                          <td className="px-4 py-3">40</td>
                          <td className="px-4 py-3">93,000</td>
                          <td className="px-4 py-3">5,200</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p>Table 3 compares military versus non-military federal employees in Maryland. Non-military employees constitute 67% of the federal workforce in Maryland (93,000 employees) with an average salary of $140,000, while military-affiliated civilians represent 33% (46,000 employees) with an average salary of $130,000. The military sector faces a higher average furlough rate (45%) compared to non-military agencies (40%), resulting in a direct salary reduction of $3 billion for military-affiliated employees and $5 billion for non-military employees.</p>
                  <p>Figure 1: Federal Employee Salaries by Maryland County</p>
                </div>
                <figure className="mt-8">
                  <img src={SHUTDOWN_FIGURES.fig1.src} alt={SHUTDOWN_FIGURES.fig1.alt} className="w-full h-auto" />
                </figure>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">3. Results: Economic Impact Analysis</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Figure 1 shows the geographic distribution of federal employee salaries across Maryland counties. Montgomery and Prince George's counties exhibit the highest concentrations at approximately $7 billion each, accounting for nearly 50% of the state's total federal payroll. This spatial clustering reflects the proximity to Washington D.C. and the concentration of federal agencies in the Capital Region. Counties farther from the metropolitan corridor show substantially lower federal salary levels, with rural areas such as Garrett and Kent counties each accounting for less than $15 million annually.</p>
                  <p>Given our assumption of a uniform 45% furlough rate across all counties, the weekly wage deduction for each county is directly proportional to its total resident salary. Therefore, the spatial pattern of economic impacts mirrors the salary distribution shown in Figure 1, with Montgomery and Prince George's counties bearing the largest absolute losses.</p>
                  <div className="overflow-x-auto">
                    <p><strong><em>Table 4: Federal Employee Furlough Impact</em></strong></p>
                    <table className="min-w-full border border-gray-200 text-sm text-gray-700">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 border-b border-gray-200 font-semibold">Metric</th>
                          <th className="px-4 py-3 border-b border-gray-200 font-semibold">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="px-4 py-3 border-b border-gray-100">Maryland Federal Employee Resident</td><td className="px-4 py-3 border-b border-gray-100">227,000</td></tr>
                        <tr><td className="px-4 py-3 border-b border-gray-100">Total Wage ($, Billion)</td><td className="px-4 py-3 border-b border-gray-100">29</td></tr>
                        <tr><td className="px-4 py-3 border-b border-gray-100">Furlough Rate (%)</td><td className="px-4 py-3 border-b border-gray-100">45%</td></tr>
                        <tr><td className="px-4 py-3 border-b border-gray-100">Affected Resident</td><td className="px-4 py-3 border-b border-gray-100">102,000</td></tr>
                        <tr><td className="px-4 py-3 border-b border-gray-100">Weekly Wage Deduction ($, Million)</td><td className="px-4 py-3 border-b border-gray-100">255</td></tr>
                        <tr><td className="px-4 py-3">Induced Weekly Wage Deduction ($, Million)</td><td className="px-4 py-3">23</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p>Table 4 summarizes the baseline parameters for Maryland's federal workforce and the estimated shutdown impact. Maryland hosts approximately 227,000 federal employee residents with a combined annual wage of $29 billion. Applying the weighted average furlough rate of 45% across agencies, we estimate that 102,000 employees would be affected, resulting in a direct weekly wage reduction of $255 million. Using the IMPLAN input-output model with this weekly wage shock as the primary input, we calculate an induced weekly wage deduction of $23 million across Maryland's economy, reflecting the multiplier effects as reduced household spending cascades through various sectors.</p>
                </div>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">3.1 Employee Compensation Impact by County</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>The direct wage impact varies across counties. Seven counties are projected to experience temporary weekly income losses exceeding $10 million, including Montgomery ($64 million), Prince George's ($63 million), Anne Arundel (23 million), Charles County ($18 million), Baltimore County ($17 million), Howard County ($14 million), and Baltimore city (10 million).</p>
                  <p>Figure 2: Employee Compensation Impact by County ($ Million)</p>
                </div>
                <figure className="mt-8">
                  <img src={SHUTDOWN_FIGURES.fig2.src} alt={SHUTDOWN_FIGURES.fig2.alt} className="w-full h-auto" />
                </figure>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">3.2 Induced Economic Impact by Industry</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Beyond these direct wage effects, the shutdown will generate substantial induced economic impacts across Maryland. The loss of $255 million in weekly wages will ripple through local economies as affected households cut back on discretionary spending. Industries most sensitive to changes in consumer demand, such as professional and personal services, healthcare, retail trade, restaurants and food services, transportation, and housing, are expected to experience immediate slowdowns in sales and output. Using IMPLAN estimates, the induced effects on output are projected to reach approximately $75 million per week, or about 29% of the direct wage loss. Figure 3 below provides the estimated induced effect by industry.</p>
                  <p>Figure 3: Industries by Induced Output ($ Million)</p>
                </div>
                <figure className="mt-8">
                  <img src={SHUTDOWN_FIGURES.fig3.src} alt={SHUTDOWN_FIGURES.fig3.alt} className="w-full h-auto" />
                </figure>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">3.3 Total Economic Impact Across by County</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>The scale of these secondary effects depends on local spending patterns and the strength of inter-industry linkages. Counties with high concentrations of federal employees and contractors are likely to face the largest spillovers, including lower business revenues, reduced sales tax receipts, and short-term contractions in service activity.</p>
                  <p>Figure 4: Direct Compensation + Induced Output by County ($ Million)</p>
                </div>
                <figure className="mt-8">
                  <img src={SHUTDOWN_FIGURES.fig4.src} alt={SHUTDOWN_FIGURES.fig4.alt} className="w-full h-auto" />
                </figure>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">3.4 County-Industry Breakdown</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>To understand the geographic distribution of industry-specific impacts, we examine the top five industries by output and employee compensation for eight major Maryland counties: Montgomery, Prince George's, Anne Arundel, Charles, Baltimore County, Baltimore City, Howard, and Harford. We focus on these counties as they collectively account for $220 million, or 87%, of Maryland's total $255 million weekly resident wage deduction, thereby capturing the vast majority of the state's economic exposure to federal shutdowns.</p>
                </div>
              </section>

              <section className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">3.4.1 Employee Compensation Impact by County and Industry</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Figure 5 illustrates the spillover effects of federal government shutdowns on Maryland's workforce, showing how reduced federal employee spending cascades into wage losses for workers in other industries. Labor-intensive service sectors bear the largest induced compensation impacts across nearly all counties, with services, medical, and retail industries consistently ranking among the most affected.</p>
                  <p>Notably, while housing shows substantial output impacts across counties (Figure 6), it generates relatively modest compensation effects, reflecting its capital-intensive nature and lower employment density. The geographic concentration of induced wage losses in the Washington-Baltimore corridor, particularly in Montgomery, Prince George's, and Anne Arundel counties, indicates that labor-market spillovers from federal shutdowns are highly localized. Workers in service industries within these counties face dual vulnerability: geographic proximity to federal employment centers and employment in sectors with high income volatility, making them particularly exposed to the cascading economic effects of government funding disruptions.</p>
                  <p>Figure 5: Top 5 Industries by Induced Employee Compensation for Selected Counties</p>
                </div>
                <figure className="mt-8">
                  <img src={SHUTDOWN_FIGURES.fig5.src} alt={SHUTDOWN_FIGURES.fig5.alt} className="w-full h-auto" />
                </figure>
              </section>

              <section className="pb-2">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">3.4.2 Output Impact by County and Industry</h2>
                <div className="space-y-4 text-gray-700 leading-8">
                  <p>Figure 6 reveals substantial heterogeneity in industry-specific output vulnerabilities across Maryland's major counties. Service-oriented sectors consistently rank among the most affected industries.</p>
                  <p>Charles County displays a distinctive profile, with housing ($1.5 million) surpassing services ($1 million) as the dominant affected sector, potentially reflecting unique local housing market characteristics that amplify residential real estate exposure to federal income shocks. Anne Arundel, Baltimore County, Harford, and Howard counties follow more typical patterns with services leading, though magnitudes vary considerably. Baltimore City, despite its smaller federal employee base, shows service dominance ($1 million) alongside significant medical sector exposure ($0.3 million), reflecting its role as a regional healthcare hub.</p>
                  <p>Figure 6: Top 5 Industries by Induced Output for Selected Counties</p>
                </div>
                <figure className="mt-8">
                  <img src={SHUTDOWN_FIGURES.fig6.src} alt={SHUTDOWN_FIGURES.fig6.alt} className="w-full h-auto" />
                </figure>
              </section>
            </div>
          ) : (
            <>
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
                      <ul className="mt-5 list-disc pl-6 space-y-2 text-gray-700 leading-7">
                        {section.bullets.map((bullet) => (
                          <li key={`${section.title}-${bullet}`}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </div>
            </>
          )}
        </article>
      </div>
    </div>
  );
};

export default ResearchDetail;

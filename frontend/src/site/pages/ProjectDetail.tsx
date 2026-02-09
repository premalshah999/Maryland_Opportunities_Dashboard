import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, Download, ExternalLink, BarChart3 } from 'lucide-react';

// Project content data
const projectContent: Record<string, {
    title: string;
    partner: string | null;
    partnerFull?: string;
    category: string;
    date: string;
    image: string;
    summary: string;
    content: React.ReactNode;
    dataLink?: string;
    reportLink?: string;
    materialsLink?: string;
}> = {
    'ewa': {
        title: 'Earned Wage Access',
        partner: 'Department of Labor',
        partnerFull: 'Maryland Department of Labor',
        category: 'Financial Inclusion',
        date: 'March 2025',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200&h=600',
        summary: 'Smith School students provide Maryland legislators with key insights on earned wage access regulations and consumer protection.',
        dataLink: '/data/maryland/finra',
        materialsLink: 'https://www.rhsmith.umd.edu/news/smith-school-students-equip-maryland-legislators-key-insights-earned-wage-access',
        content: (
            <>
                <figure className="mb-8">
                    <img src="/assets/ewa_team.jpg" alt="EWA Team" className="w-full h-auto rounded-lg mb-3 shadow-sm" />
                    <figcaption className="text-sm text-gray-500 leading-relaxed italic">
                        First row (from left to right): Shrenik Kalambur (UMD), Amy Heenen (Labor), Commissioner Antonio Salazar, Kat Kyland (Labor), Secretary Portia Wu, Liu Yang (UMD), Yun Wang (UMD); second row (from left to right): Sai Shashank Gorthy (UMD), Yentell James (UMD), Pranay Upreti (UMD), and Rivado Edah (UMD).
                    </figcaption>
                </figure>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-10 mb-4">Project Overview</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    Beginning in October 2024 and continuing into the 2025 spring semester, a team of students from the Master of Finance and Master of Quantitative Finance programs, led by Professor Liu Yang and Professor Vojislav Maksimovic, conducted in-depth research and provided policy recommendations on the state's earned wage access (EWA) regulations.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                    Often referred to as "on-demand pay," an EWA service operates similarly to a payday loan, allowing employees to link their bank accounts to a lending service and receive an advance on their future paycheck. In contrast to payday loans, EWA services are not considered loans and therefore do not fall within the scope of traditional lending standards and regulations.
                </p>

                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-10 mb-4">Research Methodology</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    Students were tasked with evaluating the impact of the state's EWA program on consumers and assessing whether existing regulatory frameworks adequately addressed emerging risks.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                    To do so, the state provided students with a market data inquiry that requested information from all EWA providers in Maryland, including the number of users and the amount of revenue earned. These data were combined with external sources, including FINRA's National Financial Capability Study and U.S. Census Bureau demographic data, to develop a comprehensive profile of EWA usage across communities and demographic groups.
                </p>

                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-10 mb-4">Key Findings</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    In March, the students presented their findings and policy recommendations to Maryland legislators, including Maryland Secretary of Labor Portia Wu and the Commissioner of Financial Regulation, Antonio Salazar. On the same day, the team attended a Finance Committee hearing in which a bill regulating EWA providers was discussed, with direct references made to the students' research.
                </p>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-6 my-8">
                    <h3 className="font-bold text-amber-900 mb-3">Critical Discovery: Unequal Exposure and Hidden APR Costs</h3>
                    <p className="text-amber-800 mb-4">
                        The analysis reveals that EWA usage is disproportionately concentrated in communities with lower income, lower education, and lower levels of financial literacy. It is also more prevalent in communities with higher percentages of Black and Hispanic residents. Many users rely on these services repeatedly, signaling a growing dependence rather than occasional use.
                    </p>
                    <p className="text-amber-800">
                        Although EWA products are often advertised as low-cost or fee-free, most users pay voluntary tips and service fees. When translated into an annual percentage rate (APR), these payments frequently exceed 100% for a two-week advance, far higher than the roughly 20% APR typical of traditional credit products. Notably, users often make these voluntary payments despite already facing financial constraints.
                    </p>
                </div>

                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-10 mb-4">Policy Impact</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    The findings highlight critical gaps in the current regulatory framework governing Earned Wage Access services. While EWA products fall outside traditional lending laws, their economic impact on consumers, particularly vulnerable populations, can rival or exceed that of regulated credit products.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                    The project demonstrates how data-driven academic research can equip policymakers with timely, evidence-based insights to better evaluate emerging financial products, assess consumer risks, and design targeted regulatory responses. More broadly, it underscores the role of universities as neutral, analytical partners in public policy, bridging the gap between innovation and consumer protection while helping governments manage financial risk and promote equitable economic outcomes.
                </p>
            </>
        )
    },
    'fed-spending': {
        title: 'Federal Spending in Maryland',
        partner: "Comptroller's Office",
        partnerFull: "Maryland Comptroller's Office",
        category: 'Economic Analysis',
        date: 'January 2025',
        image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200&h=600',
        summary: 'Federal Spending in Maryland - Historical Analysis on Federal Spending in MD and Scenario analysis on how proposed cuts would impact Maryland\'s economy',
        dataLink: '/dashboard/government-spending',
        reportLink: 'https://www.marylandcomptroller.gov/content/dam/mdcomp/md/reports/research/federal-spending-in-md.pdf',
        content: (
            <>
                <figure className="mb-8">
                    <img src="/assets/fed_spending_team.jpg" alt="Federal Spending Team" className="w-full h-auto rounded-lg mb-3 shadow-sm" />
                    <figcaption className="text-sm text-gray-500 leading-relaxed italic">
                        From left to right: Haotian Shi (UMD), Vojislav Maksimovic (UMD), Liu Yang (UMD), Comptroller Brook Lierman, Pablo Gomez (Comptroller), Pranshu Sahasrabuddhe (UMD), Annie Alexander (Comptroller), Deputy Comptroller Ben Siegel.
                    </figcaption>
                </figure>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-10 mb-4">Project Overview</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    In 2025, the University of Maryland's Robert H. Smith School of Business partnered with the Maryland Comptroller's Office to examine the role of federal government spending and employment in Maryland's economy. Led by Professor Liu Yang and Professor Vojislav Maksimovic, the project analyzed how federal wages, contracts, grants, and direct payments shape economic activity across the state.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                    The collaboration produced a comprehensive assessment of Maryland's reliance on federal activity, culminating in a joint report showing that the federal government directed approximately $150 billion into Maryland in the most recent fiscal year. This spending supports hundreds of thousands of jobs and represents a critical pillar of the state's economic stability.
                </p>

                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-10 mb-4">Research Methodology</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    Eight Master of Finance students, two PhD candidates, and faculty advisors compiled and analyzed publicly available federal datasets at a highly granular level. Using sources such as federal employment records, USASpending data, and Census Bureau statistics, the team examined trends in federal employment, wages, contracts, and grants over the past decade.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                    The analysis focused on identifying geographic and sectoral patterns in federal spending and quantifying the economic outcomes for Maryland residents and counties resulting from changes in federal employment and agency activity.
                </p>

                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-10 mb-4">Key Findings</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    The initiative consisted of three integrated components:
                </p>

                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 my-8">
                    <h3 className="font-bold text-gray-900 mb-4">Three Integrated Components</h3>

                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-umd-red mb-2">1. Historical Data Analysis</h4>
                            <p className="text-gray-600 text-sm">
                                Students compiled and analyzed more than a decade of federal spending and employment data to quantify the scale, composition, and geographic distribution of federal economic activity in Maryland. This phase established a baseline understanding of the extent to which the state's economy depends on federal wages, contracts, grants, and direct payments.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-umd-red mb-2">2. Policy-Driven Scenario Analysis</h4>
                            <p className="text-gray-600 text-sm">
                                Building on the historical foundation, the team developed scenario analysis to assess the potential economic impacts of recent and proposed federal spending and workforce reductions. Using agency-specific case studies, including cuts to the Department of Health and Human Services and the closure of USAID, the analysis estimated direct effects on jobs, wages, grants, and contracts at both the state and county levels.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-umd-red mb-2">3. Interactive Dashboards</h4>
                            <p className="text-gray-600 text-sm">
                                The project produced a set of interactive dashboards designed for policymakers and the public. These visualization tools enable users to explore historical trends and model the potential effects of future changes in federal spending across Maryland communities, transforming complex datasets into accessible, decision-ready information.
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-gray-600 leading-relaxed mb-4">
                    Together, these three components—historical analysis, scenario modeling, and interactive visualization—form a comprehensive framework for understanding and managing the economic risks associated with shifts in federal spending and employment.
                </p>

                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-10 mb-4">Policy Implications</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    The project highlights the economic risks associated with abrupt federal spending and workforce reductions in states with deep federal ties. By translating complex federal data into clear, actionable insights, the research equips state leaders with the evidence needed to anticipate economic shocks, plan budgets, and protect vulnerable communities.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                    More broadly, the collaboration demonstrates the critical role universities can play as analytical partners to government. By combining academic expertise with real-world policy questions, the project highlights how data-driven research can inform decision-making, improve risk management, and support economic resilience.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8">
                    <h3 className="font-bold text-blue-900 mb-3">Explore the Project Outputs</h3>
                    <ul className="space-y-2 text-blue-800">
                        <li>
                            <a
                                href="https://www.marylandcomptroller.gov/content/dam/mdcomp/md/reports/research/federal-spending-in-md.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline flex items-center gap-1"
                            >
                                <ExternalLink size={14} />
                                Federal Spending in MD (PDF)
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://www.marylandcomptroller.gov/content/dam/mdcomp/md/reports/research/federal-spending-scenario-analysis.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline flex items-center gap-1"
                            >
                                <ExternalLink size={14} />
                                Federal Spending Scenario Analysis (PDF)
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://dashboards.marylandtaxes.gov/com-dashboards/fed-impact.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline flex items-center gap-1"
                            >
                                <ExternalLink size={14} />
                                Federal Impact Dashboard
                            </a>
                        </li>
                    </ul>
                </div>
            </>
        )
    },
    'business-survey': {
        title: 'Maryland Business Climate Survey 2025',
        partner: null,
        category: 'Business Research',
        date: 'February 2025',
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200&h=600',
        summary: 'Comprehensive survey examining the current state of business conditions, challenges, and opportunities across Maryland industries.',
        reportLink: '/assets/reports/2025-maryland-business-climate-survey.pdf',
        content: (
            <>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    The Maryland Business Climate Survey 2025 provides a comprehensive snapshot of the state's business environment, capturing sentiment, challenges, and opportunities across diverse industry sectors.
                </p>

                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-10 mb-4">Survey Objectives</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    This annual survey aims to capture the pulse of Maryland's business community, providing policymakers and economic development officials with actionable data on business conditions across the state.
                </p>

                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 my-8">
                    <h3 className="font-bold text-gray-900 mb-3">Topics Covered</h3>
                    <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="text-umd-red mt-1">•</span>
                            Overall business confidence and economic outlook
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-umd-red mt-1">•</span>
                            Workforce challenges and hiring conditions
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-umd-red mt-1">•</span>
                            Regulatory environment and compliance costs
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-umd-red mt-1">•</span>
                            Access to capital and financing
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-umd-red mt-1">•</span>
                            Technology adoption and digital transformation
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-umd-red mt-1">•</span>
                            Supply chain challenges and opportunities
                        </li>
                    </ul>
                </div>

                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-10 mb-4">Methodology</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    The survey was distributed to businesses across all 23 Maryland counties and Baltimore City, with responses stratified by industry sector, company size, and geographic region to ensure representative sampling.
                </p>
            </>
        )
    },
    'veterans-housing': {
        title: 'Housing for Veterans',
        partner: 'Veterans Affairs',
        partnerFull: 'Maryland Department of Veterans and Military Families',
        category: 'Social Impact',
        date: 'December 2024',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200&h=600',
        summary: 'Research on military retirees in Maryland: factors influencing residence choice and economic impact analysis of military retirement income tax exemption.',
        materialsLink: '/assets/reports/mdva-final-report-research-methods-and-technical-notes.pdf',
        content: (
            <>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    This project examined the potential impact of higher exemption levels for state and local income taxes on military retirement income. Such exemptions would reduce state and local tax revenue collections but may have positive effects on military retirees' decisions to choose Maryland as their legal residence.
                </p>

                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-10 mb-4">Research Questions</h2>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 my-8">
                    <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="text-umd-red font-bold mt-0.5">1.</span>
                            What factors influence military retirees' decision to choose a state as their legal residence?
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-umd-red font-bold mt-0.5">2.</span>
                            What is the net economic impact on Maryland of higher exemption levels based on these identified factors?
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-umd-red font-bold mt-0.5">3.</span>
                            When and how can Maryland potentially recover the foregone revenue from military retirement tax exemptions?
                        </li>
                    </ul>
                </div>

                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-10 mb-4">Key Factors in Residence Choice</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    The study conducted a comprehensive review of existing literature and interviews to identify key factors:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-bold text-gray-900 mb-2">Strong Veteran Community</h4>
                        <p className="text-sm text-gray-600">Presence of active-duty personnel and military installations</p>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-bold text-gray-900 mb-2">Employment Opportunities</h4>
                        <p className="text-sm text-gray-600">Thriving private sector with government and construction jobs</p>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-bold text-gray-900 mb-2">Cost of Living</h4>
                        <p className="text-sm text-gray-600">Competitive living costs relative to income potential</p>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-bold text-gray-900 mb-2">Favorable Tax Policies</h4>
                        <p className="text-sm text-gray-600">Tax exemptions and benefits for military retirees</p>
                    </div>
                </div>

                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-10 mb-4">Economic Impact Analysis</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    The study modeled the net economic impact of tax exemptions. While initial revenue loss is projected, the model suggests a long-term positive impact on state revenue due to factors like increased spending by retirees, sales tax, and property taxes.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                    To offset foregone income tax revenue from increased exemptions, Maryland can:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                    <li>Draw existing military retirees from other states</li>
                    <li>Attract newly retired military personnel</li>
                    <li>Assist existing retirees in achieving higher incomes</li>
                </ul>

                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-10 mb-4">Comparative Analysis</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    The study included a comparative analysis of Maryland versus states with the largest military retiree populations (Texas, Florida, and California).
                </p>

                <div className="bg-green-50 border-l-4 border-green-500 p-6 my-8">
                    <h3 className="font-bold text-green-900 mb-3">Maryland's Strengths</h3>
                    <ul className="space-y-1 text-green-800">
                        <li>• Competitive benefits including some tax benefits</li>
                        <li>• State scholarships for veterans</li>
                        <li>• Hiring preferences for veterans</li>
                        <li>• Comprehensive healthcare support</li>
                    </ul>
                </div>

                <div className="bg-red-50 border-l-4 border-red-500 p-6 my-8">
                    <h3 className="font-bold text-red-900 mb-3">Areas for Improvement</h3>
                    <ul className="space-y-1 text-red-800">
                        <li>• Income tax relief (lags behind comparison states)</li>
                        <li>• Property tax exemptions</li>
                        <li>• Home loan programs</li>
                        <li>• Number of veterans' homes</li>
                        <li>• Comprehensive educational benefits</li>
                    </ul>
                </div>
            </>
        )
    }
};

export const ProjectDetail: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();

    const project = projectId ? projectContent[projectId] : null;

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
                    <Link to="/projects" className="text-umd-red hover:underline">
                        ← Back to Projects
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Hero Section */}
            <div className="relative h-[40vh] min-h-[300px] bg-gray-900">
                <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-gray-900/30" />

                {/* Back Button */}
                <button
                    onClick={() => navigate('/projects')}
                    className="absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm font-medium">Back to Projects</span>
                </button>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <span className="text-umd-gold font-bold text-xs uppercase tracking-widest">
                                {project.category}
                            </span>
                            {project.partner && (
                                <span className="flex items-center gap-1.5 text-white/70 text-xs">
                                    <Building2 size={12} />
                                    {project.partnerFull || project.partner}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5 text-white/70 text-xs">
                                <Calendar size={12} />
                                {project.date}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-serif font-bold text-white">
                            {project.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-10 pb-8 border-b border-gray-200">
                    {project.dataLink && (
                        <Link
                            to={project.dataLink}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-umd-red text-white font-bold text-sm rounded-sm hover:bg-umd-red/90 transition-colors"
                        >
                            <BarChart3 size={18} />
                            Explore Data Visualization
                        </Link>
                    )}
                    {project.reportLink && (
                        <a
                            href={project.reportLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold text-sm rounded-sm hover:bg-gray-800 transition-colors"
                        >
                            <Download size={18} />
                            Download Report
                        </a>
                    )}
                    {project.materialsLink && (
                        <a
                            href={project.materialsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 text-gray-700 font-bold text-sm rounded-sm hover:border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            <ExternalLink size={18} />
                            View Source Materials
                        </a>
                    )}
                </div>

                {/* Summary */}
                <p className="text-xl text-gray-500 font-light leading-relaxed mb-8">
                    {project.summary}
                </p>

                {/* Main Content */}
                <article className="prose prose-lg max-w-none">
                    {project.content}
                </article>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-gray-200">
                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-2 text-gray-900 font-bold hover:text-umd-red transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back to All Projects
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;

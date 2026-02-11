import React, { lazy, Suspense } from "react";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Layout } from "./site/components/Layout";

const Home = lazy(() => import("./site/pages/Home").then((m) => ({ default: m.Home })));
const About = lazy(() => import("./site/pages/About").then((m) => ({ default: m.About })));
const Team = lazy(() => import("./site/pages/Team").then((m) => ({ default: m.Team })));
const TeamMemberBio = lazy(() =>
  import("./site/pages/TeamMemberBio").then((m) => ({ default: m.TeamMemberBio }))
);
const Contact = lazy(() =>
  import("./site/pages/Contact").then((m) => ({ default: m.Contact }))
);
const Research = lazy(() =>
  import("./site/pages/Research").then((m) => ({ default: m.Research }))
);
const Dashboards = lazy(() =>
  import("./site/pages/Dashboards").then((m) => ({ default: m.Dashboards }))
);
const EwaResearchScatter = lazy(() =>
  import("./site/pages/EwaResearchScatter").then((m) => ({ default: m.EwaResearchScatter }))
);
const Data = lazy(() => import("./site/pages/Data").then((m) => ({ default: m.Data })));
const Projects = lazy(() =>
  import("./site/pages/Projects").then((m) => ({ default: m.Projects }))
);
const ProjectDetail = lazy(() =>
  import("./site/pages/ProjectDetail").then((m) => ({ default: m.ProjectDetail }))
);
const ComingSoon = lazy(() =>
  import("./site/pages/ComingSoon").then((m) => ({ default: m.ComingSoon }))
);
const DashboardApp = lazy(() => import("./DashboardApp.jsx"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-2 border-gray-200 border-t-umd-red rounded-full animate-spin" />
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const withLayout = (element) => <Layout>{element}</Layout>;

const App = () => (
  <HashRouter>
    <ScrollToTop />
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/dashboard" element={<DashboardApp />} />
        <Route path="/dashboard/*" element={<DashboardApp />} />
        <Route path="/" element={withLayout(<Home />)} />
        <Route path="/about" element={withLayout(<About />)} />
        <Route path="/about/team" element={withLayout(<Team />)} />
        <Route path="/about/team/:memberId" element={withLayout(<TeamMemberBio />)} />
        <Route path="/about/contact" element={withLayout(<Contact />)} />
        <Route path="/research/earned-wage-access" element={withLayout(<EwaResearchScatter />)} />
        <Route path="/research" element={withLayout(<Research />)} />
        <Route path="/research/*" element={withLayout(<Research />)} />
        <Route path="/dashboards" element={withLayout(<Dashboards />)} />
        <Route path="/data" element={withLayout(<Data />)} />
        <Route path="/data/*" element={withLayout(<Data />)} />
        <Route path="/projects" element={withLayout(<Projects />)} />
        <Route path="/projects/:projectId" element={withLayout(<ProjectDetail />)} />
        <Route path="/coming-soon" element={withLayout(<ComingSoon />)} />
        <Route path="/impact" element={<Navigate to="/projects" replace />} />
        <Route path="/impact/*" element={<Navigate to="/projects" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </HashRouter>
);

export default App;

import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
//
import BookFinacial from './pages/bookfinacial/BookFinacial';
import LoginPage from './pages/Login';
import Page404 from './pages/Page404';
import DashboardApp from './pages/DashboardApp';
import DetailBookFinacial from './pages/bookfinacial/DetailBookFinacial';
import MainChart from './pages/chart/MainChart';
import Report from './pages/report/Report';
import AccoutingFinacial from './pages/bookfinacial/AccoutingFinacial';
import DetailAccoutingFinacial from './pages/bookfinacial/DetailAccoutingFinacial';
import AccountModify from './pages/bookfinacial/AccountModify';
import Recipe from './pages/bookfinacial/Recipe';
import AccountModifyDetail from './pages/bookfinacial/AccountModifyDetail';
import CompanyObjective from './pages/objective/CompanyObjective';
import CompanyObjecyiveDetail from './pages/objective/CompanyObjecyiveDetail';
import DetailObjectiveLine from './pages/objective/DetailObjectiveLine';
import ObjectiveViewOnly from './pages/objective/ObjectiveViewOnly';
import ObjecyiveDetailViewOnly from './pages/objective/ObjecyiveDetailViewOnly';

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          element: <Navigate to="/login" replace />
        },
        // { index: true, path: 'app', element: <DashboardApp /> },

        { index: true, path: 'app', element: <MainChart /> },


        { path: 'book-financial', element: <BookFinacial /> },

        { path: 'account-modify', element: <AccountModify /> },

        { path: 'account-modify/detail', element: <AccountModifyDetail /> },

        { path: 'recipe', element: <Recipe /> },

        { path: 'company-objective', element: <CompanyObjective /> },

        { path: 'objective', element: <ObjectiveViewOnly /> },

        { path: 'objective/detail', element: <ObjecyiveDetailViewOnly /> },

        { path: 'company-objective/detail', element: <CompanyObjecyiveDetail /> },

        { path: 'objective-line/detail', element: <DetailObjectiveLine /> },

        { path: 'book-financial/detail', element: <DetailBookFinacial /> },

        { path: 'accouting-financial', element: <AccoutingFinacial /> },

        { path: 'accouting-financial/detail', element: <DetailAccoutingFinacial /> },

        { path: 'report', element: <Report /> },

        { path: 'chart', element: <MainChart /> },

        { path: 'chart-business', element: <MainChart /> },

        { path: 'chart-expenses', element: <MainChart /> },

        { path: 'chart-selling-expenses', element: <MainChart /> },

        { path: 'chart-management-expenses', element: <MainChart /> },

        { path: 'chart-control-index', element: <MainChart /> },

        { path: 'selling', element: <Report /> },

        { path: 'chart-selling', element: <MainChart /> },

      ],
    },

    {
      path: 'login',
      element: <LoginPage />,
    },

    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/app" />, index: true },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}

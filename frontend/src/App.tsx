import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { FullPageLoader } from './components/common/FullPageLoader';
import { applicationRouter } from './components/routing/application-router';

export default function App() {
  return (
    // Outside the app layout (login, sign-up, error pages) a loading page shows the spinner
    <Suspense fallback={<FullPageLoader />}>
      <RouterProvider router={applicationRouter} />
    </Suspense>
  );
}

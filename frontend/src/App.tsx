import { RouterProvider } from 'react-router';
import { applicationRouter } from './components/routing/application-router';

export default function App() {
  return <RouterProvider router={applicationRouter} />;
}

import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { WeaponsPage } from "./pages/WeaponsPage";
import { WeaponDetailPage } from "./pages/WeaponDetailPage";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { weaponLoader } from "./core/services/weaponLoader";
import type { IImageStorage } from "./core/ports/IImageStorage";

interface AppProps {
  imageStorage: IImageStorage;
}

export function App({ imageStorage }: AppProps) {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/weapons" replace />,
    },
    {
      path: "/weapons",
      element: <WeaponsPage />,
      loader: weaponLoader,
      errorElement: <ErrorBoundary />,
    },
    {
      path: "/weapons/:weaponId",
      element: <WeaponDetailPage imageStorage={imageStorage} />,
      loader: weaponLoader,
      errorElement: <ErrorBoundary />,
    },
  ]);

  return <RouterProvider router={router} />;
}

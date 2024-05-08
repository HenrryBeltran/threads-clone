/* @refresh reload */
import { render } from "solid-js/web";

import "@/index.css";
import { Route, Router } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import { lazy } from "solid-js";

import RootLayout from "@/layouts/root-layout";
import Activity from "@/pages/activity";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Search from "@/pages/search";

const root = document.getElementById("root");

const queryClient = new QueryClient();

const Login = lazy(() => import("@/pages/login"));
const ForgottenPassword = lazy(() => import("@/pages/forgotten-password"));
const NotFound = lazy(() => import("@/pages/not-found"));
const MainLayout = lazy(() => import("@/layouts/main-layout"));

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <SolidQueryDevtools initialIsOpen={false} />
      <Router root={RootLayout}>
        <Route component={MainLayout}>
          <Route path="/" component={Home} />
          <Route path="/search" component={Search} />
          <Route path="/activity" component={Activity} />
          <Route path="/:username" component={Profile} />
        </Route>
        <Route path="/login" component={Login} />
        <Route path="/forgotten-password" component={ForgottenPassword} />
        <Route path="*" component={NotFound} />
      </Router>
    </QueryClientProvider>
  ),
  root!,
);

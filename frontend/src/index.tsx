/* @refresh reload */
import { render } from "solid-js/web";

import { Route, Router } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import "./index.css";
import MainLayout from "./layouts/main-layout";
import RootLayout from "./layouts/root-layout";
import About from "./routes/about";
import Home from "./routes/home";
import Login from "./routes/login";
import NotFound from "./routes/not-found";

const root = document.getElementById("root");

const queryClient = new QueryClient();

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <SolidQueryDevtools initialIsOpen={false} />
      <Router root={RootLayout}>
        <Route component={MainLayout}>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
        </Route>
        <Route path="/login" component={Login} />
        <Route path="*" component={NotFound} />
      </Router>
    </QueryClientProvider>
  ),
  root!,
);

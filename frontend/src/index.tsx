/* @refresh reload */
import { render } from "solid-js/web";

import { Route, Router } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import "./index.css";
import About from "./routes/about";
import Home from "./routes/home";
import RootLayout from "./routes/root-layout";

const root = document.getElementById("root");

const queryClient = new QueryClient();

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <SolidQueryDevtools initialIsOpen={false} />
      <Router root={RootLayout}>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
      </Router>
    </QueryClientProvider>
  ),
  root!,
);

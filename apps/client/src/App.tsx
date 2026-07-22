import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import LinkDetail from "@/pages/link-detail";
import Collections from "@/pages/collections";
import CollectionDetail from "@/pages/collection-detail";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import Signup from "@/pages/signup";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/link/:id" component={() => <ProtectedRoute component={LinkDetail} />} />
      <Route path="/collections" component={() => <ProtectedRoute component={Collections} />} />
      <Route path="/collections/:id" component={() => <ProtectedRoute component={CollectionDetail} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
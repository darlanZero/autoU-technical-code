import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Public routes
  index("routes/home.tsx"),
  
  // Auth routes with layout
  layout("routes/auth/authLayout.tsx", [
    route("/login", "routes/auth/login.tsx"),
    route("/register", "routes/auth/register.tsx"),
  ]),
  
  // Internal routes with layout  
  layout("routes/internal/internalLayout.tsx", [
    route("/dashboard", "routes/internal/dashboard/dashboard.tsx"),
    route("/process", "routes/internal/dashboard/process/process.tsx"),
    route("/emails", "routes/internal/emails/emailsHome.tsx"),
    route("/emails/sent", "routes/internal/emails/emailsAnswered.tsx"),
    route("/emails/compose", "routes/internal/emails/compose.tsx"),
    route("/emails/:emailId", "routes/internal/emails/emailDetail.tsx"),
  ]),
] satisfies RouteConfig;
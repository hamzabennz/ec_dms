/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import DepartementTables from "layouts/departementTables";
import CategorieTables from "layouts/categories";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import UnauthorizedPage from "layouts/unauthorized";
import SignUp from "layouts/authentication/sign-up";
import UserProfile from "layouts/user_page/userPage";
import UserProfilePage from "layouts/user_page/UserProfilePage";

// @mui icons
import Icon from "@mui/material/Icon";
import Documents from "layouts/documents";
import DocumentPage from "layouts/document_page/documentPage";
import { layouts } from "chart.js";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Users",
    key: "users",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/users",
    component: <Tables />,
  },


  {
    type: "collapse",
    name: "Departements",
    key: "departements",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/departements",
    component: <DepartementTables />,
  },


  {
    type: "collapse",
    name: "Documents",
    key: "documents",
    icon: <Icon fontSize="small">description</Icon>,
    route: "/documents",
    component: <Documents />,
  },



  {
    type: "collapse",
    name: "Categories",
    key: "categories",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/categories",
    component: <CategorieTables />,
  },


  

  /*
  {
    type: "collapse",
    name: "Billing",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: <Billing />,
  },
  {
    type: "collapse",
    name: "RTL",
    key: "rtl",
    icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
    route: "/rtl",
    component: <RTL />,
  },
  
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
  */
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
  },
  {
    type: "route",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  /*
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "route", // Using a different type so it doesn't show in the Sidenav
    name: "User Profile",
    key: "user-profile",
    route: "/user/:userId", // Dynamic route with parameter
    component: <UserProfile />,
  },
  */
  {
    type: "route", // Using a different type so it doesn't show in the Sidenav
    name: "Document page",
    key: "document-page",
    route: "/document/:documentId",
    // Dynamic route with parameter
    component: <DocumentPage />,
  },
  {
    type: "route",
    name: "User Profile",
    key: "user-profile",
    route: "/user/:id",
    component: <UserProfilePage />,
  },
];

export default routes;

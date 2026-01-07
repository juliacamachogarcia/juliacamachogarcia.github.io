import { createBrowserRouter } from "react-router-dom";
import { Radix } from "../Radix";
import { Home, About } from "../pages";

import { Contact } from "../pages/contact/Contact";
import { Projects } from "../pages/myprojects/Projects";
import { ProjectDetail } from "../pages/myprojects/projectdetails/ProjectDetail";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Radix />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: 'about',
        element: <About />
      },
      

      {
        path: 'projects',
        element: <Projects />
      },
      {
      

        path: 'projects/:projectId',
        element: <ProjectDetail />
      },
      {
        path: 'contacto',
        element: <Contact />
      },
    ]
  }
]);
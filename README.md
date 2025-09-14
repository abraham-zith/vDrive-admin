# vDrive Admin Dashboard

A modern, responsive admin dashboard for managing drivers, users, pricing, and fare rules for the vDrive platform. Built with React, TypeScript, Vite, Tailwind CSS, and Ant Design.

## Features

- **Dashboard Overview:** Visualize key metrics and platform activity.
- **User Management:** View and manage platform users.
- **Driver Management:** Add, edit, and monitor drivers.
- **Driver Pricing:** Configure driver pricing and time slots.
- **Admins Management:** Manage admin users and permissions.
- **Pricing & Fare Rules:** Set and update fare rules and pricing policies.
- **Authentication:** Secure login, signup, and password reset.
- **Responsive Design:** Optimized for desktop and mobile devices.
- **Google Maps Integration:** Visualize driver locations and hotspots.

## Tech Stack

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Ant Design](https://ant.design/)
- [React Router](https://reactrouter.com/)
- [@react-google-maps/api](https://react-google-maps-api-docs.netlify.app/)
- [Grid.js](https://gridjs.io/) (for tables)
- [Axios](https://axios-http.com/)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
git clone https://github.com/abraham-zith/vDrive-admin.git
cd vDrive-admin
npm install
```

### Running the App (Development)

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
  components/         # Reusable UI components
  pages/              # Main app pages (Dashboard, Users, Drivers, etc.)
  api/                # API utilities (Axios)
  contexts/           # React context providers (e.g., Auth)
  login/              # Authentication components
  signup/             # Signup components
  assets/             # Static assets (images, icons)
  utilities/          # Helper functions/utilities
  App.tsx             # Main app component and routes
  main.tsx            # App entry point
  index.css           # Global styles
```

## Environment Variables

Create a `.env` file in the project root for API endpoints and secrets as needed.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE) © abraham-zith

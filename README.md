# Global CCP Front

This is an Angular application for the Global CCP (Central Control Panel) frontend.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Building](#building)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16.x or higher recommended)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`
  
- **npm** (comes with Node.js) or **yarn**
  - Verify installation: `npm --version`
  
- **Angular CLI** (v15.x or higher recommended)
  - Install globally: `npm install -g @angular/cli`
  - Verify installation: `ng version`

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/D3ds3c007/global-CCP-front.git
   cd global-CCP-front
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   Or if using yarn:
   ```bash
   yarn install
   ```

## Development

### Running the Development Server

Start the development server:
```bash
ng serve
```

Or with npm:
```bash
npm start
```

The application will be available at `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Running on a Different Port

```bash
ng serve --port 4300
```

### Running with a Specific Environment

```bash
ng serve --configuration=production
```

## Building

### Development Build

```bash
ng build
```

### Production Build

```bash
ng build --configuration=production
```

The build artifacts will be stored in the `dist/` directory. The production build optimizes the application for best performance.

## Testing

### Running Unit Tests

Execute unit tests via [Karma](https://karma-runner.github.io):
```bash
ng test
```

### Running End-to-End Tests

Execute end-to-end tests:
```bash
ng e2e
```

### Running Tests in CI Mode

```bash
ng test --watch=false --browsers=ChromeHeadless
```

## Project Structure

```
global-CCP-front/
├── src/
│   ├── app/                  # Application components, services, modules
│   │   ├── components/       # Reusable components
│   │   ├── services/         # Application services
│   │   ├── models/           # Data models and interfaces
│   │   ├── guards/           # Route guards
│   │   ├── interceptors/     # HTTP interceptors
│   │   └── app.module.ts     # Root module
│   ├── assets/               # Static assets (images, fonts, etc.)
│   ├── environments/         # Environment configurations
│   ├── index.html            # Main HTML file
│   ├── main.ts               # Application entry point
│   └── styles.css            # Global styles
├── angular.json              # Angular CLI configuration
├── package.json              # Project dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Available Scripts

Here are the most commonly used npm scripts:

| Command | Description |
|---------|-------------|
| `npm start` | Starts the development server |
| `npm run build` | Builds the app for production |
| `npm test` | Runs unit tests |
| `npm run lint` | Lints the codebase |
| `npm run e2e` | Runs end-to-end tests |

## Troubleshooting

### Port Already in Use

If port 4200 is already in use, you can:
- Stop the process using the port
- Or run on a different port: `ng serve --port 4300`

### Node Modules Issues

If you encounter dependency issues:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Angular CLI Version Mismatch

Ensure your global Angular CLI matches the project version:
```bash
npm uninstall -g @angular/cli
npm install -g @angular/cli@latest
```

### Clear Angular Cache

If you experience build issues:
```bash
rm -rf .angular
ng build
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

### Code Style

- Follow the [Angular Style Guide](https://angular.io/guide/styleguide)
- Use meaningful variable and function names
- Write clear comments for complex logic
- Ensure all tests pass before submitting PR

### Commit Message Guidelines

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

## Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Angular CLI Documentation](https://angular.io/cli)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)

## License

[Add your license information here]

## Contact

For questions or support, please contact [Add contact information]
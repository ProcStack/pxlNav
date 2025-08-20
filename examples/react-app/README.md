# PxlNav React App

This project is a React application that integrates the `pxlNav` library for creating immersive navigation environments.

## Installation

To install the necessary dependencies, including `pxlNav`, run the following command:

```
npm install pxlnav
```

## Project Structure

- `src/components/PxlNav.tsx`: Defines the `PxlNav` React component that initializes and renders the `pxlNav` environment.
- `src/components/Loader.tsx`: Displays loading messages or animations while the `pxlNav` environment is being initialized.
- `src/assets/pxlRooms`: Contains the room assets used by the `pxlNav` library.
- `src/config/pxlNavConfig.ts`: Exports configuration settings for `pxlNav`, such as user settings and camera settings.
- `src/App.tsx`: The main application component that renders the `PxlNav` component and other components.
- `src/index.tsx`: The entry point of the React application.

## Usage

To use the `PxlNav` component, import it into your application and include it in your component tree. The built ESM module of `pxlNav` does not require CommonJS (CJS) or Universal Module Definition (UMD) for integration, as ESM is natively supported in modern JavaScript environments. You can directly import it in your React components.

## License

This project is licensed under the MIT License.
# Photo Editor

A browser-based photo editor built with HTML, CSS, and JavaScript.

This app lets you upload an image, apply filters, rotate/flip it, track edit history with undo/redo, and save the final result.

## Features

- Upload local image files (JPG, PNG, and other browser-supported formats)
- Real-time filter controls:
  - Brightness
  - Saturation
  - Inversion
  - Grayscale
  - Sepia
  - Blur
- Rotation and flipping tools
- Undo and redo support
- Visual history panel for edit states
- Export edited image as PNG

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API for image rendering and pixel manipulation

## Project Structure

- `index.html` - Main app layout and UI controls
- `styles.css` - App styling and responsive layout
- `script.js` - Editing logic, filters, transformations, and history system
- `Photo_Editor.html` - Alternate/duplicate HTML file currently in the project

## How To Run

1. Download or clone this project.
2. Open `index.html` in a modern web browser.
3. Click **Choose Image**.
4. Apply filters and transformations.
5. Click **Save Image** to download your edited photo.

## Controls Overview

- **Filters:** Select a filter and adjust with the slider
- **Rotate Slider:** Rotate from 0° to 360°
- **Rotate & Flip Buttons:** Quick rotate left/right and horizontal/vertical flip
- **Undo/Redo:** Move backward or forward through edit history
- **Reset Filters:** Return all values to defaults

## Browser Compatibility

Works best on current versions of:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox

## Privacy

All image processing happens in your browser using Canvas. Images are not uploaded to a server by this project.

## Future Improvements

- Better accessibility labels for all controls
- Performance optimization for large images and heavy blur values
- Additional export formats (e.g., JPEG quality options)
- Keyboard shortcuts for common actions

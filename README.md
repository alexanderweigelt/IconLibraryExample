# Icon library example

## The Task

**Investigate which of the possible technologies should be used to develop a custom icon library to replace an icon-font.**

Creating an icon library using SVG icons can be achieved in various ways, each with its own advantages and use cases. Here are three approaches:

## Define "Icon Library"

An icon library is a collection of reusable icons that are commonly used in web development and design. These icons are typically created as vector graphics in formats like SVG (Scalable Vector Graphics) and are organized and stored for easy access and use in web projects. Icon libraries serve several important purposes in web development:

1. **Consistency:** Icon libraries ensure that icons used throughout a website or web application are consistent in style, size, and appearance. This consistency helps create a cohesive and professional user interface.

2. **Efficiency:** Instead of designing or searching for icons individually for each project, developers and designers can rely on an icon library to provide a wide range of pre-designed icons. This saves time and effort in the design and development process.

3. **Scalability:** Icons in a library are typically vector-based, which means they can be scaled to different sizes without losing quality. This is crucial for responsive design, where icons may need to adapt to various screen sizes and resolutions.

4. **Reduced File Size:** When icons are included in a library, they can be optimized for performance. Icons can be bundled together, reducing the number of HTTP requests and file sizes, which can improve page load times.

5. **Ease of Maintenance:** Managing icons in a centralized library makes it easier to update, modify, or expand the collection. If a design change or additional icons are needed, it can be done in one place and reflected across the entire project.

6. **Customization:** Many icon libraries provide options to customize the color or style of icons through CSS or other methods, allowing designers to tailor icons to match a project's branding or design requirements.

7. **Accessibility:** Icon libraries can include accessibility features like aria-labels and titles, ensuring that screen readers and other assistive technologies can properly interpret and convey the meaning of the icons to users with disabilities.

8. **Cross-Browser Compatibility:** Icons in a library can be tested and optimized for cross-browser compatibility, ensuring they render correctly in various web browsers.

There are various ways to incorporate icon libraries into web development:

- **SVG Icons:** As mentioned earlier, icons are often provided as SVG files, which can be easily embedded in HTML using the `<svg>` element. CSS can then be used to style and position the icons.

- **Icon Fonts:** Some icon libraries offer icons in the form of font files (e.g., .woff or .ttf). These fonts are loaded like regular fonts and can be styled using CSS.

- **CSS Classes:** Many libraries provide pre-defined CSS classes that can be added to HTML elements to display specific icons. These classes are usually associated with background images or icon fonts.

- **JavaScript Libraries:** Some JavaScript libraries or frameworks (e.g., FontAwesome, Material Icons) offer components or functions to easily integrate icons into web applications. These libraries often provide a wide range of customization options.

In summary, an icon library is a valuable resource for web development, simplifying the process of including consistent, scalable, and customizable icons in web projects while optimizing performance and accessibility.

## Prepare your project

1. **Prepare Your SVGs:**
   Place each SVG file in your `icons/` directory.

2. **Set Up Your Project:**
   Create a directory structure for your project:

   ```
   src/
   ├── components/
   │   ├── IconComponent.js
   ├── icons/
   │   ├── home.svg
   │   ├── user.svg
   │   └── ...
   ├── styles/
   │   ├── _icons.scss
   │   └── main.scss
   └── index.html
   ```

## Ways to create a icon library

### CSS native

- **Pros:**
  - **Custom Styling:** With individual SVGs, you have the flexibility to apply custom styles to each icon using CSS. This allows you to adapt icons to your application's design without modifying the original SVG files.
  - **Modularity:** Each icon is self-contained, making it easy to manage and update individual icons without affecting others. This modularity is beneficial when you have a large number of icons in your library.
  - **Performance:** Since each icon is loaded individually as needed, there is potential for better performance in terms of page loading times compared to loading a single large SVG sprite or using web components.
- **Cons:**
  - **File Overhead:** If you have a significant number of icons, this approach can lead to a larger number of separate HTTP requests for each icon, potentially increasing page load times. To mitigate this, you might consider optimizing your SVG files for size.
  - **Maintenance Overhead:** Managing individual SVG files can become cumbersome as your icon library grows. You need to ensure that each SVG follows a consistent format and that they are correctly referenced in your SCSS. This can be error-prone and time-consuming.
  - **Limited Interactivity:** This approach primarily focuses on icon presentation and styling. If you require advanced interactivity, such as hover effects or complex animations, you may need to rely on JavaScript or other methods in addition to CSS.
  - **Compatibility:** Older browsers may have limited support for some advanced CSS features used for styling SVGs. Ensure that your chosen CSS properties are compatible with your target browser audience or provide fallbacks as needed.

In summary, the previous example using native CSS and individual SVGs provides flexibility in styling and modularity but may require more careful maintenance and can result in increased file overhead if not optimized properly.

1. **Create `_icons.scss` for Icon Styles:**
   In `_icons.scss`, use Sass maps to list and iterate over all available icons. This approach allows you to easily add or remove icons without modifying the styles for each one.

   ```scss
   // _icons.scss

   // Define a map to store icon information
   $icons: (
     home: '"./icons/home.svg',
     user: './icons/user.svg'
     // Add more icons here...
   );

   // Define a mixin to generate styles for icons
   @mixin icon($name) {
     $svg-url: map-get($icons, $name);
     .icon-#{$name} {
       width: 24px; // Adjust as needed
       height: 24px; // Adjust as needed
       fill: currentColor; // Icons will inherit text color
       background-image: url('#{$svg-url}');
       background-size: cover;
     }
   }

   // Iterate over the icons map and generate styles
   @each $name, $svg-url in $icons {
     @include icon($name);
   }
   ```

2. **Create `main.scss` for Importing Styles:**
   In `main.scss`, import `_icons.scss` and any other styles you need.

   ```scss
   // main.scss

   @import 'icons'; // Import your icon styles

   // Your other global styles go here
   body {
     font-family: Arial, sans-serif;
   }

   // Define a class for an icon if needed
   .custom-icon {
     @include icon('home');
     width: 32px;
     height: 32px;
   }
   ```

3. **Include the Generated CSS in Your HTML:**
   Link the generated CSS file (main.css) in your HTML file.

   ```html
   <!-- index.html -->

   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <link rel="stylesheet" href="styles/main.css">
     <title>Icon Library Example</title>
   </head>
   <body>
     <!-- Use your icons -->
     <div class="icon icon-home"></div>
     <div class="icon icon-user"></div>
     <div class="custom-icon"></div>
   </body>
   </html>
   ```

   With this approach, you can easily manage your icon library by adding or removing icons in the `$icons` map, and the styles for each icon will be generated automatically.

### SVG `<use>` Element and Symbol Definitions

This approach uses the SVG `<use>` element to reference symbols defined within an SVG sprite. It's a method often used for icon libraries because it allows for easy reusing and styling of icons.

- **Pros:**
   - Lightweight and efficient as icons are defined in a single SVG sprite.
   - Supports CSS styling of individual icons.
   - Easy to maintain and extend.

- **Cons:**
   - Limited interactivity (e.g., hover effects) with JavaScript compared to inline SVGs.

Here's an example:

  ```html
  <!-- icons.svg -->
  <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
    <symbol id="home" viewBox="0 0 24 24">
      <path d="..."/>
    </symbol>
    <symbol id="icon2" viewBox="0 0 24 24">
      <path d="..."/>
    </symbol>
    <!-- Add more symbols for other icons -->
  </svg>

  <!-- HTML usage -->
  <svg class="icon">
    <use xlink:href="icons.svg#home"></use>
  </svg>
  ```

### Web Components

You can create custom web components encapsulating your icons. Web components are reusable, self-contained units of code that can be used across your application.

- **Pros:**
   - Encapsulated and reusable.
   - Provides a clear interface for using icons in HTML.
   - Can encapsulate interactivity and functionality.

- **Cons:**
   - Requires more initial setup compared to plain SVGs.
   - May have limited browser support (polyfills may be needed).

Here's a simplified example:

  ```javascript
  // IconComponent.js
  class IconComponent extends HTMLElement {
    connectedCallback() {
      const iconName = this.getAttribute("name");
      const iconSVG = getIconSVG(iconName); // Fetch or use a map to get the SVG content
      this.innerHTML = iconSVG;
    }
  }

  customElements.define("icon-component", IconComponent);

  // HTML usage
  <icon-component name="home"></icon-component>
  ```

## Conclusion

Each of these approaches has its own strengths and weaknesses, so the choice depends on your project requirements, scalability, and the level of interactivity and customization needed for your icon library. The choice of approach depends on your project's specific requirements and priorities.

## Development

First install dependencies:

```sh
npm install
```

To create a production build:

```sh
npm run build
```

To create a development build:

```sh
npm run dev
```


## Running

```sh
npm run preview
```

# Mobile-First Refactoring Prompt

**Goal:** To analyze, plan, and refactor the existing React web project to prioritize mobile compatibility using a mobile-first methodology, leveraging your UI framework, styling solution, and animation library.

**Instructions for User:**

1.  **Provide Context:**
    * Briefly describe the current state of the project's responsiveness (e.g., "mostly desktop-focused," "some basic media queries," "significant mobile layout issues").
    * Identify any specific areas or components that are known to have poor mobile experiences.
    * Specify the main breakpoints currently in use (if any). If not, indicate that you'll rely on your UI framework's defaults as a starting point.
    * Mention any performance concerns, especially on mobile.

2.  **Run Analysis (Manual and Assisted):**
    * **Manual Inspection:** Review the project's components and layouts on various mobile screen sizes using browser developer tools (device emulation) and, ideally, physical mobile devices. Document areas that:
        * Have broken layouts or overflow issues.
        * Have elements that are too small or too close together for comfortable touch interaction.
        * Load excessively large images or other assets on mobile.
        * Exhibit performance issues (slow rendering, janky animations).
        * Lack clear mobile navigation patterns.
    * **Component Review:** For each significant component:
        * Assess how well it adapts to smaller screens.
        * Identify areas where desktop-specific styling might be overriding mobile considerations.
        * Determine if alternative mobile-specific components or rendering logic might be necessary for an optimal mobile experience.
        * Evaluate the use of your UI framework's responsive props and utilities. Are they being utilized effectively?
        * Analyze your styling approach and identify opportunities to implement mobile-first styles with media queries for larger screens.
        * Examine animations for mobile performance and touch interaction considerations.

3.  **Create Refactoring Plan:**
    Based on the analysis, create a prioritized plan with actionable steps. Consider the following categories:

    * **Global Styles and Breakpoints:**
        * Define or standardize breakpoints (consider using your UI framework's defaults as a base).
        * Establish global styles that prioritize mobile defaults (e.g., base font sizes, spacing units).
        * Ensure the `<meta name="viewport">` tag is correctly configured in your `index.html`.

    * **Layout Refactoring:**
        * Identify key layout components (e.g., navigation, main content areas, footers).
        * Outline how these layouts will be adapted for mobile (e.g., single-column flow, responsive grids/flexbox).
        * Plan the use of your UI framework's layout components for building responsive layouts.

    * **Component-Specific Refactoring:**
        * For each identified component with mobile issues:
            * Determine if your UI framework's responsive features can address the issues.
            * Plan the use of your styling solution with media queries to progressively enhance styles for larger screens.
            * Decide if alternative mobile-specific components are needed and outline their design and implementation.
            * Consider using conditional rendering based on breakpoints to show/hide or swap components.

    * **Navigation Refactoring:**
        * Plan the implementation of mobile-friendly navigation patterns (e.g., hamburger menu, drawer, offcanvas menu, bottom navigation, tabs).
        * Ensure smooth transitions and clear navigation hierarchy on mobile.

    * **Form Refactoring:**
        * Optimize forms for mobile (clear labels, appropriate input types, reduced complexity, clear action buttons).
        * Utilize your UI framework's form components for built-in responsiveness and accessibility.

    * **Image and Asset Optimization:**
        * Identify large images and plan for optimization (compression, responsive images using `<picture>` or libraries).
        * Consider lazy loading for off-screen assets.

    * **Animation Review and Optimization:**
        * Review existing animations for performance on mobile.
        * Plan to simplify or conditionally disable complex animations on smaller devices.
        * Ensure touch interactions have appropriate visual feedback.

    * **Testing Strategy:**
        * Outline how you will test the refactored application on various mobile devices and screen sizes.

4.  **Execute Refactoring (Iterative Approach Recommended):**
    * Start with global styles and layout adjustments.
    * Refactor components one by one, prioritizing those with the most significant mobile issues.
    * Regularly test on mobile devices after each significant refactoring step.

5.  **Document Changes:**
    * Document the new mobile-first approach and any new breakpoints or component patterns implemented.
    * Update any relevant style guides or component libraries.

**Guiding Questions During Refactoring:**

As you refactor, continuously ask yourself:

* **Mobile First?** Am I designing the default styles and behavior for the smallest screen first?
* **UI Framework Utilization?** Am I leveraging my UI framework's responsive features and layout components effectively?
* **Progressive Enhancement?** Am I using my styling solution and media queries to progressively enhance the design for larger screens, rather than fixing mobile issues after desktop development?
* **Mobile Conventions?** Does the mobile experience adhere to common mobile UI/UX patterns?
* **Performance Conscious?** Are my changes considering mobile performance (image sizes, animation complexity, unnecessary DOM elements)?
* **Touch-Friendly?** Are interactive elements appropriately sized and spaced for touch?
* **Alternative Components Needed?** Does this component truly work well across all screen sizes, or would a mobile-specific alternative provide a better experience?
* **Animation Optimized?** Are animations smooth and performant on mobile? Are touch interactions providing good feedback?

**Example Refactoring Scenario (Consider this as you work):**

Let's say you have a desktop-centric navigation bar with many links that wrap awkwardly on mobile. Your plan might include:

1.  **Mobile Navigation:** Implement a hamburger menu component from your UI framework that toggles a drawer or offcanvas menu containing the navigation links.
2.  **Desktop Navigation:** Keep the original navigation bar but use a media query in your styling solution to hide it below a certain breakpoint and show the hamburger menu instead.
3.  **Styling:** Style the drawer/offcanvas menu and its contents for a clear and usable mobile navigation experience.

**By following this prompt, you will systematically analyze your project, create a targeted refactoring plan, and execute the necessary changes to achieve a truly mobile-first design using your chosen frontend libraries.** Remember to commit your code frequently and test thoroughly throughout the process.
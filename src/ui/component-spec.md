# UI Component Specification

Established patterns and conventions for this design system. Components must be usable as server components and therefore must not use state or hooks.

## Technology Stack

- **React**: Functional components with `forwardRef`
- **TypeScript**: Strict typing throughout
- **Tailwind CSS + Tailwind Variants**: Utility-first styling with variant management
- **Next.js**: Framework integration (Image, Link)

## File Structure

```
ComponentName/
├── ComponentName.tsx      # Main implementation
├── ComponentGroup.tsx     # Optional: group/container variant
├── ComponentContainer.tsx # Optional: container wrapper
└── index.ts               # Barrel exports
```

## TypeScript Patterns

```typescript
import React, { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const ComponentStyles = tv({
  base: "base-classes",
  variants: {
    variantName: {
      option1: "classes-for-option1",
      option2: ["multiple", "classes"],
    },
  },
  defaultVariants: {
    variantName: "option1",
  },
});

type ComponentVariants = VariantProps<typeof ComponentStyles>;

export type ComponentProps = React.ComponentPropsWithoutRef<"element"> &
  ComponentVariants;
```

Prop type notes:
- Extend `React.ComponentPropsWithoutRef<"element">` for the underlying HTML element
- Use `Required<Pick<Type, "prop">>` for mandatory variant props
- Use `Omit<BaseType, "conflictingProp">` to resolve conflicts
- Document custom props with JSDoc

## Component Implementation

```typescript
export const Component = forwardRef<HTMLElementType, ComponentProps>(
  ({ variant1, variant2, className, ...props }, ref) => {
    return (
      <element
        ref={ref}
        className={ComponentStyles({ variant1, variant2, className })}
        {...props}
      />
    );
  }
);

Component.displayName = "Component";
```

Destructure variant props first, always pass `className` to the variant function, spread `...props` for HTML attribute passthrough, and set `displayName`.

## Styling

### Variant JSDoc

```typescript
variants: {
  /**
   * @summary Brief description of what this variant controls
   * @default "defaultValue"
   */
  variantName: { /* options */ },
}
```

### Group Modifiers

```typescript
base: [
  "default-styles",
  "group-[&]/group-name:group-specific-styles",
  "group-[&]/group-name:first:first-child-styles",
  "group-[&]/group-name:last:last-child-styles",
];
```

### Dark Mode & State Variants

```typescript
// Dark mode
"text-base-900 bg-base-100 border-base-400",
"dark:text-base-400 dark:bg-base-1200 dark:border-base-1000",

// Hover / focus / disabled / invalid
"hover:bg-primary-700 hover:border-primary-700",
"focus:ring-active focus:border-white",
"disabled:opacity-60 disabled:pointer-events-none",
"invalid:text-danger-900 invalid:bg-danger-100",
```

## Component Variants

### Link Variant

```typescript
export type ComponentLinkProps = React.ComponentPropsWithoutRef<typeof NextLink> &
  ComponentVariants;

export const ComponentLink = forwardRef<
  React.ComponentRef<typeof NextLink>,
  ComponentLinkProps
>(({ className, variant1, variant2, ...props }, ref) => (
  <NextLink
    ref={ref}
    className={ComponentLinkStyles({ variant1, variant2, className })}
    {...props}
  />
));
```

### Group/Container

```typescript
const GroupStyles = tv({ base: "group/component-group flex" });

export const ComponentGroup = forwardRef<HTMLDivElement, ComponentGroupProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={GroupStyles({ className })} {...props} />
  )
);
```

## Polymorphic Components

```typescript
export type ComponentProps = React.ComponentPropsWithoutRef<"h1"> &
  ComponentVariants & {
    /** @default "h3" */
    as?: "h1" | "h2" | "h3";
  };

export const Component = forwardRef<HTMLHeadingElement, ComponentProps>(
  ({ as = "h3", className, ...props }, ref) => {
    const Element = as;
    return (
      <Element ref={ref} className={ComponentStyles({ as, className })} {...props} />
    );
  }
);
```

## Exports

```typescript
// index.ts
export * from "./Component";
export * from "./ComponentGroup";
export * from "./ComponentContainer";
```

Use `.tsx` for component files, `.ts` for index/utility files.

## Naming & Accessibility

- Components: PascalCase
- Props/variants: camelCase, semantic names (`intent`, `size`, `palette`)
- Use semantic HTML elements as the base element
- Forward refs for proper focus management
- Include ARIA attributes where needed

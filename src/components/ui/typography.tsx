import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { HTMLAttributes, JSX, forwardRef } from "react";

/**
 * CVA variants for typography styles
 */
const textVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-center text-32xl font-extrabold  text-balance",
      h2: "scroll-m-20 text-2xl font-semibold  first:mt-0",
      h3: "scroll-m-20 text-xl font-semibold ",
      h4: "scroll-m-20 text-lg font-semibold ",
      h5: " text-sm font-semibold  leading-none",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      code: "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      small: "text-sm leading-none font-medium",
      extraSmall: "text-xs leading-none font-medium",
      muted: "text-muted-foreground text-sm",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

/**
 * HTML element mapping for each variant
 */
const elementMap = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  p: "p",
  blockquote: "blockquote",
  code: "code",
  small: "small",
  extraSmall: "small",
  muted: "p",
} as const;

type TextVariant = keyof typeof elementMap;

interface TextProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  children: React.ReactNode;
}

/**
 * Unified Text component using CVA for variant management
 * @param variant - The typography style variant to apply
 * @param className - Additional CSS classes to merge with default styles
 * @param children - The content to render
 * @param props - Additional HTML attributes
 * @returns Rendered HTML element with appropriate typography styles
 *
 * @example
 * <Text variant="h1">Main Heading</Text>
 * <Text variant="p" className="text-blue-500">Custom paragraph</Text>
 */
export const Text = forwardRef<HTMLElement, TextProps>(
  ({ variant, className, children, ...props }, ref) => {
    const element = variant ? elementMap[variant] : ("p" as const);
    type AllowedTags = (typeof elementMap)[TextVariant];
    const Component = element as keyof Pick<JSX.IntrinsicElements, AllowedTags>;

    return (
      <Component
        // Cast to support all HTMLElement subtypes safely.
        ref={ref as never}
        className={cn(textVariants({ variant }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Text.displayName = "Text";

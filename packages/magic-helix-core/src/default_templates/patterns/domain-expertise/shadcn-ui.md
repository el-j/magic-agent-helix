# shadcn/ui Component Library Pattern

## Purpose
Guide usage of shadcn/ui components in Next.js/React projects. From **same.new**.

## Installation Pattern
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card dialog input
```

## Component Usage
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function ProductCard({ product }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{product.description}</p>
        <Button>Add to Cart</Button>
      </CardContent>
    </Card>
  )
}
```

## Customization
```tsx
// ✅ Extend with custom variants using cva
import { cva } from "class-variance-authority"

const buttonVariants = cva("base-classes", {
  variants: {
    variant: {
      default: "bg-primary",
      outline: "border border-input",
      custom: "bg-gradient-to-r from-purple-500 to-pink-500"
    }
  }
})
```

## Best Practices
- Components are copied to your repo (not npm dependencies)
- Customize in `components/ui/` as needed
- Use Radix UI primitives for accessibility
- Combine with Tailwind for styling

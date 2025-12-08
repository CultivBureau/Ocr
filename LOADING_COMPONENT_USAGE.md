# Loading Component Usage Guide

## Overview

The `Loading` component is a professional, animated loading screen that displays the HappyLife logo with beautiful animations. It's designed to be used throughout the application for any loading states.

## Features

✨ **Professional Animations**
- Rotating gradient rings
- Pulsing logo
- Animated dots
- Progress bar animation

🎨 **Beautiful Design**
- HappyLife logo integration
- Gradient colors matching brand
- Smooth transitions
- Responsive sizing

⚡ **Flexible Usage**
- Full-screen mode (default)
- Inline mode for components
- Customizable size (sm, md, lg)
- Custom loading messages

---

## Import

```typescript
import Loading from "@/app/components/Loading";
```

---

## Usage Examples

### 1. Full-Screen Loading (Default)

Used for page-level loading states:

```tsx
// Simple full-screen loading
<Loading />

// With custom message
<Loading message="Loading your documents..." />

// With size (default is 'md')
<Loading size="lg" message="Please wait..." />
```

### 2. Inline Loading

Used within components or sections:

```tsx
<Loading 
  fullScreen={false} 
  size="sm" 
  message="Processing..." 
/>
```

---

## Already Integrated

The Loading component is already integrated in:

### ✅ AuthContext
- Shows during initial authentication check
- Message: "Authenticating..."

### ✅ ProtectedRoute Component
- Shows while verifying user access
- Message: "Verifying access..."

### ✅ AdminRoute Component
- Shows while verifying admin permissions
- Message: "Verifying admin access..."

---

## How to Use in Your Components

### Example 1: Page Component with Data Fetching

```tsx
"use client";

import { useState, useEffect } from "react";
import Loading from "@/app/components/Loading";

export default function MyPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/data");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading data..." />;
  }

  return <div>{/* Your content */}</div>;
}
```

### Example 2: Inline Loading in Component Section

```tsx
"use client";

import { useState } from "react";
import Loading from "@/app/components/Loading";

export default function DataSection() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2>Users List</h2>
      
      {loading ? (
        <Loading 
          fullScreen={false} 
          size="sm" 
          message="Loading users..." 
        />
      ) : (
        <div>
          {users.map(user => (
            <div key={user.id}>{user.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Example 3: Form Submission Loading

```tsx
"use client";

import { useState } from "react";
import Loading from "@/app/components/Loading";

export default function MyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch("/api/submit", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      // Success handling
    } catch (error) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show full-screen loading during submission
  if (isSubmitting) {
    return <Loading message="Submitting your form..." />;
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Example 4: Button Loading State

For button-level loading, you can use a simpler inline version or disable the button:

```tsx
<button
  onClick={handleAction}
  disabled={loading}
  className="px-4 py-2 bg-[#A4C639] text-white rounded-xl disabled:opacity-50"
>
  {loading ? (
    <span className="flex items-center gap-2">
      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Processing...
    </span>
  ) : (
    "Submit"
  )}
</button>
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fullScreen` | `boolean` | `true` | Whether to show full-screen loading or inline |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the logo and loading indicator |
| `message` | `string` | `'Loading...'` | Custom message to display |

---

## Size Reference

- **sm**: 64x64px (16x16 w/h classes) - For inline small sections
- **md**: 96x96px (24x24 w/h classes) - Default, balanced size
- **lg**: 128x128px (32x32 w/h classes) - For large full-screen loading

---

## Design Notes

### Colors Used
- Primary: `#A4C639` (HappyLife green)
- Blue: `blue-500`, `blue-600`
- Purple: `purple-500`, `purple-600`
- Emerald: `emerald-400`, `emerald-500`, `emerald-600`

### Animations
- Logo: Pulse animation
- Rings: Spin animations (different speeds and directions)
- Dots: Bounce animation with staggered delays
- Progress bar: Custom loading animation

---

## Best Practices

1. **Use full-screen loading for**:
   - Page-level loading states
   - Authentication checks
   - Large data fetches
   - Form submissions that take time

2. **Use inline loading for**:
   - Component-level loading
   - Section refreshes
   - List loading
   - Partial page updates

3. **Custom messages**:
   - Be specific: "Loading documents..." vs "Loading..."
   - Keep it short and friendly
   - Match the action being performed

4. **Performance**:
   - Only show loading for actions > 300ms
   - Consider skeleton screens for very fast loads
   - Always handle loading state properly

---

## Troubleshooting

### Loading doesn't appear
- Check if `loading` state is properly set to `true`
- Verify the Loading component is imported correctly
- Ensure the component is rendering conditionally

### Logo doesn't show
- Verify `/logoHappylife.jpg` exists in the `public` folder
- Check Next.js Image optimization settings
- Look for console errors

### Animations not smooth
- Check if CSS animations are enabled
- Verify browser compatibility
- Check for CSS conflicts

---

## Future Enhancements

Potential improvements:
- [ ] Add success/error states
- [ ] Support custom logo override
- [ ] Add timeout handling
- [ ] Progress percentage display
- [ ] Theme customization

---

**Created**: December 2024
**Status**: ✅ Production Ready


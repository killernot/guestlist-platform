# Auth.js v5 Migration Guide

**From:** next-auth v4.24.14
**To:** next-auth v5.0.0-beta.31 (Auth.js v5)
**Date:** 2026-06-27

---

## Why Migrate

next-auth v4 is incompatible with Next.js 16's Turbopack bundler. The build fails during "Collecting page data" with:

```
Error: Failed to load external module next-auth-a7c81cb96eb169a6/react: TypeError: Invalid URL
```

No configuration workaround exists. Auth.js v5 resolves this and is the recommended path forward.

---

## Migration Steps

### 1. Install Auth.js v5

```bash
npm install next-auth@5.0.0-beta.31
npm install --save-dev patch-package
```

### 2. Rewrite `auth.ts`

**Before (v4):**
```ts
import NextAuth from "next-auth"
import { authOptions } = "./auth"

export default NextAuth(authOptions)
```

**After (v5):**
```ts
import NextAuth from "next-auth"
import { authOptions } from "./auth"

const NextAuthResult = NextAuth(authOptions)

export const auth = NextAuthResult.auth
export const handlers = NextAuthResult.handlers

export async function getServerSession(req, res) {
  return await NextAuthResult.auth(req, res)
}
```

### 3. Update `pages/api/auth/[...nextauth].ts`

**Before:**
```ts
import NextAuth from "next-auth"
import { authOptions } from "../../../auth"
export default NextAuth(authOptions)
```

**After:**
```ts
import { handlers } from "../../../auth"
export const { GET, POST } = handlers
```

### 4. Update all `getServerSession` callers

**Before:**
```ts
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth"

const session = await getServerSession(req, res, authOptions)
```

**After:**
```ts
import { getServerSession } from "../auth"

const session = await getServerSession(req, res)
```

### 5. Add module augmentation for custom types

```ts
declare module "next-auth" {
  interface Session {
    user: { id: string; role: "ADMIN" | "STAFF" } & DefaultSession["user"]
  }
  interface User { id: string; role: "ADMIN" | "STAFF" }
}
declare module "@auth/core/jwt" {
  interface JWT { id: string; role: "ADMIN" | "STAFF" }
}
```

### 6. Create Turbopack compatibility patch

```bash
npx patch-package next-auth
```

This creates `patches/next-auth+5.0.0-beta.31.patch` which adds `.js` extensions to `next/` imports.

### 7. Add postinstall script

```json
{
  "scripts": {
    "postinstall": "prisma generate && patch-package"
  }
}
```

---

## Breaking Changes

| Change | Impact | Migration |
|--------|--------|-----------|
| `getServerSession(req, res, authOptions)` → `getServerSession(req, res)` | All auth callers | Remove third argument |
| `import from "next-auth/next"` deprecated | All auth callers | Import from local `auth.ts` |
| `NextAuth()` no longer default-exports | `auth.ts` | Use `const result = NextAuth(config)` then `result.auth` |
| `session.user` type changes | TypeScript consumers | Use module augmentation |
| `getServerSideProps` pattern changes | `getServerSession(context)` | Pass `context` directly (not `context.req, context.res`) |

---

## Files Modified

See `RELEASE_REPORT.md` for complete list.

---

## Rollback Plan

If issues arise post-deployment:

1. **Revert to v4:**
   ```bash
   npm install next-auth@4.24.14
   # Restore v4 import patterns
   git checkout -- auth.ts pages/api/auth/[...nextauth].ts
   # Revert all consuming files
   ```

2. **Remove patch:**
   ```bash
   rm patches/next-auth+5.0.0-beta.31.patch
   ```

3. **Rebuild:**
   ```bash
   npm run build
   ```

---

## References

- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [Auth.js v5 Documentation](https://authjs.dev/)
- [patch-package documentation](https://www.npmjs.com/package/patch-package)

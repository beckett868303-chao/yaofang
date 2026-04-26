---
name: "medical-record-system"
description: "Next.js medical record management system with Prisma, auth, OCR integration. Invoke when building healthcare apps with patient management, prescription tracking, and image upload features."
---

# Medical Record Management System

A comprehensive Next.js-based medical record management system with patient management, prescription tracking, and OCR integration.

## System Architecture

### Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Database**: SQLite with Prisma ORM
- **Authentication**: Custom JWT-based auth with bcrypt
- **Styling**: Tailwind CSS with custom theme
- **Image Processing**: browser-image-compression
- **OCR**: External OCR API integration
- **Icons**: lucide-react

### Project Structure
```
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── dev.db                 # SQLite database
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout with navbar
│   │   ├── page.tsx          # Home/dashboard
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── patients/
│   │   │   ├── page.tsx      # Patient list
│   │   │   └── [id]/         # Patient detail
│   │   ├── upload/
│   │   │   └── page.tsx      # Prescription upload
│   │   └── api/
│   │       ├── auth/         # Auth endpoints
│   │       ├── patients/     # Patient CRUD
│   │       ├── visits/       # Visit records
│   │       ├── upload/       # Image upload
│   │       └── ocr/          # OCR processing
│   ├── components/
│   │   └── NavBar.tsx        # Responsive navigation
│   └── lib/
│       ├── prisma.ts         # Prisma client
│       └── auth.ts           # Auth utilities
└── .trae/
    └── skills/               # This skill
```

## Database Schema

### Core Models
```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String
  name      String?
  patients  Patient[]
  createdAt DateTime  @default(now())
}

model Patient {
  id         Int       @id @default(autoincrement())
  name       String
  age        Int
  gender     String    @default("男")
  phone      String?
  allergies  String?
  userId     Int
  user       User      @relation(fields: [userId], references: [id])
  visits     Visit[]
  createdAt  DateTime  @default(now())
}

model Visit {
  id           Int           @id @default(autoincrement())
  patientId    Int
  patient      Patient       @relation(fields: [patientId], references: [id])
  visitDate    DateTime
  symptoms     String?
  prescriptions Prescription[]
  createdAt    DateTime      @default(now())
}

model Prescription {
  id        Int      @id @default(autoincrement())
  visitId   Int
  visit     Visit    @relation(fields: [visitId], references: [id])
  imagePath String
  ocrResult String?
  createdAt DateTime @default(now())
}
```

## Authentication Pattern

### Key Functions (in `src/lib/auth.ts`)
- `hashPassword(password)`: Bcrypt hashing
- `verifyPassword(password, hash)`: Password verification
- `getCurrentUserId()`: Extract user ID from session cookie
- `createSession(userId)`: Create JWT session token
- `clearSession()`: Clear session cookie

### Session Implementation
```typescript
// Store in cookie
cookies().set('session', sessionToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7 // 7 days
})
```

### Protected Routes Pattern
```typescript
// API route with auth check
export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Proceed with user-specific data
}
```

## Data Isolation (CRITICAL)

### Always Filter by userId
Every database query MUST include userId filter:

```typescript
// ✅ Correct - filtered by user
const patients = await prisma.patient.findMany({
  where: { userId: userId }
})

// ❌ Wrong - no user filter (data leak!)
const patients = await prisma.patient.findMany()
```

### API Route Examples

#### Patients API (`/api/patients/route.ts`)
```typescript
// GET - List all patients for current user
export async function GET() {
  const userId = await getCurrentUserId()
  const patients = await prisma.patient.findMany({
    where: { userId },
    include: { visits: { include: { prescriptions: true } } }
  })
  return NextResponse.json(patients)
}

// POST - Create patient for current user
export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  const patient = await prisma.patient.create({
    data: { ...body, userId }
  })
  return NextResponse.json(patient)
}

// DELETE - Remove patient's data
export async function DELETE(request: Request) {
  const userId = await getCurrentUserId()
  // Verify ownership before delete
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, userId }
  })
  if (!patient) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  await prisma.patient.delete({ where: { id: patientId } })
}
```

#### Visits API (`/api/visits/route.ts`)
```typescript
// POST - Create visit (must verify patient ownership)
export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, userId }  // Critical!
  })
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }
  // Create visit...
}
```

## Image Upload & OCR Flow

### Frontend Upload Flow
1. User selects/captures image(s)
2. Compress image using `browser-image-compression`
3. Convert to base64 for OCR
4. Send to `/api/ocr` for recognition
5. Extract patient info from OCR result
6. Upload image to `/api/upload`
7. Create patient/visit records

### Key Code Patterns

#### Image Compression
```typescript
const options = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 2000,
  useWebWorker: true
}
const compressedFile = await imageCompression(file, options)
```

#### OCR Request
```typescript
const response = await fetch('/api/ocr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image: base64Image })
})
```

#### Creating Visit with Prescriptions
```typescript
const visit = await prisma.visit.create({
  data: {
    patientId,
    visitDate: new Date(visitDate),
    symptoms,
    prescriptions: prescriptions ? {
      create: prescriptions.map(p => ({
        imagePath: p.imagePath,
        ocrResult: p.ocrResult || null
      }))
    } : undefined
  }
})
```

## Responsive UI Components

### NavBar Structure
```typescript
// Desktop: horizontal menu
// Mobile: hamburger menu with slide-out drawer
// Use lucide-react icons throughout
```

### Card Component
```typescript
<div className="tcm-card hover:shadow-lg transition-shadow p-4">
  {/* Content */}
</div>
```

### Delete Menu Pattern
```typescript
<div className="relative">
  <button onClick={() => setShowMenuId(id)}>
    <MoreVertical className="w-5 h-5" />
  </button>
  {showMenuId === id && (
    <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 whitespace-nowrap">
      <button className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
        <Trash2 className="w-4 h-4" />
        <span>删除</span>
      </button>
    </div>
  )}
</div>
```

## Common Issues & Solutions

### Issue: "OCR saves but data not persisted"
**Cause**: Visit API not checking user ownership
**Fix**: Always verify `patient.userId === currentUserId` before creating visit

### Issue: "Users see each other's data"
**Cause**: Missing userId filter in queries
**Fix**: Add `where: { userId }` to ALL findMany/findFirst calls

### Issue: "Delete button displays vertically"
**Cause**: Flex container wrapping text
**Fix**: Add `whitespace-nowrap` to menu container

### Issue: "Image upload fails on production"
**Cause**: File size too large or missing Content-Type
**Fix**: Compress images before upload, set proper headers

## Development Guidelines

### Before Implementing Features
1. Always check authentication state
2. Always filter data by userId
3. Add proper error handling
4. Test with multiple user accounts

### Security Checklist
- [ ] All API routes check userId
- [ ] All database queries filter by userId
- [ ] Passwords hashed with bcrypt
- [ ] Session cookies httpOnly and secure
- [ ] Input validation on all endpoints

### Performance Tips
- Use `useWebWorker: true` for image compression
- Limit image dimensions to 2000px max
- Compress images to ~800KB max
- Use `Promise.all` for parallel uploads
- Add loading states for async operations

## File Naming Conventions
- Pages: `camelCase` or `kebab-case` (e.g., `patients/page.tsx`)
- Components: `PascalCase` (e.g., `NavBar.tsx`)
- API routes: `kebab-case` (e.g., `patient-records/route.ts`)
- Utilities: `camelCase` (e.g., `auth.ts`, `prisma.ts`)

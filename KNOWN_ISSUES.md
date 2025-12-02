# ChurchFlow Known Issues & Fixes

## Critical Issue: Session Not Updated
**Root Cause:** After creating an organization, the session doesn't automatically update with the new `organizationId`.

**Immediate Fix:**
1. Create your organization at `/create-organization`
2. **Sign out completely**
3. **Sign in again**
4. All features should now work

---

## Reported Issues

### ❌ 1. HR & Payroll Features Not Functional
**Status:** Needs investigation
**Likely Cause:** Session missing `organizationId`
**Files to check:**
- `/src/components/hr/StaffTab.tsx`
- `/src/components/hr/PayrollTab.tsx`
- `/src/app/api/hr/staff/route.ts`
- `/src/app/api/hr/payroll/route.ts`

### ❌ 2. Reports Don't Capture Crowdfunding & Expenditure
**Status:** Needs fixing
**Files to check:**
- `/src/app/api/reports/financial/route.ts`
- `/src/components/reports/FinancialSummaryChart.tsx`

### ❌ 3. Sub-Organization Creation Fails
**Status:** Needs fixing
**Error:** "Failed to create organization"
**Files to check:**
- `/src/app/dashboard/organizations/create/page.tsx`
- `/src/app/dashboard/organizations/create/form.tsx`
- `/src/app/api/organizations/route.ts`

### ❌ 4. Edit/Delete Not Working
**Status:** Needs implementation
**Files to check:**
- All components with edit/delete buttons
- Missing API endpoints for UPDATE and DELETE operations

### ❌ 5. Can't See Organizations Under Settings
**Status:** Needs investigation
**Files to check:**
- `/src/app/dashboard/settings/page.tsx`
- `/src/components/organizations/OrganizationTree.tsx`

### ❌ 6. No Revenue Reflection on Dashboard
**Status:** Needs fixing
**Files to check:**
- `/src/app/dashboard/page.tsx`
- `/src/components/dashboard/*`

---

## Priority Fixes

### HIGH PRIORITY
1. ✅ Fix session update after organization creation
2. ⏳ Add session refresh mechanism
3. ⏳ Fix sub-organization creation
4. ⏳ Fix reports to include all transaction types

### MEDIUM PRIORITY
1. ⏳ Implement edit/delete functionality
2. ⏳ Fix organization list in settings
3. ⏳ Add revenue dashboard widget

### LOW PRIORITY
1. ⏳ Improve error messages
2. ⏳ Add loading states
3. ⏳ Better form validation

---

## Next Steps
1. User must log out and log back in
2. Test each feature systematically
3. Report which specific features still don't work
4. Address remaining issues one by one

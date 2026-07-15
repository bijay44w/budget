# UI Visual Context and Style Guide

This guide ensures design system uniformity across the application, stepping away from functional grid excel sheets to deliver an aesthetic between Linear, Notion, and the Stripe Dashboard.

---

## 1. Design Fundamentals
*   **Interface Treatment**: Prioritize generous breathing room, high whitespace distribution, rounded edge corners (`rounded-2xl`), flat non-gradient surface planes, minimal low-opacity borders (`border-slate-100`), and clean, light backgrounds (`#fafafa`).
*   **Primary Accent Accentuation**: Deep Teal (`#0d9488`). Used for call-to-action targets, active interactive indicators, and primary selection routes.

---

## 2. Semantic Diff Visual Identifiers
When rendering differential comparison structural elements, strictly maintain the following color palettes:
*   🟢 **Added**: Green theme (`text-emerald-600` / `bg-emerald-50`)
*   🟠 **Modified**: Amber theme (`text-amber-600` / `bg-amber-50`)
*   🔴 **Removed**: Red theme (`text-rose-600` / `bg-rose-50`)

---

## 3. Structural Master Layout Templates

### Budget Creator & Worksheet (70/30 Blueprint)
*   **Left Canvas (70%)**: Interactive structural entry grid. Minimal, borderless row selectors showing Category Name, Type selection, and Amount inputs. Completely free of aggressive table lines.
*   **Right Sidebar (30%)**: Sticky evaluation summary panel tracking Income KPIs, net calculated Savings Rates, and Recharts rendering distribution layouts.
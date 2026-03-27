---
description: Global standards for LifeLink Hackathon project including Expo, Firebase, UI/UX, and development workflow.
globs: **/*
---

# LifeLink Hackathon Standards

## ⚙️ General Development Rules
- Always write **clean, modular, and readable code**.
- Prefer **simple solutions over complex ones**; do not over-engineer.
- Keep code **Expo-compatible** at all times.
- Use **functional components with hooks**.

## 📱 UI / UX Rules
- UI must be **sleek, modern, and professional**.
- **Required:** Consistent spacing, clean layout, clear typography, well-designed buttons.
- **Avoid:** Cluttered screens, random styles, inconsistent colors.
- Every screen should look like a **real production app**, not a prototype.

## 🧩 Component & State Rules
- Break UI into **reusable components**.
- Avoid large files (>300 lines).
- Separate UI components from logic and services (Firebase/helpers).
- Use **React hooks** (useState, useEffect) for state.
- Use context only when absolutely necessary; keep state localized.

## 🔐 Authentication & Firebase
- Use **Firebase Authentication** (email/password).
- Store user roles (`donor` or `hospital`) and implement **role-based navigation**.
- Handle loading states, error messages, and session persistence.
- Use Firestore for `users`, `requests`, and `responses`.
- Use real-time listeners only where necessary.

## 💰 M-Pesa Simulation Rules
- **Do NOT use real APIs.**
- Keep logic simple and local.
- Support: suggested amount, editable amount, and full-cost checkbox.
- Generate a fake transaction ID on success.

## 🧱 Development Flow
1. Build **polished UI first**.
2. Add **local state + interactions**.
3. Integrate **Firebase** last.
- Every step must be runnable and testable in **Expo Go**.

## 🚨 Code Generation Rules
- **Do NOT generate the entire project at once.**
- Work step-by-step (phase-by-phase).
- After each step, **stop and wait for confirmation**.
- Always explain code simply.

## ⏱️ Hackathon Optimization
- **Prioritize:** Working demo, smooth user flow, clean UI.
- **De-prioritize:** Edge cases, complex architecture, unnecessary features.
- **Critical Flow:** Request → Notification → Donor accepts → Payment → Status update. Simplify anything that breaks this flow.

## 🧠 AI Behavior
- If a feature is too complex, suggest a simpler alternative.
- If a feature might break Expo Go, **warn the user** before implementing.
- Optimize for speed, clarity, and demo impact.

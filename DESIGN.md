---
name: jistev.dev
description: "Portfolio personal — Constructor de productos digitales · IA · Seguridad familiar"
colors:
  background: "#09090b"
  foreground: "#fafafa"
  muted: "#a1a1aa"
  accent: "#a78bfa"
  accent-hover: "#8b5cf6"
  card-bg: "#18181b"
  card-border: "#27272a"
  card-bg-hover: "#09090b"
  selection-bg: "rgba(167, 139, 250, 0.3)"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "Geist, system-ui, sans-serif"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
    fontSize: "0.875rem"
  mono:
    fontFamily: "Geist Mono, monospace"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  section: "96px"
  card: "24px"
  grid: "24px"
  inner: "16px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.full}"
    padding: "12px 32px"
    fontSize: "0.875rem"
    fontWeight: 500
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-outline:
    borderColor: "{colors.card-border}"
    textColor: "{colors.muted}"
    rounded: "{rounded.full}"
    padding: "12px 32px"
  button-outline-hover:
    borderColor: "{colors.muted}"
    textColor: "{colors.foreground}"
  card:
    backgroundColor: "{colors.card-bg}"
    borderColor: "{colors.card-border}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  card-hover:
    borderColor: "{colors.muted}"
  badge:
    backgroundColor: "rgba(167, 139, 250, 0.1)"
    textColor: "{colors.accent}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
    fontSize: "0.75rem"
  input:
    backgroundColor: "#09090b"
    borderColor: "#3f3f46"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

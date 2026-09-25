export function cn(...classes) {
  return classes
    .flatMap((c) => (typeof c === 'string' ? c.split(' ') : typeof c === 'object' && c ? Object.entries(c).filter(([, v]) => !!v).map(([k]) => k) : []))
    .filter(Boolean)
    .join(' ')
}



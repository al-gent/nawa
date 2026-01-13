import './globals.css'

export const metadata = {
  title: 'NawaConnect - Premier Service Marketplace for Namibia',
  description: 'Find trusted professionals for braiding, barbering, tutoring, plumbing and more in Windhoek and Swakopmund.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

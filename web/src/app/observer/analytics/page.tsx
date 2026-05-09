import AnalyticsPage from '@/app/curator/analytics/page'

export default function ObserverAnalyticsPage() {
  // This is exactly the same page, but the URL is /observer/analytics
  // In a real app with Auth, the middleware would block /curator for observers, 
  // but allow /observer.
  return <AnalyticsPage />
}

import AlertsSection from '../../components/AlertsSection/AlertsSection'
import { useSetPageTitle } from '../../hooks/useSetPageTitle'

export default function Alerts() {
  useSetPageTitle('Alerts')
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <AlertsSection />
    </div>
  )
}

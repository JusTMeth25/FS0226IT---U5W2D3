import { STATO_LABEL } from '../constants/stato'

export default function StatoBadge({ stato }) {
  const cls = 'badge badge--' + (stato || '').toLowerCase()
  return <span className={cls}>{STATO_LABEL[stato] || stato}</span>
}

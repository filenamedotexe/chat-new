// Export types
export type { ClientStatus, OrganizationStatus, StatusSummary, StatusTrend, StatusAlert, ClientHealthStatus } from './types/status';

// Export calculation functions
export { 
  calculateClientStatus, 
  calculateClientMetrics,
  getStatusColor,
  getStatusBgColor,
  getStatusDescription,
  getStatusPriority,
  DEFAULT_STATUS_RULES,
  type StatusMetrics,
  type StatusRules
} from './lib/calculate-status';

// Export components
export { StatusBadge, StatusIndicator } from './components/status-badge';
export { StatusLegend, StatusSummary as StatusSummaryComponent } from './components/status-legend';

// Export data functions
export { 
  getClientStatuses, 
  getClientStatusById, 
  getStatusSummary,
  getOrganizationStatuses 
} from './data/client-status';
export interface RoleChangeRequest {
  requestedRole: string;
  reason: string;
}

export interface RoleChangeResponse {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
} 
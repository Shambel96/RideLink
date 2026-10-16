import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileCheck,
  Search,
} from 'lucide-react';
import { driversApi, VerifyDriverPayload } from '../../api/drivers.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { DriverProfile, DriverVerificationStatus } from '../../types';

export const DriverVerificationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<DriverVerificationStatus | 'ALL'>('PENDING');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedDriver, setSelectedDriver] = useState<DriverProfile | null>(null);
  const [decisionAction, setDecisionAction] = useState<'APPROVED' | 'REJECTED' | 'SUSPENDED'>('APPROVED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-drivers', page, limit, statusFilter],
    queryFn: () =>
      driversApi.findAll({
        page,
        limit,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: VerifyDriverPayload }) =>
      driversApi.verify(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drivers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setSelectedDriver(null);
      setRejectionReason('');
      setActionError(null);
    },
    onError: (err: unknown) => {
      setActionError(err instanceof Error ? err.message : 'Verification update failed');
    },
  });

  const handleOpenDecision = (
    driver: DriverProfile,
    action: 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  ) => {
    setSelectedDriver(driver);
    setDecisionAction(action);
    setRejectionReason('');
    setActionError(null);
  };

  const handleConfirmDecision = () => {
    if (!selectedDriver) return;
    verifyMutation.mutate({
      id: selectedDriver.id,
      payload: {
        status: decisionAction,
        rejectionReason: rejectionReason.trim() || undefined,
      },
    });
  };

  const drivers = data?.drivers || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Driver Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review submitted government license documents and approve, reject, or suspend drivers
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ALL'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                  statusFilter === status
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {status === 'ALL' ? 'All Applicants' : status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Driver List / Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-20 w-full" />
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No Driver Applications Found"
          description={`There are currently no driver applications matching status "${statusFilter}".`}
        />
      ) : (
        <Card variant="elevated" className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Driver / Applicant</th>
                  <th className="py-3.5 px-4">License Identifier</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{driver.user?.name}</div>
                      <div className="text-[11px] text-slate-400">{driver.user?.email}</div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-800">
                      {driver.licenseNumber}
                    </td>
                    <td className="py-4 px-4 text-slate-600">{driver.user?.phone}</td>
                    <td className="py-4 px-4 text-slate-400">
                      {new Date(driver.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <Badge status={driver.verificationStatus} size="sm" />
                      {driver.rejectionReason && (
                        <div className="text-[10px] text-rose-600 italic mt-0.5 max-w-[140px] truncate" title={driver.rejectionReason}>
                          Reason: {driver.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {driver.verificationStatus !== 'APPROVED' && (
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => handleOpenDecision(driver, 'APPROVED')}
                        >
                          Approve
                        </Button>
                      )}
                      {driver.verificationStatus === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-rose-600 border-rose-200 hover:bg-rose-50"
                          onClick={() => handleOpenDecision(driver, 'REJECTED')}
                        >
                          Reject
                        </Button>
                      )}
                      {driver.verificationStatus === 'APPROVED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-600 border-amber-200 hover:bg-amber-50"
                          onClick={() => handleOpenDecision(driver, 'SUSPENDED')}
                        >
                          Suspend
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Page {data.page} of {data.totalPages} (Total {data.total} drivers)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage(page + 1)}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Action Decision Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedDriver)}
        onClose={() => setSelectedDriver(null)}
        title={`${decisionAction === 'APPROVED' ? 'Approve' : decisionAction === 'REJECTED' ? 'Reject' : 'Suspend'} Driver?`}
        description={`Applicant: ${selectedDriver?.user?.name} (License: ${selectedDriver?.licenseNumber})`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setSelectedDriver(null)}>
              Cancel
            </Button>
            <Button
              variant={decisionAction === 'APPROVED' ? 'accent' : 'danger'}
              size="sm"
              isLoading={verifyMutation.isPending}
              onClick={handleConfirmDecision}
            >
              Confirm {decisionAction}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {actionError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {actionError}
            </div>
          )}

          {decisionAction !== 'APPROVED' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Reason / Administrative Note (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="e.g. Incomplete license documentation or temporary suspension..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          )}

          <p className="text-xs text-slate-500">
            {decisionAction === 'APPROVED'
              ? 'Approving will grant this user driver privileges, allowing them to register vehicles and accept ride requests.'
              : 'This decision will update the driver record immediately.'}
          </p>
        </div>
      </Modal>
    </div>
  );
};

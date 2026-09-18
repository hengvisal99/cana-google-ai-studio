import type { AuthorizationTimelineItem, CustomerTypeApproval, WorkflowRole, WorkflowStage } from '@/types';

/**
 * Registration and close-account workflow for customer type records that need approval
 * (e.g. Personal Representative). Mirrors a customer's flow: submitted by the CSO, then
 * SR review, then Manager final approval; any reviewer can send it back or reject it.
 */

export type ApprovalAction = 'authorize' | 'resubmit' | 'reject';

/** Officer who acts at each review stage by default */
export const STAGE_AUTHORIZER: Record<WorkflowRole, string> = {
  CSO: 'Sophea Keo (CSO)',
  SR: 'Dara Vong (SR)',
  Manager: 'Vannak Lim (Manager)',
};

const timestamp = () => {
  const now = new Date();
  return `${now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })} ${now.toLocaleTimeString(
    'en-US',
    { hour: '2-digit', minute: '2-digit' }
  )}`;
};

const historyItem = (item: Omit<AuthorizationTimelineItem, 'id' | 'dateTime'>): AuthorizationTimelineItem => ({
  id: `AUTH-${Date.now()}`,
  dateTime: timestamp(),
  ...item,
});

/** New record: registration submitted by the CSO, waiting for SR review */
export function newRegistration(processedBy = STAGE_AUTHORIZER.CSO): CustomerTypeApproval {
  return {
    requestType: 'Registration',
    requestStatus: 'Pending',
    currentWorkflowStage: 'SR',
    history: [
      historyItem({
        requestType: 'Registration',
        stage: 'Registration Submitted — CSO',
        status: 'Submitted',
        processedBy,
        role: 'CSO',
        comment: 'Registration submitted for approval.',
      }),
    ],
  };
}

/** A record sent back for resubmission goes to SR review again once it is corrected */
export function resubmitted(approval: CustomerTypeApproval, processedBy = STAGE_AUTHORIZER.CSO): CustomerTypeApproval {
  return {
    ...approval,
    requestStatus: 'Pending',
    currentWorkflowStage: 'SR',
    history: [
      ...approval.history,
      historyItem({
        requestType: approval.requestType,
        stage: `${approval.requestType} Resubmitted — CSO`,
        status: 'Submitted',
        processedBy,
        role: 'CSO',
        comment: 'Corrected and resubmitted for approval.',
      }),
    ],
  };
}

/** Role that reviews at the current stage, or null once the request is decided */
export function reviewerRole(stage: WorkflowStage): WorkflowRole | null {
  return stage === 'CSO' || stage === 'SR' || stage === 'Manager' ? stage : null;
}

/** Label for where an approval moves the request next */
export function nextStageLabel(stage: WorkflowStage): string {
  if (stage === 'CSO') return 'Senior Review';
  if (stage === 'SR') return 'Manager Review';
  return 'Final Approval';
}

export function decide(approval: CustomerTypeApproval, action: ApprovalAction, reason = ''): CustomerTypeApproval {
  const role = reviewerRole(approval.currentWorkflowStage) ?? 'Manager';
  const processedBy = STAGE_AUTHORIZER[role];

  let currentWorkflowStage = approval.currentWorkflowStage;
  let requestStatus = approval.requestStatus;
  if (action === 'authorize') {
    if (currentWorkflowStage === 'CSO') currentWorkflowStage = 'SR';
    else if (currentWorkflowStage === 'SR') currentWorkflowStage = 'Manager';
    else {
      currentWorkflowStage = approval.requestType === 'Close Account' ? 'Closed' : 'Approved';
      requestStatus = 'Approved';
    }
  } else {
    currentWorkflowStage = action === 'resubmit' ? 'Resubmit' : 'Rejected';
    requestStatus = action === 'resubmit' ? 'Resubmit' : 'Rejected';
  }

  const verb = action === 'authorize' ? 'Authorization' : action === 'resubmit' ? 'Resubmission Request' : 'Rejection';
  return {
    ...approval,
    currentWorkflowStage,
    requestStatus,
    history: [
      ...approval.history,
      historyItem({
        requestType: approval.requestType,
        stage: approval.requestType === 'Close Account' ? `Close Account — ${role} ${verb}` : `${role} ${verb}`,
        status: action === 'authorize' ? 'Approved' : action === 'resubmit' ? 'Resubmit' : 'Rejected',
        processedBy,
        role,
        comment: action === 'authorize' ? `Approved by ${processedBy}` : reason,
        reason: action === 'authorize' ? undefined : reason,
      }),
    ],
  };
}

/** Close account needs only the cancelled date; it then goes through SR and Manager approval */
export function requestClose(
  approval: CustomerTypeApproval,
  cancelledDate: string,
  processedBy = STAGE_AUTHORIZER.CSO
): CustomerTypeApproval {
  return {
    ...approval,
    requestType: 'Close Account',
    requestStatus: 'Pending',
    currentWorkflowStage: 'SR',
    cancelledDate,
    history: [
      ...approval.history,
      historyItem({
        requestType: 'Close Account',
        stage: 'Close Account Request — Initiated',
        status: 'Submitted',
        processedBy,
        role: 'CSO',
        comment: `Close account requested, cancelled date ${cancelledDate}.`,
      }),
    ],
  };
}

/** Close account is offered once the registration is approved */
export const canRequestClose = (approval?: CustomerTypeApproval) =>
  approval?.requestType === 'Registration' && approval.requestStatus === 'Approved';

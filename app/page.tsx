'use client';

import React, { useState } from 'react';
import { 
  DesignTheme, 
  NavigationPage, 
  SupportedLanguage, 
  EnterpriseApp, 
  Individual 
} from '@/types';
import type { CustomerTypeRecord } from '@/types';
import { INITIAL_INDIVIDUALS } from '@/lib/data';
import { INITIAL_CUSTOMER_TYPE_RECORDS } from '@/lib/customer-type-records';

// Theme Shells
import { SoftFintechShell } from '@/components/themes/SoftFintechShell';
import { GlassmorphismShell } from '@/components/themes/GlassmorphismShell';
import { AuroraShell } from '@/components/themes/AuroraShell';

// Screens
import { DashboardScreen } from '@/components/dashboard/DashboardScreen';
import { Customer360Screen } from '@/components/customer360/Customer360Screen';
import { IndividualListScreen } from '@/components/individual/IndividualListScreen';
import { IndividualInsertScreen } from '@/components/individual/IndividualInsertScreen';
import { IndividualUpdateScreen } from '@/components/individual/IndividualUpdateScreen';
import { CustomerTypeScreen } from '@/components/customer/CustomerTypeScreen';

// Dialog Modal
import { ViewIndividualDialog } from '@/components/shared/ViewIndividualDialog';

export default function Home() {
  // Global Design Theme State (Glassmorphism)
  const [currentTheme, setCurrentTheme] = useState<DesignTheme>('glassmorphism');

  // Navigation State (Dashboard, Customer 360, Individual: List, Insert, Update)
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');

  // Header State
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('EN');
  const [currentApp, setCurrentApp] = useState<EnterpriseApp>('Nexus Core Banking');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Individual Database State
  const [individuals, setIndividuals] = useState<Individual[]>(INITIAL_INDIVIDUALS);

  // Customer Type records (many per customer, several per type allowed)
  const [customerTypeRecords, setCustomerTypeRecords] = useState<CustomerTypeRecord[]>(INITIAL_CUSTOMER_TYPE_RECORDS);

  // Active customer in Customer 360
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(INITIAL_INDIVIDUALS[0].id);

  // View Individual Dialog State (View -> use a dialog)
  const [viewDialogIndividual, setViewDialogIndividual] = useState<Individual | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Updating Individual (Update -> dedicated screen)
  const [updatingIndividual, setUpdatingIndividual] = useState<Individual | null>(null);

  // Navigation Handlers
  const handleNavigate = (page: NavigationPage) => {
    setCurrentPage(page);
  };

  const handleViewIndividual = (individual: Individual) => {
    setViewDialogIndividual(individual);
    setIsViewDialogOpen(true);
  };

  const handleNavigateToInsert = () => {
    setCurrentPage('individual-insert');
  };

  const handleNavigateToUpdate = (individual: Individual) => {
    setUpdatingIndividual(individual);
    setCurrentPage('individual-update');
  };

  const handleNavigateToCustomer360 = (individual?: Individual) => {
    if (individual) {
      setSelectedCustomerId(individual.id);
    }
    setCurrentPage('customer-360');
  };

  // CRUD Handlers
  const handleInsertSuccess = (newIndividual: Individual) => {
    setIndividuals((prev) => [newIndividual, ...prev]);
    setSelectedCustomerId(newIndividual.id);
    setCurrentPage('individual-list');
  };

  const handleUpdateSuccess = (updatedIndividual: Individual) => {
    setIndividuals((prev) =>
      prev.map((ind) => (ind.id === updatedIndividual.id ? updatedIndividual : ind))
    );
    if (selectedCustomerId === updatedIndividual.id) {
      setSelectedCustomerId(updatedIndividual.id);
    }
    setUpdatingIndividual(null);
    setCurrentPage('individual-list');
  };

  const handleDeleteIndividual = (id: string) => {
    setIndividuals((prev) => prev.filter((item) => item.id !== id));
    setCustomerTypeRecords((prev) => prev.filter((record) => record.customerId !== id));
    if (selectedCustomerId === id && individuals.length > 1) {
      const remaining = individuals.filter((item) => item.id !== id);
      setSelectedCustomerId(remaining[0].id);
    }
  };

  const handleAuthorizeIndividual = (
    id: string,
    action: 'authorize' | 'resubmit' | 'reject',
    role: 'CSO' | 'SR' | 'Manager',
    processedBy: string,
    comment: string,
    reason?: string
  ) => {
    setIndividuals((prev) =>
      prev.map((ind) => {
        if (ind.id !== id) return ind;

        let nextStage = ind.currentWorkflowStage;
        let nextStatus = ind.requestStatus;
        let nextProfileStatus = ind.profileStatus;
        let nextAccountStatus = ind.accountStatus;

        const now = new Date();
        const formattedDate = `${now.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        })} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

        if (action === 'authorize') {
          if (ind.currentWorkflowStage === 'CSO') {
            nextStage = 'SR';
            nextStatus = 'Pending';
          } else if (ind.currentWorkflowStage === 'SR') {
            nextStage = 'Manager';
            nextStatus = 'Pending';
          } else if (ind.currentWorkflowStage === 'Manager') {
            nextStage = 'Approved';
            nextStatus = 'Approved';
            if (ind.requestType === 'Registration') {
              nextProfileStatus = 'Completed';
              nextAccountStatus = 'Active';
            } else if (ind.requestType === 'Close Account') {
              nextAccountStatus = 'Not Opened';
            }
          }
        } else if (action === 'resubmit') {
          nextStage = 'Resubmit';
          nextStatus = 'Resubmit';
        } else if (action === 'reject') {
          nextStage = 'Rejected';
          nextStatus = 'Rejected';
        }

        const newTimelineItem = {
          id: `AUTH-${Date.now()}`,
          requestType: ind.requestType,
          stage: ind.requestType === 'Close Account'
            ? `Close Account — ${role} ${action === 'authorize' ? 'Authorization' : action === 'resubmit' ? 'Resubmission Request' : 'Rejection'}`
            : `${role} ${action === 'authorize' ? 'Authorization' : action === 'resubmit' ? 'Resubmission Request' : 'Rejection'}`,
          status: action === 'authorize' ? ('Approved' as const) : action === 'resubmit' ? ('Resubmit' as const) : ('Rejected' as const),
          dateTime: formattedDate,
          processedBy,
          role,
          comment,
          reason,
        };

        const updated = {
          ...ind,
          currentWorkflowStage: nextStage,
          requestStatus: nextStatus,
          profileStatus: nextProfileStatus,
          accountStatus: nextAccountStatus,
          authorizationHistory: [...ind.authorizationHistory, newTimelineItem],
        };

        if (viewDialogIndividual && viewDialogIndividual.id === id) {
          setViewDialogIndividual(updated);
        }

        return updated;
      })
    );
  };

  const handleCloseAccountIndividual = (
    id: string,
    closeDate: string,
    account: string,
    reason: string,
    processedBy: string
  ) => {
    setIndividuals((prev) =>
      prev.map((ind) => {
        if (ind.id !== id) return ind;

        const now = new Date();
        const formattedDate = `${now.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        })} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

        const updated = {
          ...ind,
          requestType: 'Close Account' as const,
          requestStatus: 'Pending' as const,
          currentWorkflowStage: 'SR' as const,
          closeAccountInfo: {
            closeDate,
            account,
            reason,
          },
          authorizationHistory: [
            ...ind.authorizationHistory,
            {
              id: `AUTH-${Date.now()}`,
              requestType: 'Close Account' as const,
              stage: 'Close Account Request — Initiated',
              status: 'Submitted' as const,
              dateTime: formattedDate,
              processedBy,
              role: 'CSO' as const,
              comment: `Account closure initiated for ${account}.`,
              reason,
            },
          ],
        };

        if (viewDialogIndividual && viewDialogIndividual.id === id) {
          setViewDialogIndividual(updated);
        }

        return updated;
      })
    );
  };

  // Insert or update a customer type record by id
  const handleSaveCustomerTypeRecord = (record: CustomerTypeRecord) => {
    setCustomerTypeRecords((prev) =>
      prev.some((item) => item.id === record.id)
        ? prev.map((item) => (item.id === record.id ? record : item))
        : [record, ...prev]
    );
  };

  const handleDeleteCustomerTypeRecord = (id: string) => {
    setCustomerTypeRecords((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReload = () => {
    setIndividuals(INITIAL_INDIVIDUALS);
  };

  // Active Screen Content Renderer
  const renderActiveScreen = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardScreen
            individuals={individuals}
            onNavigateToInsert={handleNavigateToInsert}
            onNavigateToList={() => setCurrentPage('individual-list')}
            onNavigateToCustomer360={handleNavigateToCustomer360}
            onViewIndividual={handleViewIndividual}
            onNavigateToUpdate={handleNavigateToUpdate}
            theme={currentTheme}
          />
        );

      case 'customer-360':
        return (
          <Customer360Screen
            individuals={individuals}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={setSelectedCustomerId}
            onViewIndividual={handleViewIndividual}
            onNavigateToUpdate={handleNavigateToUpdate}
            theme={currentTheme}
          />
        );

      case 'individual-list':
        return (
          <IndividualListScreen
            individuals={individuals}
            onViewIndividual={handleViewIndividual}
            onNavigateToInsert={handleNavigateToInsert}
            onNavigateToUpdate={handleNavigateToUpdate}
            onNavigateToCustomer360={handleNavigateToCustomer360}
            onDeleteIndividual={handleDeleteIndividual}
            onAuthorizeIndividual={handleAuthorizeIndividual}
            onCloseAccountIndividual={handleCloseAccountIndividual}
            onSaveCustomerTypeRecord={handleSaveCustomerTypeRecord}
            customerTypeRecordIds={customerTypeRecords.map((record) => record.id)}
            onReload={handleReload}
            theme={currentTheme}
          />
        );

      case 'individual-insert':
        return (
          <IndividualInsertScreen
            onCancel={() => setCurrentPage('individual-list')}
            onSubmitSuccess={handleInsertSuccess}
            theme={currentTheme}
          />
        );

      case 'individual-update':
        return updatingIndividual ? (
          <IndividualUpdateScreen
            individual={updatingIndividual}
            onCancel={() => {
              setUpdatingIndividual(null);
              setCurrentPage('individual-list');
            }}
            onSubmitSuccess={handleUpdateSuccess}
            theme={currentTheme}
          />
        ) : (
          <IndividualListScreen
            individuals={individuals}
            onViewIndividual={handleViewIndividual}
            onNavigateToInsert={handleNavigateToInsert}
            onNavigateToUpdate={handleNavigateToUpdate}
            onNavigateToCustomer360={handleNavigateToCustomer360}
            onDeleteIndividual={handleDeleteIndividual}
            onAuthorizeIndividual={handleAuthorizeIndividual}
            onCloseAccountIndividual={handleCloseAccountIndividual}
            onSaveCustomerTypeRecord={handleSaveCustomerTypeRecord}
            customerTypeRecordIds={customerTypeRecords.map((record) => record.id)}
            onReload={handleReload}
            theme={currentTheme}
          />
        );

      case 'customer-type':
        return (
          <CustomerTypeScreen
            records={customerTypeRecords}
            customers={individuals}
            onSaveRecord={handleSaveCustomerTypeRecord}
            onDeleteRecord={handleDeleteCustomerTypeRecord}
          />
        );
    }
  };

  // Shell Props common to all 3 themes
  const shellProps = {
    currentPage,
    onNavigate: handleNavigate,
    currentTheme,
    onThemeChange: setCurrentTheme,
    currentLanguage,
    onLanguageChange: setCurrentLanguage,
    currentApp,
    onAppChange: setCurrentApp,
    sidebarCollapsed,
    onToggleSidebar: () => setSidebarCollapsed(!sidebarCollapsed),
    children: renderActiveScreen(),
  };

  // Render the distinct Shell template for the selected theme
  const renderThemeTemplate = () => {
    switch (currentTheme) {
      case 'glassmorphism':
        return <GlassmorphismShell {...shellProps} />;
      case 'aurora':
        return <AuroraShell {...shellProps} />;
      case 'soft-fintech':
      default:
        return <SoftFintechShell {...shellProps} />;
    }
  };

  return (
    <>
      {/* Active Distinct Theme Layout & Template */}
      {renderThemeTemplate()}

      {/* Individual: View → Dedicated Dialog Modal */}
      <ViewIndividualDialog
        individual={viewDialogIndividual}
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        onNavigateToUpdate={handleNavigateToUpdate}
        onNavigateToCustomer360={handleNavigateToCustomer360}
        onAuthorizeIndividual={handleAuthorizeIndividual}
        onCloseAccountIndividual={handleCloseAccountIndividual}
        theme={currentTheme}
      />
    </>
  );
}

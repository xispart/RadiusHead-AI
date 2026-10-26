/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shell, NavigationTab } from './components/layout/Shell';
import { Dashboard } from './components/dashboard/Dashboard';
import { CaseStudio } from './components/caseStudio/CaseStudio';
import { FractureExplorer } from './components/fractureExplorer/FractureExplorer';
import { AIReviewView } from './components/aiReview/AIReviewView';
import { ReportStudio } from './components/reportStudio/ReportStudio';
import { MedicalDisclaimer } from './components/common/MedicalDisclaimer';
import { Case, FractureFeatures } from './types/ortho';
import { INITIAL_DEMO_CASE, createBlankCase } from './data/demoCase';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [activeCase, setActiveCase] = useState<Case>(INITIAL_DEMO_CASE);

  const handleLoadDemoCase = () => {
    setActiveCase({ ...INITIAL_DEMO_CASE });
  };

  const handleNewCase = () => {
    const blank = createBlankCase();
    setActiveCase(blank);
    setActiveTab('caseStudio');
  };

  const handleSaveCase = (updatedCase: Case) => {
    setActiveCase(updatedCase);
  };

  const handleUpdateFractureFeatures = (updated: Partial<FractureFeatures>) => {
    setActiveCase((prev) => ({
      ...prev,
      fractureFeatures: {
        ...prev.fractureFeatures,
        ...updated,
      },
    }));
  };

  return (
    <Shell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      caseTitle={activeCase.title}
      caseId={activeCase.id}
      onLoadDemoCase={handleLoadDemoCase}
      onNewCase={handleNewCase}
    >
      {/* Top Banner on main content */}
      <MedicalDisclaimer />

      {/* Tab Panels */}
      {activeTab === 'dashboard' && (
        <Dashboard
          activeCase={activeCase}
          onLoadDemoCase={handleLoadDemoCase}
          onNewCase={handleNewCase}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'caseStudio' && (
        <CaseStudio
          activeCase={activeCase}
          onSaveCase={handleSaveCase}
          onNavigateToAIReview={() => setActiveTab('aiReview')}
        />
      )}

      {activeTab === 'fractureExplorer' && (
        <FractureExplorer
          fractureFeatures={activeCase.fractureFeatures}
          onUpdateFeatures={handleUpdateFractureFeatures}
        />
      )}

      {activeTab === 'aiReview' && (
        <AIReviewView
          activeCase={activeCase}
          onUpdateCase={handleSaveCase}
          onNavigateToReport={() => setActiveTab('reportStudio')}
        />
      )}

      {activeTab === 'reportStudio' && (
        <ReportStudio
          activeCase={activeCase}
          onBackToCase={() => setActiveTab('aiReview')}
        />
      )}
    </Shell>
  );
}

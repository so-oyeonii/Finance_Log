'use client';

import { useMemo } from 'react';
import { Settings2, Check } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import { useAppStore } from '@/stores/useAppStore';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useStocks } from '@/hooks/useStocks';
import { cn } from '@/lib/utils';
import { WidgetWrapper } from './WidgetWrapper';

import { NetWorthWidget } from './widgets/NetWorthWidget';
import { ExpenseTop3Widget } from './widgets/ExpenseTop3Widget';
import { IncomeChartWidget } from './widgets/IncomeChartWidget';
import { ExpenseChartWidget } from './widgets/ExpenseChartWidget';
import { DividendChartWidget } from './widgets/DividendChartWidget';
import { PortfolioWidget } from './widgets/PortfolioWidget';
import { InvestCompWidget } from './widgets/InvestCompWidget';
import { AiReportWidget } from './widgets/AiReportWidget';
import { SavingsMaturityWidget } from './widgets/SavingsMaturityWidget';
import { IncomeInsightWidget } from './widgets/IncomeInsightWidget';
import { RebalancingWidget } from './widgets/RebalancingWidget';
import { CapitalGainsTaxWidget } from './widgets/CapitalGainsTaxWidget';
import { SpendLimitWidget } from './widgets/SpendLimitWidget';

export function DashboardView() {
  const {
    mode, selectedYear,
    dashboardLayout, setDashboardLayout,
    isEditingLayout, setIsEditingLayout,
  } = useAppStore();

  const { totalBalance } = useAccounts();
  const { monthlyStats, expenseByCategory, incomeInsights } = useTransactions(selectedYear);
  const { stocks, portfolio, portfolioByMarket, dividendStats } = useStocks(selectedYear);

  const isGraduate = mode === 'graduate';

  const netWorth = useMemo(
    () => totalBalance + portfolio.totalValuation,
    [totalBalance, portfolio.totalValuation]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = dashboardLayout.indexOf(active.id as string);
    const newIdx = dashboardLayout.indexOf(over.id as string);
    setDashboardLayout(arrayMove(dashboardLayout, oldIdx, newIdx));
  };

  const widgetMap: Record<string, React.ReactNode> = {
    netWorth: (
      <NetWorthWidget
        netWorth={netWorth}
        bankAssets={totalBalance}
        investAssets={portfolio.totalValuation}
        mode={mode}
      />
    ),
    expenseTop3: (
      <ExpenseTop3Widget data={expenseByCategory} mode={mode} />
    ),
    incomeChart: (
      <IncomeChartWidget monthlyStats={monthlyStats} incomeInsights={incomeInsights} />
    ),
    incomeInsight: <IncomeInsightWidget insights={incomeInsights} />,
    expenseChart: (
      <ExpenseChartWidget monthlyStats={monthlyStats} />
    ),
    dividendChart: (
      <DividendChartWidget dividendStats={dividendStats} selectedYear={selectedYear} allStocks={stocks} />
    ),
    portfolio: (
      <PortfolioWidget data={portfolioByMarket} />
    ),
    investComp: (
      <InvestCompWidget holdings={portfolio.activeHoldings} />
    ),
    aiReport: <AiReportWidget />,
    savingsMaturity: <SavingsMaturityWidget />,
    rebalancing: <RebalancingWidget portfolio={portfolio} />,
    capitalGainsTax: <CapitalGainsTaxWidget stocks={stocks} selectedYear={selectedYear} />,
    spendLimit: <SpendLimitWidget monthlyStats={monthlyStats} insights={incomeInsights} />,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">대시보드</h2>
        <button
          onClick={() => setIsEditingLayout(!isEditingLayout)}
          className={cn(
            'flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors',
            isEditingLayout
              ? 'bg-green-600 text-white hover:bg-green-700'
              : isGraduate
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
          )}
        >
          {isEditingLayout ? (
            <>
              <Check className="w-3.5 h-3.5" />
              완료
            </>
          ) : (
            <>
              <Settings2 className="w-3.5 h-3.5" />
              편집
            </>
          )}
        </button>
      </div>

      {/* Widget Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={dashboardLayout} strategy={rectSortingStrategy}>
          <div className="grid gap-4 md:grid-cols-2">
            {dashboardLayout.map((widgetId) => (
              <WidgetWrapper
                key={widgetId}
                id={widgetId}
                isEditing={isEditingLayout}
                className={widgetId === 'netWorth' ? 'md:col-span-2' : undefined}
              >
                {widgetMap[widgetId]}
              </WidgetWrapper>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

import { AppReportAnswers, Chat, Chats } from 'ai-worker-common';
import { useMemo } from 'react';
import { DataObjectStates } from '../../../state/data-object/DataObjectStates';
import { factsToReports } from '../../../ui/chat/mind/report/factsToReports';
import { getValuesFromVariable } from '../utils/utils';

export function useChatSummary(chat: Chat | undefined) {
  // Use the Hook at the top level
  const chatStateEntries = DataObjectStates.useChildDataObjects(
    chat?.id || '', 
    "chat-state-entry"
  ).filter((cse) => cse.namespace !== "aipl");

  const summary = useMemo(() => {
    // If no chat, return empty string
    if (!chat?.id) return '';

    // Convert chat state entries to facts
    const facts = Chats.chatStateEntriesToFacts(chatStateEntries);

    // Convert facts to reports
    const reports = factsToReports(facts);

    // If no reports, return empty string
    if (!reports || reports.length === 0) return '';

    // Get only the last report of each by name
    const reportByName: Record<string, AppReportAnswers> = {};
    for (const report of reports) {
      reportByName[report.name] = report;
    }
    const finalReports = Object.values(reportByName);
    console.log("Final",finalReports)
    // Get summary from user report
    const summary = getValuesFromVariable(finalReports, 'userInfo', 'convoSummary');

    // Return summary or empty string if not found
    return summary || '';
  }, [chat?.id, chatStateEntries]);

  return summary;
}
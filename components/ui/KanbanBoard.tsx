"use client";

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';

import type { SavedOpportunity } from '@/types';

/**
 * Simple Kanban board that groups saved opportunities by their application status.
 * Uses react-beautiful-dnd for drag‑and‑drop support (requires the library).
 */
const STATUS_COLORS: Record<string, string> = {
  'Saved': 'border-l-slate-500',
  'Planning to Apply': 'border-l-blue-500',
  'Applied': 'border-l-amber-500',
  'Interview': 'border-l-purple-500',
  'Accepted': 'border-l-emerald-500',
  'Rejected': 'border-l-rose-500',
  'Waitlisted': 'border-l-indigo-500'
};

const KanbanBoard: React.FC<{
  savedOpps: SavedOpportunity[];
  onStatusChange: (id: string, newStatus: string) => void;
}> = ({ savedOpps, onStatusChange }) => {
  // Group opportunities by status, pre-initializing all standard statuses so empty columns are visible
  const columns: Record<string, SavedOpportunity[]> = {
    'Saved': [],
    'Planning to Apply': [],
    'Applied': [],
    'Interview': [],
    'Accepted': [],
    'Rejected': [],
    'Waitlisted': []
  };

  savedOpps.forEach((s) => {
    const status = s.application_status;
    if (!columns[status]) columns[status] = [];
    columns[status].push(s);
  });

  // Handle drag end to update status
  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const movedOpp = savedOpps.find((o) => o.id === draggableId);
    if (movedOpp) {
      onStatusChange(movedOpp.id, destination.droppableId);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col md:flex-row gap-4 overflow-x-auto p-2" role="region" aria-label="Kanban Board">
        {Object.entries(columns).map(([status, items]) => (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex-1 min-w-[300px] bg-zinc-900 border border-zinc-800 rounded-lg p-4 border-l-4 ${STATUS_COLORS[status] || 'border-l-gray-500'}`}
          >
            <h3 className="text-lg font-semibold mb-3 flex justify-between items-center text-zinc-100">
              {status}
              <span className="text-sm bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md font-mono">{items.length}</span>
            </h3>
            <Droppable droppableId={status} type="CARD">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[100px]">
                  {items.map((s, i) => (
                    <Draggable key={s.id} draggableId={s.id} index={i}>
                      {(providedCard) => (
                        <div
                          className="bg-zinc-800 border border-zinc-700 rounded-md p-3 mb-3 cursor-grab hover:bg-zinc-700 transition-colors shadow-sm"
                          ref={providedCard.innerRef}
                          {...providedCard.draggableProps}
                          {...providedCard.dragHandleProps}
                          role="listitem"
                        >
                          <p className="font-medium line-clamp-1 text-zinc-100">{s.opportunity?.title}</p>
                          <small className="text-zinc-500">{s.priority} priority</small>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </motion.div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;

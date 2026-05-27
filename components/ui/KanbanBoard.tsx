import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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
  // Group opportunities by status
  const columns: Record<string, SavedOpportunity[]> = {};
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
    <div className="flex flex-col md:flex-row gap-4 overflow-x-auto p-2" role="region" aria-label="Kanban Board">
      {Object.entries(columns).map(([status, items]) => (
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex-1 min-w-[300px] bg-white/5 border border-white/10 rounded-xl p-4 border-l-4 ${STATUS_COLORS[status] || 'border-l-gray-500'}`}
        >
          <h3 className="text-lg font-semibold mb-3 flex justify-between items-center">
            {status}
            <span className="text-sm bg-white/10 px-2 py-0.5 rounded-full">{items.length}</span>
          </h3>
          <Droppable droppableId={status} type="CARD">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[100px]">
                {items.map((s, i) => (
                  <Draggable key={s.id} draggableId={s.id} index={i}>
                    {(providedCard) => (
                      <div
                        className="bg-white/10 border border-white/20 rounded-lg p-3 mb-3 cursor-grab hover:bg-white/20 transition-colors"
                        ref={providedCard.innerRef}
                        {...providedCard.draggableProps}
                        {...providedCard.dragHandleProps}
                        role="listitem"
                      >
                        <p className="font-medium line-clamp-1">{s.opportunity?.title}</p>
                        <small className="text-slate-400">{s.priority} priority</small>
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
  );
};

export default KanbanBoard;

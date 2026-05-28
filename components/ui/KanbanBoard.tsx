"use client";

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';

import type { SavedOpportunity } from '@/types';

/**
 * Simple Kanban board that groups saved opportunities by their application status.
 * Uses hello-pangea/dnd for robust drag‑and‑drop support.
 */
const STATUS_COLORS: Record<string, string> = {
  'Saved': 'border-l-slate-400',
  'Planning to Apply': 'border-l-blue-500',
  'Applied': 'border-l-indigo-500',
  'Interview': 'border-l-purple-500',
  'Accepted': 'border-l-emerald-500',
  'Rejected': 'border-l-rose-500',
  'Waitlisted': 'border-l-amber-500'
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
      <div className="flex flex-col md:flex-row gap-5 overflow-x-auto pb-4 pt-1" role="region" aria-label="Kanban Board">
        {Object.entries(columns).map(([status, items]) => (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex-1 min-w-[280px] bg-white/60 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 border-l-4 shadow-sm flex flex-col ${STATUS_COLORS[status] || 'border-l-gray-400'}`}
          >
            <h3 className="text-sm font-extrabold mb-4 flex justify-between items-center text-slate-700 tracking-wide uppercase">
              {status}
              <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full font-bold">{items.length}</span>
            </h3>
            <Droppable droppableId={status} type="CARD">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[250px] flex-1">
                  {items.map((s, i) => (
                    <Draggable key={s.id} draggableId={s.id} index={i}>
                      {(providedCard) => (
                        <div
                          className="bg-white border border-slate-200/80 rounded-xl p-4 mb-3 cursor-grab hover:border-blue-400 hover:shadow-md transition-all duration-200 shadow-sm group"
                          ref={providedCard.innerRef}
                          {...providedCard.draggableProps}
                          {...providedCard.dragHandleProps}
                          role="listitem"
                        >
                          <p className="font-extrabold text-sm line-clamp-2 text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">{s.opportunity?.title}</p>
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
                            <span className="text-[10px] uppercase font-bold text-slate-400">{s.priority} Priority</span>
                            <span className="text-[10px] text-slate-500 font-semibold">{s.opportunity?.organization}</span>
                          </div>
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

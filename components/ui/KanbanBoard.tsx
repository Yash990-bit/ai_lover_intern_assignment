/* components/ui/KanbanBoard.tsx */
'use client';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import type { SavedOpportunity, ApplicationStatus, Priority } from '@/types';

// Columns representing the pipeline stages
const COLUMNS: { id: string; label: string; color: string; type: 'status' | 'priority' }[] = [
  { id: 'Saved', label: 'Saved', color: 'bg-slate-100', type: 'status' },
  { id: 'Medium', label: 'Medium Priority', color: 'bg-amber-100', type: 'priority' },
  { id: 'Planning', label: 'Planning to Apply', color: 'bg-purple-100', type: 'status' },
];

interface KanbanBoardProps {
  savedOpps: SavedOpportunity[];
  /**
   * Called when a card is moved to a new column.
   * `newStatus` is the column identifier, `newPriority` is optional (we set Medium for "Medium" column, Low otherwise).
   */
  onStatusChange: (id: string, newStatus: ApplicationStatus, newPriority: Priority) => Promise<void>;
}

export default function KanbanBoard({ savedOpps, onStatusChange }: KanbanBoardProps) {
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    // No change
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const opp = savedOpps.find((o) => o.id === draggableId);
    if (!opp) return;

    let newStatus: ApplicationStatus = opp.application_status;
    let newPriority: Priority = opp.priority;

    if (destination.droppableId === 'Saved') {
      newStatus = 'Saved';
      newPriority = 'Low';
    } else if (destination.droppableId === 'Planning') {
      newStatus = 'Planning to Apply';
      newPriority = 'Low';
    } else if (destination.droppableId === 'Medium') {
      // priority column – keep status unchanged
      newPriority = 'Medium';
    }
    await onStatusChange(draggableId, newStatus, newPriority);
  };

  return (
    <section className="bg-white/30 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-slate-200/60">
      <h2 className="text-2xl font-extrabold text-slate-800 mb-4">Application Tracker</h2>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {COLUMNS.map((col) => (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-col gap-4 min-h-[400px] p-4 rounded-xl ${col.color}`}
                >
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{col.label}</h3>
                  {savedOpps
                    .filter((opp) =>
                      col.type === 'status'
                        ? opp.application_status === (col.id === 'Planning' ? 'Planning to Apply' : col.id)
                        : opp.priority === (col.id === 'Medium' ? 'Medium' : 'Low')
                    )
                    .map((opp, index) => (
                      <Draggable key={opp.id} draggableId={opp.id} index={index}>
                        {(providedCard, snapshot) => (
                          <div
                            ref={providedCard.innerRef}
                            {...providedCard.draggableProps}
                            {...providedCard.dragHandleProps}
                            aria-grabbed={snapshot.isDragging}
                            tabIndex={0}
                            className="flex flex-col h-full"
                          >
                            <motion.article
                              layout
                              whileHover={{
                                scale: 1.02,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                              }}
                              className="flex flex-col h-full"
                            >
                              <OpportunityCard opportunity={opp.opportunity!} />
                            </motion.article>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </section>
  );
}

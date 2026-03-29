"use client"

import React, { useState } from "react"
import Link from "next/link"
import { FileText, Image as ImageIcon, Link as LinkIcon, Type, Zap, Trash2 } from "lucide-react"
import { DataSource } from "@/types"
import ConfirmDeleteModal from "./ConfirmDeleteModal"
import SourcesModal from "./SourcesModal"

interface KnowledgeSourcesListProps {
   sources: DataSource[];
   botId: string;
   onDeleteSource: (sourceId: string) => Promise<void>;
}

export default function KnowledgeSourcesList({ sources, botId, onDeleteSource }: KnowledgeSourcesListProps) {
   const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
   const [stagedForDeletion, setStagedForDeletion] = useState<DataSource | null>(null);
   const [isDeleting, setIsDeleting] = useState(false);

   const handleConfirmDelete = async () => {
      if (!stagedForDeletion) return;
      setIsDeleting(true);
      try {
         await onDeleteSource(stagedForDeletion.id);
         setStagedForDeletion(null);
         
         // If we delete the last item causing the open modal to exceed bounds, we could optionally close it
         // but letting React handle the re-render with less sources is fine.
         if (sources.length - 1 <= 3) {
             setIsSourcesModalOpen(false);
         }
      } finally {
         setIsDeleting(false);
      }
   };

   if (sources.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-orange-50 rounded-[32px] bg-orange-50/10">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-300 mb-4">
               <FileText size={32} />
            </div>
            <h4 className="font-bold text-gray-900 mb-1">No sources uploaded</h4>
            <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">Your persona needs data to become a specialized mentor.</p>
            <Link 
               href={`/dashboard/${botId}/ingest`}
               className="px-6 py-2 bg-white border border-orange-100 text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all font-sans"
            >
               Upload Now
            </Link>
         </div>
      );
   }

   const displayedSources = sources.slice(0, 3);
   const hasMore = sources.length > 3;

   return (
      <div className="space-y-4">
         {displayedSources.map(source => (
            <div key={source.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-orange-50/50 transition-colors border-2 border-transparent hover:border-orange-100 rounded-2xl group flex-wrap sm:flex-nowrap gap-4">
               <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-400 shrink-0">
                     {source.type === 'pdf' && <FileText size={20} />}
                     {source.type === 'image' && <ImageIcon size={20} />}
                     {source.type === 'web_link' && <LinkIcon size={20} />}
                     {source.type === 'long_text' && <Type size={20} />}
                     {source.type === 'video_link' && <Zap size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                     <h5 className="font-bold text-gray-900 truncate pr-2">{source.title}</h5>
                     <span className={`text-[10px] font-black uppercase tracking-widest ${
                        source.status === 'completed' ? 'text-green-500' : 
                        source.status === 'failed' ? 'text-red-500' : 'text-orange-500 animate-pulse'
                     }`}>
                        {source.status}
                     </span>
                  </div>
               </div>
               
               <button 
                  onClick={() => setStagedForDeletion(source)}
                  className="p-3 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm opacity-100 md:opacity-0 group-hover:opacity-100 shrink-0"
                  title="Delete source"
               >
                  <Trash2 size={18} />
               </button>
            </div>
         ))}

         <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {hasMore && (
               <button 
                  onClick={() => setIsSourcesModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm"
               >
                  View All ({sources.length}) Sources
               </button>
            )}
            <Link 
               href={`/dashboard/${botId}/ingest`}
               className="w-full sm:w-auto px-6 py-2 bg-orange-50 text-orange-600 font-bold rounded-xl hover:bg-orange-500 hover:text-white transition-all font-sans text-sm text-center"
            >
               + Add More Sources
            </Link>
         </div>

         {/* Modals */}
         <SourcesModal 
            isOpen={isSourcesModalOpen}
            onClose={() => setIsSourcesModalOpen(false)}
            sources={sources}
            onDeleteClick={(source) => setStagedForDeletion(source)}
         />

         <ConfirmDeleteModal 
            isOpen={stagedForDeletion !== null}
            onClose={() => setStagedForDeletion(null)}
            onConfirm={handleConfirmDelete}
            sourceTitle={stagedForDeletion?.title || ''}
            isDeleting={isDeleting}
         />
      </div>
   );
}
